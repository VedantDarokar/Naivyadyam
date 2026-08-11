const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlugOrId,
  createProductReview,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/categories/all', getCategories);
router.get('/:slugOrId', getProductBySlugOrId);
router.post('/:id/reviews', protect, createProductReview);

// Admin Routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
