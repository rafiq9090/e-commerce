// src/services/supplier.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class SupplierService {
  static async createSupplier(supplierData) {
    return await prisma.supplier.create({
      data: supplierData,
    });
  }

  static async getAllSuppliers() {
    return await prisma.supplier.findMany();
  }

  static async getSupplierById(supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(supplierId) },
      include: { products: true }, // Include products associated with this supplier
    });
    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }
    return supplier;
  }

  static async updateSupplier(supplierId, supplierData) {
    return await prisma.supplier.update({
      where: { id: parseInt(supplierId) },
      data: supplierData,
    });
  }

  static async deleteSupplier(supplierId) {
    try {
      return await prisma.supplier.delete({
        where: { id: parseInt(supplierId) },
      });
    } catch (error) {
      // Prisma's P2003 error code is for foreign key constraint violations
      if (error.code === 'P2003') {
        throw new ApiError(409, 'Cannot delete supplier. They are still associated with existing products.');
      }
      throw error;
    }
  }
}

module.exports = SupplierService;