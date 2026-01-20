const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class IncompleteOrderService {
  static async upsertOrder(data) {
    const { clientId, source, name, phone, email, address, city } = data;
    if (!clientId || !source) {
      throw new ApiError(400, 'clientId and source are required');
    }
    if (!name || !phone || !address || !city) {
      throw new ApiError(400, 'name, phone, address, and city are required');
    }

    return prisma.incompleteOrder.upsert({
      where: { clientId_source: { clientId, source } },
      update: { name, phone, email: email || null, address, city },
      create: { clientId, source, name, phone, email: email || null, address, city },
    });
  }

  static async listOrders() {
    return prisma.incompleteOrder.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async clearOrder(clientId, source) {
    if (!clientId || !source) {
      throw new ApiError(400, 'clientId and source are required');
    }
    return prisma.incompleteOrder.deleteMany({
      where: { clientId, source },
    });
  }
}

module.exports = IncompleteOrderService;
