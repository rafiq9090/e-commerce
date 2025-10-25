// src/routes/auth.routes.js
const express = require('express');
const { 
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
 } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware'); // 1. Import this

const router = express.Router();

// --- Public Routes ---
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// --- Protected Route ---
router.post('/logout', authenticate, logout); // 2. Add the 'authenticate' middleware here

module.exports = router;