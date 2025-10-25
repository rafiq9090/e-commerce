// src/routes/cart.routes.js
const express = require('express');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
} = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

// All cart routes are protected and require a user to be logged in
router.use(authenticate);

router.route('/').get(getCart);
router.route('/items').post(addItem);
router.route('/items/:itemId').put(updateItem).delete(removeItem);

module.exports = router;