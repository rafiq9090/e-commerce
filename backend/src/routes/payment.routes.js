const express = require('express');
const {
  createBkashPayment,
  bkashCallback,
  createNagadPayment,
  nagadCallback,
} = require('../controllers/payment.controller');

const router = express.Router();

router.post('/bkash/create', createBkashPayment);
router.get('/bkash/callback', bkashCallback);

router.post('/nagad/create', createNagadPayment);
router.get('/nagad/callback', nagadCallback);

module.exports = router;
