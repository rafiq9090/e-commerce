// src/routes/order.routes.js
const express = require('express');
const {
  placeOrder,
  getOrderHistory,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  trackOrderPublic,
  trackOrderSecure,
  getPhoneOrderStats,
  cancelOrder,
  getOrderStatistics
} = require('../controllers/order.controller');
const { authenticate, authorize, sofAuthenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// PUBLIC ROUTES
router.get('/track/:orderId', trackOrderPublic);
router.get('/phone-stats', getPhoneOrderStats);
router.post('/track/secure', trackOrderSecure);

// CUSTOMER ROUTES (Guest + Authenticated)
router.post('/', sofAuthenticate, placeOrder);

// AUTHENTICATED CUSTOMER ROUTES
router.get('/my-orders', authenticate, getOrderHistory);
router.get('/:id', authenticate, getOrderDetails);
router.patch('/:id/cancel', authenticate, cancelOrder);

// ADMIN ROUTES
router.get('/admin/overview', authenticate, authorize('can_manage_orders'), getOrderStatistics);
router.get('/admin/list', authenticate, authorize('can_manage_orders'), getAllOrders);
router.put('/admin/:id/status', authenticate, authorize('can_manage_orders'), updateOrderStatus);

module.exports = router;
