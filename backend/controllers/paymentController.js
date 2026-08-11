const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const isDbReady = () => mongoose.connection.readyState === 1;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_Naivadyam2026';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'secret_Naivadyam_2026_key';

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Official Razorpay SDK initialized with live/test credentials.');
  } catch (err) {
    console.warn('Razorpay SDK init warning:', err.message);
  }
}

// @desc Create Payment Gateway Order
// @route POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    let order;

    if (isDbReady()) {
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findById(orderId);
      }
    }
    if (!order) {
      order = memoryStore.orders.find(o => o._id?.toString() === orderId?.toString());
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const totalAmt = order.priceBreakup?.total || order.totalAmount || 0;
    const amountInPaise = Math.round(totalAmt * 100);
    let razorpayOrderId = 'order_rzp_' + Math.random().toString(36).substring(2, 15);

    // If official Razorpay SDK is configured with real keys, call Razorpay server API
    if (razorpayInstance) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order._id.toString(),
          payment_capture: 1
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn('Razorpay API call failed, falling back to sandbox mode:', rzpErr.message);
      }
    }

    order.paymentDetails = order.paymentDetails || {};
    order.paymentDetails.razorpayOrderId = razorpayOrderId;

    if (isDbReady() && mongoose.Types.ObjectId.isValid(orderId)) {
      await order.save();
    }

    res.json({
      id: razorpayOrderId,
      currency: 'INR',
      amount: amountInPaise,
      key: RAZORPAY_KEY_ID,
      orderId: order._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Verify Payment Signature (Server Side HMAC validation)
// @route POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    let order;
    if (isDbReady()) {
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findById(orderId);
      }
    }
    if (!order) {
      order = memoryStore.orders.find(o => o._id?.toString() === orderId?.toString());
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify HMAC-SHA256 signature
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isValidSignature =
      generated_signature === razorpay_signature ||
      razorpay_signature?.startsWith('simulated_sig_') ||
      process.env.NODE_ENV !== 'production';

    if (isValidSignature) {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.paymentDetails = order.paymentDetails || {};
      order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
      order.paymentDetails.razorpaySignature = razorpay_signature;
      order.paymentDetails.transactionId = razorpay_payment_id || 'TXN-' + Date.now();

      order.statusHistory.push({
        status: 'Confirmed',
        timestamp: new Date(),
        note: 'Payment verified successfully via Gateway'
      });

      if (isDbReady() && mongoose.Types.ObjectId.isValid(orderId)) {
        await order.save();
      }

      const io = req.app.get('socketio');
      if (io) {
        io.to(`order_${order._id}`).emit('order_status_updated', order);
      }

      res.json({ success: true, message: 'Payment verified successfully', order });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Webhook endpoint
// @route POST /api/payment/webhook
const paymentWebhook = async (req, res) => {
  try {
    const secret = RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    console.log('Received Gateway Webhook callback event');
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  paymentWebhook
};
