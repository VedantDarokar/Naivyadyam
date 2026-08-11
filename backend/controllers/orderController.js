const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const isDbReady = () => mongoose.connection.readyState === 1;

// @desc Create New Order
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, items, shippingAddress, paymentMethod, couponCode } = req.body;
    const rawItems = orderItems || items || [];

    if (!rawItems || rawItems.length === 0) {
      return res.status(400).json({ message: 'No order items specified' });
    }

    const formattedItems = rawItems.map(item => ({
      product: item.product || item._id,
      title: item.title || 'Naivadyam Premix Item',
      image: item.image || item.images?.[0] || '',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || item.qty || 1)
    }));

    let subtotal = 0;
    for (const item of formattedItems) {
      subtotal += item.price * item.quantity;
    }

    let discountAmount = 0;
    let appliedCouponCode = '';

    if (couponCode) {
      if (isDbReady()) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (coupon && subtotal >= coupon.minOrderValue) {
          discountAmount = coupon.discountType === 'percentage' ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount) : coupon.discountValue;
          appliedCouponCode = coupon.code;
        }
      } else {
        const coupon = memoryStore.coupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);
        if (coupon && subtotal >= coupon.minOrderValue) {
          discountAmount = coupon.discountType === 'percentage' ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount) : coupon.discountValue;
          appliedCouponCode = coupon.code;
        }
      }
    }

    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round((subtotal - discountAmount) * 0.05);
    const total = subtotal - discountAmount + tax + shipping;

    const initialHistory = [{
      status: 'Placed',
      timestamp: new Date(),
      note: 'Order successfully placed by customer'
    }];

    const trackingId = 'TRK-' + Math.floor(10000000 + Math.random() * 90000000);

    const newOrderData = {
      user: req.user._id,
      orderItems: formattedItems,
      items: formattedItems,
      shippingAddress,
      paymentMethod: (paymentMethod && paymentMethod.toLowerCase() === 'cod') ? 'COD' : 'Razorpay',
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      totalAmount: total,
      priceBreakup: { subtotal, discount: discountAmount, tax, shipping, total },
      statusHistory: initialHistory,
      trackingDetails: {
        courierName: 'Express FastTrack Logistics',
        trackingId,
        currentLocation: 'Main Hub Fulfillment Center',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      },
      priceBreakup: { subtotal, discount: discountAmount, tax, shipping, total },
      couponApplied: { code: appliedCouponCode, discountAmount },
      createdAt: new Date()
    };

    if (isDbReady()) {
      const order = new Order(newOrderData);
      const createdOrder = await order.save();

      // Decrement product stock
      for (const item of formattedItems) {
        if (mongoose.Types.ObjectId.isValid(item.product)) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
      }

      return res.status(201).json(createdOrder);
    } else {
      newOrderData._id = 'ord_' + Date.now();
      memoryStore.orders.unshift(newOrderData);
      return res.status(201).json(newOrderData);
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged in user orders
// @route GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    if (isDbReady()) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json({ orders, total: orders.length });
    } else {
      const orders = memoryStore.orders.filter(o => o.user._id?.toString() === req.user._id?.toString() || o.user === req.user._id || o.user?.email === req.user.email);
      return res.json({ orders, total: orders.length });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get order by ID
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    let order;
    if (isDbReady()) {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await Order.findById(req.params.id).populate('user', 'name email phone');
      }
    } else {
      order = memoryStore.orders.find(o => o._id.toString() === req.params.id.toString());
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update Order Status (Admin) & Broadcast Realtime Socket Event
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, courierName, trackingId, currentLocation } = req.body;

    let order;
    if (isDbReady()) {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await Order.findById(req.params.id);
      }
    } else {
      order = memoryStore.orders.find(o => o._id.toString() === req.params.id.toString());
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    if (status === 'Delivered') order.paymentStatus = 'Paid';
    if (courierName) order.trackingDetails.courierName = courierName;
    if (trackingId) order.trackingDetails.trackingId = trackingId;
    if (currentLocation) order.trackingDetails.currentLocation = currentLocation;

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    if (isDbReady()) {
      await order.save();
    }

    // Broadcast Realtime Update via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        statusHistory: order.statusHistory,
        trackingDetails: order.trackingDetails,
        updatedAt: new Date()
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel Order (User)
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    let order;
    if (isDbReady()) {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await Order.findById(req.params.id);
      }
    } else {
      order = memoryStore.orders.find(o => o._id.toString() === req.params.id.toString());
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Order cancelled by customer'
    });

    if (isDbReady()) {
      await order.save();
    }

    const io = req.app.get('socketio');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Request Return (User)
// @route PUT /api/orders/:id/return
const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    let order;
    if (isDbReady()) {
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await Order.findById(req.params.id);
      }
    } else {
      order = memoryStore.orders.find(o => o._id.toString() === req.params.id.toString());
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.returnRequest = {
      isRequested: true,
      reason: reason || 'Item not as expected',
      status: 'Pending',
      requestedAt: new Date()
    };

    if (isDbReady()) {
      await order.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  requestReturn
};
