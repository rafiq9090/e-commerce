// src/controllers/product.controller.js - IMPROVED VERSION
const ProductService = require('../services/product.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  //  Validate required fields
  if (!productData.name || !productData.regular_price || !productData.categoryId) {
    throw new ApiError(400, 'Name, regular price, and category are required');
  }

  const product = await ProductService.createProduct(productData);
  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

const uploadProductImage = asyncHandler(async (req, res) => {
  console.log('--- Reached uploadProductImage controller ---');
  console.log('File:', req.file);
  
  const { productId } = req.params;
  const { altText, isFeatured } = req.body;
  
  //  Validate inputs
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }
  
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded.');
  }
  
  const imageData = {
    path: req.file.path,
    altText: altText || req.file.originalname,
    isFeatured: isFeatured === 'true',
  };
  
  const image = await ProductService.addImagesToProduct(productId, imageData);
  res.status(201).json(new ApiResponse(201, image, 'Image uploaded successfully'));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await ProductService.getAllProducts(req.query);
  res.status(200).json(new ApiResponse(200, products, 'Products fetched successfully'));
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  console.log('Backend: Fetching product by slug:', slug);
  
  if (!slug) {
    console.log(' Backend: Slug is missing');
    throw new ApiError(400, 'Product slug is required');
  }

  try {
    console.log('Backend: Calling ProductService.getProductBySlug');
    const product = await ProductService.getProductBySlug(slug);
    console.log('Backend: Product found:', product ? product.id : 'null');
    
    if (!product) {
      console.log('Backend: Product not found for slug:', slug);
      throw new ApiError(404, 'Product not found');
    }
    
    res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
  } catch (error) {
    console.error('Backend Error in getProductBySlug:', error);
    console.error(' Error stack:', error.stack);
    throw error;
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;
  
  if (!id) {
    throw new ApiError(400, 'Product ID is required');
  }
  
  const product = await ProductService.updateProduct(id, req.body, adminId);
  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id; 
  
  if (!id) {
    throw new ApiError(400, 'Product ID is required');
  }
  
  await ProductService.deleteProduct(id, adminId); 
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully')); 
});

const searchProducts = asyncHandler(async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, q, search } = req.query;
    
    const searchTerm = query || q || search;
    
    console.log('🔍 Search request received:', {
      searchTerm,
      category,
      minPrice,
      maxPrice,
      allParams: req.query
    });

    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(200).json(new ApiResponse(200, [], 'No search query provided'));
    }

    const filters = { 
      categoryId: category,
      minPrice, 
      maxPrice 
    };

    console.log('Calling ProductService with:', { searchTerm, filters });
    
    const products = await ProductService.searchProducts(searchTerm, filters);
    
    console.log('Search results:', products.length);
    
    res.status(200).json(new ApiResponse(200, products, 'Products search completed'));
  } catch (error) {
    console.error(' Search controller error:', error);
    res.status(500).json(new ApiResponse(500, null, 'Search failed: ' + error.message));
  }
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const products = await ProductService.getFeaturedProducts(parseInt(limit));
  res.status(200).json(new ApiResponse(200, products, 'Featured products fetched successfully'));
});

// ✅ NEW: Get related products
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 4 } = req.query;
  
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }
  
  const products = await ProductService.getRelatedProducts(productId, parseInt(limit));
  res.status(200).json(new ApiResponse(200, products, 'Related products fetched successfully'));
});

// ✅ NEW: Update product inventory
const updateProductInventory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const adminId = req.user.id;
  
  if (!productId || quantity === undefined) {
    throw new ApiError(400, 'Product ID and quantity are required');
  }
  
  if (quantity < 0) {
    throw new ApiError(400, 'Quantity cannot be negative');
  }
  
  const inventory = await ProductService.updateProductInventory(productId, parseInt(quantity));
  res.status(200).json(new ApiResponse(200, inventory, 'Product inventory updated successfully'));
});

// ✅ NEW: Get product by ID (for admin)
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    throw new ApiError(400, 'Product ID is required');
  }
  
  // Since we don't have getProductById in service, we can use existing method
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      inventory: true,
      images: true,
      reviews: true
    }
  });
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getProductById, // ✅ Add new method
  updateProduct,
  deleteProduct,
  searchProducts,
  uploadProductImage,
  getFeaturedProducts,
  getRelatedProducts, // ✅ Add new method
  updateProductInventory // ✅ Add new method
};