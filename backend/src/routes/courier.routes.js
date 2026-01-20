const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  createSteadfastOrder,
  createSteadfastBulkOrders,
} = require('../controllers/courier.controller');

const router = express.Router();

router.post('/steadfast/create', authenticate, authorize('can_manage_orders'), createSteadfastOrder);
router.post('/steadfast/bulk', authenticate, authorize('can_manage_orders'), createSteadfastBulkOrders);

module.exports = router;
