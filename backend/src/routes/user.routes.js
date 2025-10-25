// src/routes/user.routes.js
const express = require('express');
const {
  getUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

// All routes in this file are for an authenticated user
router.use(authenticate);

router.route('/profile').get(getUserProfile);
router.route('/addresses').post(addAddress);
router.route('/addresses/:addressId').put(updateAddress).delete(deleteAddress);

module.exports = router;