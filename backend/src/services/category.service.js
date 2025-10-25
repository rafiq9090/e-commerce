// src/services/category.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class CategoryService {
  static async createCategory(categoryData) {
    const { name, parentId,seoTitle, seoDescription, seoKeywords } = categoryData;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
      return await prisma.category.create({
        data: { 
          name, 
          slug, 
          parentId,
          seoTitle,
          seoDescription,
          seoKeywords
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ApiError(409, `Category with this name already exists.`);
      }
      if (error.code === 'P2003') {
        throw new ApiError(404, `Parent category not found.`);
      }
      throw error;
    }
  }

  static async getAllCategories() {
    // Fetch all categories and build a nested tree structure
    const categories = await prisma.category.findMany({
      include: { children: true },
    });

    const categoryMap = {};
    const nestedCategories = [];

    categories.forEach(category => {
      categoryMap[category.id] = { ...category, children: [] };
    });

    categories.forEach(category => {
      if (category.parentId) {
        categoryMap[category.parentId].children.push(categoryMap[category.id]);
      } else {
        nestedCategories.push(categoryMap[category.id]);
      }
    });

    return nestedCategories;
  }

  static async updateCategory(categoryId, categoryData) {
    const {name, parentId, isFeatured ,seoTitle, seoDescription, seoKeywords} = categoryData;
    const slug = name ? name.toLowerCase().split(' ').join('-') : undefined;
    try {
      return await prisma.category.update({
        where: { id: parseInt(categoryId) },
        data:{
          name,
          slug,
          parentId,
          isFeatured,
          seoTitle,
          seoDescription,
          seoKeywords
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ApiError(404, `Category with id ${categoryId} not found.`);
      }
      if (error.code === 'P2002') {
        throw new ApiError(409, `Category with this name already exists.`);
      }
      throw error;
    }
  }

  static async deleteCategory(categoryId) {
    try {
      return await prisma.category.delete({
        where: { id: parseInt(categoryId) },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ApiError(404, `Category with id ${categoryId} not found.`);
      }
      if (error.code === 'P2003') { // Foreign key constraint failed
        throw new ApiError(409, 'Cannot delete category. It is still associated with products or sub-categories.');
      }
      throw error;
    }
  }
  static async getFeaturedCategories() {
    return await prisma.category.findMany({
      where: { isFeatured: true },
    });
  }
}

module.exports = CategoryService;