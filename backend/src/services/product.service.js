// src/services/product.service.js - IMPROVED VERSION
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ActivityLogService = require('./activityLog.service');

class ProductService {
  static async createProduct(productData) {
    const { inventory, ...data } = productData;
    const { name, description, short_description, regular_price, sale_price, categoryId, supplierId, status, seoTitle, seoDescription, seoKeywords, isFeatured, images } = data;

    // Better slug generation with uniqueness check
    let slug = name.toLowerCase().split(' ').join('-');
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Prepare inventory data efficiently
    // If inventory is passed as a number (quantity), normalize it to object
    // If it's undefined, default to 0
    let inventoryData = { quantity: 0 };
    if (typeof inventory === 'number') {
      inventoryData = { quantity: inventory };
    } else if (typeof inventory === 'object' && inventory !== null) {
      inventoryData = inventory; // Assume it's already { quantity: 50, sku: '...' }
    }

    // Prepare images data
    let imagesData = [];
    if (Array.isArray(images) && images.length > 0) {
      imagesData = images.map((img, index) => ({
        url: img.url,
        altText: name,
        isFeatured: index === 0 // First image is featured
      }));
    }

    return await prisma.product.create({
      data: {
        name,
        slug,
        short_description,
        description,
        regular_price,
        sale_price,
        status,
        categoryId,
        supplierId,
        isFeatured,
        seoTitle,
        seoDescription,
        seoKeywords,
        inventory: {
          create: inventoryData
        },
        images: {
          create: imagesData
        }
      },
      include: {
        inventory: true,
        category: true,
        supplier: true,
        images: true
      },
    });
  }

  static async addImagesToProduct(productId, imageData) {
    const { path, altText, isFeatured } = imageData;

    // ✅ Check if product exists first
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return await prisma.productImage.create({
      data: {
        productId,
        url: path,
        altText,
        isFeatured
      },
    });
  }

  static async getAllProducts(queryParams = {}) {
    const {
      category,
      status, // No default here, logic below handles it
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
      featured
    } = queryParams;

    const where = {};

    // Default to PUBLISHED if undefined. If 'ALL', show all. Otherwise filter by specific status.
    if (status && status !== 'ALL') {
      where.status = status;
    } else if (!status) {
      where.status = 'PUBLISHED';
    }

    if (category) {
      where.category = { name: category };
    }

    if (queryParams.supplier) {
      where.supplier = { name: queryParams.supplier };
    }

    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          supplier: true,
          inventory: true,
          images: true
        },
        orderBy: {
          [sortBy]: order,
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getProductBySlug(slug) {
    console.log('🔍 Service: Finding product by slug:', slug);

    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          supplier: true,
          inventory: true,
          images: true,
          reviews: {
            include: {
              user: {
                include: { profile: true }
              }
            }
          },
        },
      });

      console.log('✅ Service: Query executed, product:', product ? 'found' : 'not found');

      if (!product) {
        console.log('❌ Service: No product found with slug:', slug);
        throw new ApiError(404, 'Product not found');
      }

      return product;
    } catch (error) {
      console.error('❌ Service Error in getProductBySlug:', error);
      console.error('❌ Service Error message:', error.message);
      throw error;
    }
  }

  static async updateProduct(productId, productData, adminId) {
    const { inventory, ...data } = productData;
    const { isFeatured, name, description, short_description, regular_price, sale_price, status, categoryId, supplierId, seoTitle, seoDescription, seoKeywords, images } = data;

    let slug;
    if (name) {
      slug = name.toLowerCase().split(' ').join('-');
      // ✅ Check for slug uniqueness (excluding current product)
      const existingProduct = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id: productId }
        }
      });

      if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // ✅ Build update data dynamically
    const updateData = {
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
    };

    // Only include inventory if provided
    if (inventory !== undefined && inventory !== null) {
      let inventoryData = {};
      if (typeof inventory === 'number') {
        inventoryData = { quantity: inventory };
      } else if (typeof inventory === 'object') {
        inventoryData = inventory; // e.g. { quantity: 50, sku: 'ABC' }
      }

      updateData.inventory = {
        update: inventoryData
      };
    }

    // Handle Images: Delete old ones and create new ones if 'images' array is provided
    // Note: This is a robust strategy for "replacing" the list.
    if (Array.isArray(images)) {
      // Use a transaction to modify relation
      // We can't do deleteMany inside regular update directly in same step nicely for one-to-many
      // So we will perform a transaction wrapper or two steps.
      // For simplicity, we'll do delete + create inside an interactive transaction, 
      // BUT prisma update allows 'deleteMany' then 'create'.

      updateData.images = {
        deleteMany: {}, // Delete ALL existing images for this product
        create: images.map((img, index) => ({
          url: img.url,
          altText: name || 'Product Image', // Fallback
          isFeatured: index === 0
        }))
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        inventory: true,
        category: true,
        supplier: true,
        images: true
      },
    });

    // ✅ Activity log
    await ActivityLogService.createLog({
      actorType: 'Admin',
      actorId: adminId,
      action: 'PRODUCT_UPDATED',
      details: {
        productId: productId,
        productName: updatedProduct.name,
        changes: Object.keys(productData)
      }
    });

    return updatedProduct;
  }

  static async deleteProduct(productId, adminId) { // ✅ Add adminId for logging
    // ✅ Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });

    // ✅ Activity log for deletion
    await ActivityLogService.createLog({
      actorType: 'Admin',
      actorId: adminId,
      action: 'PRODUCT_DELETED',
      details: {
        productId: productId,
        productName: deletedProduct.name
      }
    });

    return deletedProduct;
  }

  // services/product.service.js - CORRECTED VERSION
  // services/product.service.js - FINAL WORKING VERSION
  // services/product.service.js - MINIMAL SAFE VERSION
  static async searchProducts(searchTerm, filters = {}) {
    try {
      console.log('🔍 Service: Searching for:', searchTerm);

      if (!searchTerm || searchTerm.trim() === '') {
        return [];
      }

      const cleanSearchTerm = searchTerm.trim();

      const where = {
        OR: [
          { name: { contains: cleanSearchTerm } },
          { description: { contains: cleanSearchTerm } },
          { short_description: { contains: cleanSearchTerm } }
        ],
        status: 'PUBLISHED'
      };

      console.log(' Prisma where clause:', JSON.stringify(where, null, 2));

      // MINIMAL & SAFE: Only essential fields
      const products = await prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          short_description: true,
          regular_price: true,
          sale_price: true,
          status: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          supplier: {
            select: {
              id: true,
              name: true

            }
          },
          inventory: {
            select: {
              id: true,
              quantity: true
            }
          },
          images: {
            select: {
              id: true,
              url: true

            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        take: 50
      });

      console.log('Found products:', products.length);
      return products;

    } catch (error) {
      console.error('ProductService search error:', error);
      throw new Error('Database search failed: ' + error.message);
    }
  }

  static async getFeaturedProducts(limit = 10) {
    return await prisma.product.findMany({
      where: {
        isFeatured: true,
        status: 'PUBLISHED'
      },
      include: {
        category: true,
        images: true,
        inventory: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  //  NEW: Get related products
  static async getRelatedProducts(productId, limit = 4) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });

    if (!product) {
      return [];
    }

    return await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        status: 'PUBLISHED'
      },
      include: {
        category: true,
        images: true,
        inventory: true,
      },
      take: limit
    });
  }

  // NEW: Update product inventory
  static async updateProductInventory(productId, quantity) {
    return await prisma.productInventory.update({
      where: { productId },
      data: { quantity }
    });
  }
}

module.exports = ProductService;