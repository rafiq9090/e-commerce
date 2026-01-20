const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  upsertIncompleteOrder,
  listIncompleteOrders,
  clearIncompleteOrder,
} = require('../controllers/incompleteOrder.controller');

const router = express.Router();

router.post('/', upsertIncompleteOrder);
router.post('/clear', clearIncompleteOrder);
router.get('/admin/list', authenticate, authorize('can_manage_orders'), listIncompleteOrders);

module.exports = router;
