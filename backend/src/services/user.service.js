// src/services/user.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class UserService {
  static async getUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: true,
        addresses: true,
      },
    });
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }

  static async addAddress(userId, addressData) {
    return await prisma.address.create({
      data: {
        ...addressData,
        userId,
      },
    });
  }

  static async updateAddress(userId, addressId, addressData) {
    // First, verify the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: { id: parseInt(addressId), userId },
    });
    if (!existingAddress) {
      throw new ApiError(404, 'Address not found or you do not have permission to edit it.');
    }

    return await prisma.address.update({
      where: { id: parseInt(addressId) },
      data: addressData,
    });
  }

  static async deleteAddress(userId, addressId) {
    // Verify the address belongs to the user before deleting
    const existingAddress = await prisma.address.findFirst({
      where: { id: parseInt(addressId), userId },
    });
    if (!existingAddress) {
      throw new ApiError(404, 'Address not found or you do not have permission to delete it.');
    }

    return await prisma.address.delete({
      where: { id: parseInt(addressId) },
    });
  }
}

module.exports = UserService;