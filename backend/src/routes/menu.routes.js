const express = require('express');
const {
    createMenu,
    getAllMenus,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuByName,
} = require('../controllers/menu.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes
router.get('/:name', getMenuByName);

// Admin-only routes
router.post('/admin', authenticate, authorize('can_manage_menus'), createMenu);
router.get('/admin/all', authenticate, authorize('can_manage_menus'), getAllMenus);
router.post('/admin/items', authenticate, authorize('can_manage_menus'), addMenuItem);
router.put('/admin/items/:itemId', authenticate, authorize('can_manage_menus'), updateMenuItem);
router.delete('/admin/items/:itemId', authenticate, authorize('can_manage_menus'), deleteMenuItem);

// router.post('/admin', adminAuth, createMenu);
// router.get('/admin/all', adminAuth, getAllMenus);

// router.post('/admin/items', adminAuth, addMenuItem);
// router.put('/admin/items/:itemId', adminAuth, updateMenuItem);
// router.delete('/admin/items/:itemId', adminAuth, deleteMenuItem);
module.exports = router;
