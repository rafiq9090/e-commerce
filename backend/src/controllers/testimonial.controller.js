const TestimonialService = require('../services/testimonial.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Public controller to get approved testimonials
const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await TestimonialService.createTestimonial(req.body);
  res.status(201).json(new ApiResponse(201, testimonial, 'Testimonial submitted successfully. It will be reviewed by an admin.'));
});

const getApprovedTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await TestimonialService.getApprovedTestimonials();
  res.status(200).json(new ApiResponse(200, testimonials));
});

// Admin controller to get all testimonials
const getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await TestimonialService.getAllTestimonials();
  res.status(200).json(new ApiResponse(200, testimonials));
});

const approveTestimonial = asyncHandler(async (req, res) => {
  const testimonialId = parseInt(req.params.id);
  if (isNaN(testimonialId)) {
    throw new ApiError(400, 'Invalid testimonial ID');
  }
  const testimonial = await TestimonialService.approveTestimonial(testimonialId);
  res.status(200).json(new ApiResponse(200, testimonial, 'Testimonial approved successfully'));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const { testimonialId } = req.params;
  await TestimonialService.deleteTestimonial(testimonialId);
  res.status(204).send(); // No content response
}); 
module.exports = {
    createTestimonial,
    getApprovedTestimonials,
    getAllTestimonials,
    approveTestimonial,
    deleteTestimonial,
};