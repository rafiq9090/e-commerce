// src/routes/product.routes.js
const express = require('express');
const {
  createProduct,
  uploadProductImage,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts,
  getFeaturedProducts,
} = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware'); 
const router = express.Router();

// Public routes (anyone can view products)
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);
router.get('/featured', getFeaturedProducts);

// Admin-only routes (protected)
router.post('/', authenticate, authorize('can_manage_products'), createProduct);
router.put('/:id', authenticate, authorize('can_manage_products'), updateProduct);
router.delete('/:id', authenticate, authorize('can_manage_products'), deleteProduct);

router.post(
  '/:productId/images',
  authenticate,
  authorize('can_manage_products'),
  upload.single('image'),
  uploadProductImage
);

module.exports = router;