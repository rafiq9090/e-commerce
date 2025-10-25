const express = require('express');
const {
  addToBlocklist,
  getAllBlocked,
  removeFromBlocklist
} = require('../controllers/blocklist.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

const adminAuth = [authenticate, authorize('can_manage_blocklist')];

// Admin-only routes
router.post('/admin', adminAuth, addToBlocklist);
router.get('/admin', adminAuth, getAllBlocked);
router.delete('/admin/:id', adminAuth, removeFromBlocklist);

module.exports = router;