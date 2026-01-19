// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import module routers
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const adminRoutes = require('./admin.routes');
const categoryRoutes = require('./category.routes');
const supplierRoutes = require('./supplier.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const userRoutes = require('./user.routes');
const menuRoutes = require('./menu.routes');
const promotionRoutes = require('./promotion.routes');
const testimonialRoutes = require('./testimonial.routes');
const blocklistRoutes = require('./blocklist.routes');
const activityLogRoutes = require('./activityLog.routes');
const contentRoutes = require('./content.routes');
const newsletterRoutes = require('./newsletter.routes');
const uploadRoutes = require('./upload.routes');


// Use module routers
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/user', userRoutes);
router.use('/menus', menuRoutes);
router.use('/promotions', promotionRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/blocklist', blocklistRoutes);
router.use('/activity-log', activityLogRoutes);
router.use('/content', contentRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
