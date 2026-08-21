const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variant: {
    size: { type: String, default: '' },
    color: { type: String, default: '' }
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, default: 'Home' }
  },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  paymentDetails: {
    transactionId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' }
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Placed'
  },
  trackingDetails: {
    courierName: { type: String, default: 'Express Logistics' },
    trackingId: { type: String, default: '' },
    currentLocation: { type: String, default: 'Sorting Hub' },
    estimatedDelivery: { type: String, default: '' }
  },
  statusHistory: [statusHistorySchema],
  priceBreakup: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  couponApplied: {
    code: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 }
  },
  returnRequest: {
    isRequested: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
    requestedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
