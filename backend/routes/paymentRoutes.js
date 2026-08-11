const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  paymentWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', paymentWebhook);

module.exports = router;
