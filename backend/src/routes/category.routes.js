// src/routes/category.routes.js
const express = require('express');
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// Public route
router.get('/', getAllCategories);

// Admin-only routes
router.post('/', authenticate, authorize('can_manage_categories'), createCategory);
router.put('/:id', authenticate, authorize('can_manage_categories'), updateCategory);
router.delete('/:id', authenticate, authorize('can_manage_categories'), deleteCategory);

module.exports = router;