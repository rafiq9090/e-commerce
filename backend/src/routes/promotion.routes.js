// src/routes/promotion.routes.js
const express = require('express');
const {
  createPromotion,
  getAllPromotions,
  updatePromotion,
  deletePromotion,
  applyPromotion,
} = require('../controllers/promotion.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// --- Admin Routes ---
router
  .route('/admin')
  .post(authenticate, authorize('can_manage_promotions'), createPromotion)
  .get(authenticate, authorize('can_manage_promotions'), getAllPromotions);

router
  .route('/admin/:id')
  .put(authenticate, authorize('can_manage_promotions'), updatePromotion)
  .delete(authenticate, authorize('can_manage_promotions'), deletePromotion);

// --- Customer Route ---
router.post('/apply', authenticate, applyPromotion);

module.exports = router;
