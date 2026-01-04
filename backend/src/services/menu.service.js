// src/services/menu.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class MenuService {
  // --- Menu Management ---

  static async createMenu(menuData) {
    const { items, ...rest } = menuData;
    const data = { ...rest };
    if (items && Array.isArray(items) && items.length > 0) {
      data.items = { create: items };
    }
    return prisma.menu.create({ data });
  }

  static async getAllMenus() {
    return prisma.menu.findMany({ include: { items: true } });
  }

  static async getMenuByName(name) {
    const menu = await prisma.menu.findUnique({
      where: { name },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });
    if (!menu) {
      throw new ApiError(404, `Menu with name '${name}' not found.`);
    }
    return menu;
  }

  // --- Menu Item Management ---

  static async addMenuItem(itemData) {
    return prisma.menuItem.create({ data: itemData });
  }

  static async updateMenuItem(itemId, itemData) {
    return prisma.menuItem.update({
      where: { id: itemId },
      data: itemData,
    });
  }

  static async deleteMenuItem(itemId) {
    return prisma.menuItem.delete({ where: { id: itemId } });
  }
}

module.exports = MenuService;