const express = require('express');
const { subscribe, getSubscribers, deleteSubscriber, sendNewProductEmail, sendNewPromotionEmail } = require('../controllers/newsletter.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public subscribe
router.post('/subscribe', subscribe);

// Admin manage
router.get('/', [authenticate, authorize('can_manage_site_content')], getSubscribers);
router.delete('/:id', [authenticate, authorize('can_manage_site_content')], deleteSubscriber);
router.post('/send/product/:id', [authenticate, authorize('can_manage_products')], sendNewProductEmail);
router.post('/send/promotion/:id', [authenticate, authorize('can_manage_promotions')], sendNewPromotionEmail);

module.exports = router;
