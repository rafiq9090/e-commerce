// src/services/product.service.js
const prisma = require('../config/prisma');

const ApiError = require('../utils/ApiError');
const ActivityLogService = require('./activityLog.service');

class ProductService {
  static async createProduct(productData) {
    const { inventory, ...data } = productData;
    const {name, description,short_description, regular_price, sale_price, categoryId, supplierId, status, seoTitle, seoDescription, seoKeywords} = data;
    data.slug = name.toLowerCase().split(' ').join('-');

    return await prisma.product.create({
      data: {
        name,
        slug: data.slug,
        short_description,
        description,
        regular_price,
        sale_price,
        status,
        categoryId,
        supplierId,
        seoTitle,
        seoDescription,
        seoKeywords,
        inventory: {
          create: inventory
        },
      },
      include: { inventory: true },
    });
  }

  static async addImagesToProduct(productId, imageData) {
    const {path, altText, isFeatured} = imageData;
    return await prisma.productImage.create({
      data: {
        productId,
        url:path,
        altText,
        isFeatured
      },
    });
  }

  static async getAllProducts(queryParams) {
    const { category, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = queryParams;

    const where = {};
    if (category) {
      where.category = { name: category };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        inventory: true,
        images:true
      },
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });
    return products;
  }

  static async getProductBySlug(slug) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        supplier: true,
        inventory: true,
        images: true,
        reviews: { include: { user: { include: { profile: true } } } },
      },
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

 static async updateProduct(productId, productData, adminId) { // 1. Add adminId here
    const { inventory, ...data } = productData;
    const { isFeatured, name, description,short_description, regular_price, sale_price, status, categoryId, supplierId, seoTitle, seoDescription, seoKeywords } = data;
    const slug = name ? name.toLowerCase().split(' ').join('-') : undefined;

    // 2. Update the product and store the result in a variable
    const updatedProduct = await prisma.product.update({
      where: { id: productId }, // 3. FIX: Use 'productId' which is passed to the function
      data: {
        name,
        slug,
        description,
        short_description,
        regular_price,
        sale_price,
        categoryId,
        supplierId,
        status,
        isFeatured,
        seoTitle,
        seoDescription,
        seoKeywords,
        inventory: {
          update: inventory,
        },
      },
      include: { inventory: true },
    });
    await ActivityLogService.createLog({
      actorType: 'Admin',
      actorId: adminId,
      action: 'PRODUCT_UPDATED',
      details: { productId: productId, productName: updatedProduct.name }
    });

    // 6. Return the updated product at the very end
    return updatedProduct;
  }

  static async deleteProduct(productId) {
    return await prisma.product.delete({
      where: { id: productId },
    });
  }
  static async searchProducts(searchTerm) {
    if(!searchTerm){
      return [];
    }
    return await prisma.product.findMany({
      where: {
        OR: [
          {name:{search:searchTerm}},
          {description:{search:searchTerm}}
        ],
      },
      include: {
        category: true,
        supplier: true,
        inventory: true,
        images: true,
      },
    });   
      }
   static async getFeaturedProducts() { 
    return await prisma.product.findMany({
      where:{
        isFeatured:true,
        status:'PUBLISHED'
      },
      include: {
        category: true,
        images: true,
        inventory: true,
      },
    })
    }
  }

module.exports = ProductService;