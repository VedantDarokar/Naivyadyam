const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/block', toggleUserBlock);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/tickets', getTickets);
router.put('/tickets/:id', updateTicket);
router.delete('/tickets/:id', deleteTicketForAdmin);

module.exports = router;
