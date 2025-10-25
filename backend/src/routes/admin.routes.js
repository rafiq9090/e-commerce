// src/routes/admin.routes.js
const express = require('express');
const { registerAdmin, loginAdmin } = require('../controllers/admin.controller');
const router = express.Router();


router.post('/register', registerAdmin);

router.post('/login', loginAdmin);

module.exports = router;