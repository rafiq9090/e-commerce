// src/routes/activityLog.routes.js
const express = require('express');
const { getLogs } = require('../controllers/activityLog.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/admin', [authenticate, authorize('can_view_activity_log')], getLogs);

module.exports = router;