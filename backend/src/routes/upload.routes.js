const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { uploadFile } = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Generic upload endpoint - protected (Authenticated users can upload, e.g. Admin)
router.post('/', authenticate, upload.single('file'), uploadFile);

module.exports = router;
