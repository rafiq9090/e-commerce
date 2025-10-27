// src/routes/product.routes.js - ALTERNATIVE BETTER STRUCTURE
const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware'); 

const router = express.Router();

// 🔵 PUBLIC ROUTES
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/related/:productId', productController.getRelatedProducts);
router.get('/slug/:slug', productController.getProductBySlug);

// 🔴 ADMIN ROUTES - Product Management
router.post('/', authenticate, authorize('can_manage_products'), productController.createProduct);
router.get('/admin/:id', authenticate, authorize('can_manage_products'), productController.getProductById);
router.put('/:id', authenticate, authorize('can_manage_products'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('can_manage_products'), productController.deleteProduct);

// ADMIN ROUTES - Product Images
router.post(
  '/:productId/images',
  authenticate,
  authorize('can_manage_products'),
  upload.single('image'),
  productController.uploadProductImage
);

// ADMIN ROUTES - Inventory Management
router.patch(
  '/:productId/inventory',
  authenticate,
  authorize('can_manage_products'),
  productController.updateProductInventory
);

module.exports = router;