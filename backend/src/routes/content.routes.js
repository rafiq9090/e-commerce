const express = require('express');
const { getAllContent, updateContent } = require('../controllers/content.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// --- Public Route ---
// For the frontend to fetch all site content
router.get('/', getAllContent);

// --- Admin Route ---
// For the admin panel to update content
router.put('/', [authenticate, authorize('can_manage_site_content')], updateContent);

module.exports = router;