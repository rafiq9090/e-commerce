// src/services/promotion.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class PromotionService {
  // --- Admin Methods ---
  static async createPromotion(promoData) {
    promoData.code = promoData.code.toUpperCase(); // Store codes in uppercase
    return await prisma.promotion.create({ data: promoData });
  }

  static async getAllPromotions() {
    return await prisma.promotion.findMany({
      include: { product: true }
    });
  }

  static async updatePromotion(promoId, promoData) {
    if (promoData.code) {
      promoData.code = promoData.code.toUpperCase();
    }
    return await prisma.promotion.update({
      where: { id: parseInt(promoId) },
      data: promoData,
    });
  }

  static async deletePromotion(promoId) {
    return await prisma.promotion.delete({
      where: { id: parseInt(promoId) },
    });
  }

  // --- Customer Method ---
  static async validatePromotion(code) {
    const promo = await prisma.promotion.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!promo) {
      throw new ApiError(404, 'Invalid or expired promotion code.');
    }

    return promo;
  }
}

module.exports = PromotionService;
