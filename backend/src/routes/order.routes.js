// src/routes/order.routes.js
const express = require('express');
const {
  placeOrder,
  getOrderHistory,
  getAllOrders,
  updateOrderStatus,
  trackOrder
} = require('../controllers/order.controller');
const { authenticate, authorize , sofAuthenticate } = require('../middleware/auth.middleware');
const router = express.Router();

// The checkout endpoint can now be used by guests OR logged-in users
router.post('/', sofAuthenticate, placeOrder);
router.post('/track', trackOrder);

// --- Customer Routes ---
router.get('/', authenticate,getOrderHistory)

// --- Admin-only Routes (require strict login and permissions) ---
router.get('/admin/all', authenticate, authorize('can_manage_orders'), getAllOrders);
router.put('/admin/:orderId/status', authenticate, authorize('can_manage_orders'), updateOrderStatus);

module.exports = router;