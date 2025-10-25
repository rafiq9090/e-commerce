// src/routes/supplier.routes.js
const express = require('express');
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplier.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);

// Admin-only routes
router.post('/', authenticate, authorize('can_manage_suppliers'), createSupplier);
router.put('/:id', authenticate, authorize('can_manage_suppliers'), updateSupplier);
router.delete('/:id', authenticate, authorize('can_manage_suppliers'), deleteSupplier);

module.exports = router;