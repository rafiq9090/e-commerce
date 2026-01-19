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

const updatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const promo = await PromotionService.updatePromotion(id, req.body);
  res.status(200).json(new ApiResponse(200, promo, 'Promotion updated'));
});

const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await PromotionService.deletePromotion(id);
  res.status(200).json(new ApiResponse(200, null, 'Promotion deleted'));
});

// --- Customer ---
const applyPromotion = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const promo = await PromotionService.validatePromotion(code);
  res.status(200).json(new ApiResponse(200, promo, 'Promotion is valid'));
});

module.exports = { createPromotion, getAllPromotions, updatePromotion, deletePromotion, applyPromotion };
