const express = require('express');
const router = express.Router();
const {
  sendRegistrationOtp,
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  toggleWishlist
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.post('/wishlist/toggle', protect, toggleWishlist);

module.exports = router;
