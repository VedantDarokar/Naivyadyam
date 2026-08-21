const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Ticket = require('../models/Ticket');
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');
const { sendTicketReplyNotification } = require('../utils/otpService');

const isDbReady = () => mongoose.connection.readyState === 1;

// Helper to calculate real monthly sales dynamically from actual orders
const calculateRealMonthlySales = (allOrders) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      monthLabel: monthNames[d.getMonth()],
      sales: 0
    });
  }

  allOrders.forEach(order => {
    if (order.paymentStatus === 'Paid' || order.orderStatus === 'Delivered') {
      const orderDate = new Date(order.createdAt || Date.now());
      const amount = order.priceBreakup?.total || order.totalAmount || 0;
      const target = months.find(m => m.year === orderDate.getFullYear() && m.monthIndex === orderDate.getMonth());
      if (target) {
        target.sales += amount;
      }
    }
  });

  return months.map(m => ({ month: m.monthLabel, sales: m.sales }));
};

// @desc Get Dashboard Analytics Stats
// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    if (isDbReady()) {
      const totalOrders = await Order.countDocuments({});
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const totalProducts = await Product.countDocuments({});
      const allOrders = await Order.find({});
      const paidOrders = allOrders.filter(o => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered');
      const totalRevenue = paidOrders.reduce((acc, item) => acc + (item.priceBreakup?.total || item.totalAmount || 0), 0);
      const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).select('title stock price images category');
      const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

      const monthlySales = calculateRealMonthlySales(allOrders);

      return res.json({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        recentOrders,
        monthlySales
      });
    } else {
      // Memory Store fallback
      const totalOrders = memoryStore.orders.length;
      const totalCustomers = memoryStore.users.filter(u => u.role === 'customer').length;
      const totalProducts = memoryStore.products.length;
      const paidOrders = memoryStore.orders.filter(o => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered');
      const totalRevenue = paidOrders.reduce((acc, item) => acc + (item.priceBreakup?.total || item.totalAmount || 0), 0);
      const lowStockProducts = memoryStore.products.filter(p => p.stock <= 5);
      const recentOrders = memoryStore.orders.slice(0, 5);

      const monthlySales = calculateRealMonthlySales(memoryStore.orders);

      return res.json({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        recentOrders,
        monthlySales
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders (Admin)
// @route GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const status = req.query.status;
    if (isDbReady()) {
      const query = status ? { orderStatus: status } : {};
      const orders = await Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      let orders = [...memoryStore.orders];
      if (status) orders = orders.filter(o => o.orderStatus === status);
      return res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all customers
// @route GET /api/admin/customers
const getAllCustomers = async (req, res) => {
  try {
    if (isDbReady()) {
      const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
      return res.json(customers);
    } else {
      const customers = memoryStore.users.filter(u => u.role === 'customer');
      return res.json(customers);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle User Block Status
// @route PUT /api/admin/customers/:id/block
const toggleUserBlock = async (req, res) => {
  try {
    if (isDbReady()) {
      const user = await User.findById(req.params.id);
      if (user) {
        user.isBlocked = !user.isBlocked;
        await user.save();
        return res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: user.isBlocked });
      }
    } else {
      const user = memoryStore.users.find(u => u._id === req.params.id);
      if (user) {
        user.isBlocked = !user.isBlocked;
        return res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: user.isBlocked });
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Coupons
// @route GET /api/admin/coupons
const getCoupons = async (req, res) => {
  try {
    if (isDbReady()) {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
      return res.json(coupons);
    } else {
      return res.json(memoryStore.coupons);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create Coupon
// @route POST /api/admin/coupons
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate } = req.body;
    const newCoupon = {
      _id: 'coup_' + Date.now(),
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: Number(maxDiscount || 1000),
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usedCount: 0,
      isActive: true
    };

    if (isDbReady()) {
      const coupon = new Coupon(newCoupon);
      const created = await coupon.save();
      return res.status(201).json(created);
    } else {
      memoryStore.coupons.unshift(newCoupon);
      return res.status(201).json(newCoupon);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete Coupon
// @route DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    if (isDbReady()) {
      const coupon = await Coupon.findById(req.params.id);
      if (coupon) {
        await coupon.deleteOne();
        return res.json({ message: 'Coupon deleted' });
      }
    } else {
      memoryStore.coupons = memoryStore.coupons.filter(c => c._id !== req.params.id);
      return res.json({ message: 'Coupon deleted' });
    }
    res.status(404).json({ message: 'Coupon not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Tickets (Excluding soft deleted by admin)
// @route GET /api/admin/tickets
const getTickets = async (req, res) => {
  try {
    if (isDbReady()) {
      const tickets = await Ticket.find({ deletedByAdmin: { $ne: true } }).sort({ createdAt: -1 });
      return res.json(tickets);
    } else {
      const tickets = (memoryStore.tickets || []).filter(t => !t.deletedByAdmin);
      return res.json(tickets);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete Ticket from Admin view (Stays in User profile)
// @route DELETE /api/admin/tickets/:id
const deleteTicketForAdmin = async (req, res) => {
  try {
    if (isDbReady()) {
      const ticket = await Ticket.findById(req.params.id);
      if (ticket) {
        ticket.deletedByAdmin = true;
        await ticket.save();
        return res.json({ message: 'Ticket removed from admin view' });
      }
    } else {
      const ticket = (memoryStore.tickets || []).find(t => t._id === req.params.id);
      if (ticket) {
        ticket.deletedByAdmin = true;
        return res.json({ message: 'Ticket removed from admin view' });
      }
    }
    res.status(404).json({ message: 'Ticket not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update Ticket Response & Status
// @route PUT /api/admin/tickets/:id
const updateTicket = async (req, res) => {
  try {
    const { response, status } = req.body;
    let targetTicket;

    if (isDbReady()) {
      targetTicket = await Ticket.findById(req.params.id);
      if (targetTicket) {
        if (response) targetTicket.response = response;
        if (status) targetTicket.status = status;
        await targetTicket.save();
      }
    } else {
      targetTicket = memoryStore.tickets.find(t => t._id === req.params.id);
      if (targetTicket) {
        if (response) targetTicket.response = response;
        if (status) targetTicket.status = status;
      }
    }

    if (!targetTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Send async email notification to customer about admin response / status change
    sendTicketReplyNotification(targetTicket, response, status).catch(err => {
      console.error('Ticket reply notification email error:', err.message);
    });

    return res.json(targetTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  getAllCustomers,
  toggleUserBlock,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getTickets,
  updateTicket,
  deleteTicketForAdmin
};
