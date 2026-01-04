const express = require('express');
const { registerAdmin, loginAdmin, getRoles, getAdmins } = require('../controllers/admin.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');
const router = express.Router();

// Public Routes
router.post('/login', loginAdmin);

// Protected Routes (Super Admin Only)
router.post('/register', authenticate, authorizeRole('SUPER_ADMIN'), registerAdmin);
router.get('/admins', authenticate, authorizeRole('SUPER_ADMIN'), getAdmins);
router.get('/roles', authenticate, authorizeRole('SUPER_ADMIN'), getRoles);

module.exports = router;