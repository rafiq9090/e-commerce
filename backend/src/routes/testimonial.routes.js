const express = require('express');
const {
  createTestimonial,
  getApprovedTestimonials,
  getAllTestimonials,
  approveTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonial.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// --- Public Routes ---
router.post('/', createTestimonial);
router.get('/', getApprovedTestimonials);

// --- Admin Routes ---
const adminAuth = [authenticate, authorize('can_manage_testimonials')];

router.get('/admin/all', adminAuth, getAllTestimonials);
router.put('/admin/approve/:id', adminAuth, approveTestimonial);
router.delete('/admin/delete/:id', adminAuth, deleteTestimonial);

module.exports = router;