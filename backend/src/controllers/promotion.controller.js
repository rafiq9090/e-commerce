// src/controllers/promotion.controller.js
const PromotionService = require('../services/promotion.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// --- Admin ---
const createPromotion = asyncHandler(async (req, res) => {
  const promo = await PromotionService.createPromotion(req.body);
  res.status(201).json(new ApiResponse(201, promo, 'Promotion created'));
});

const getAllPromotions = asyncHandler(async (req, res) => {
  const promos = await PromotionService.getAllPromotions();
  res.status(200).json(new ApiResponse(200, promos));
});
// ... (controllers for update and delete would be similar)

// --- Customer ---
const applyPromotion = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const promo = await PromotionService.validatePromotion(code);
  res.status(200).json(new ApiResponse(200, promo, 'Promotion is valid'));
});

module.exports = { createPromotion, getAllPromotions, applyPromotion };