// src/controllers/product.controller.js
const ProductService = require('../services/product.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.createProduct(req.body);
  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

const uploadProductImage = asyncHandler(async (req, res) => {
  console.log('--- Reached uploadProductImage controller ---');
  console.log('File:', req.file);
  const {productId} = req.params;
  const {altText, isFeatured} = req.body;
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded.');
  }
  const imageData = {
    path: req.file.path,
    altText,
    isFeatured: isFeatured === 'true',
  };
  const image = await ProductService.addImagesToProduct(productId, imageData);
  res.status(201).json(new ApiResponse(201, image, 'Image uploaded successfully'));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await ProductService.getAllProducts(req.query);
  res.status(200).json(new ApiResponse(200, products));
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await ProductService.getProductBySlug(req.params.slug);
  res.status(200).json(new ApiResponse(200, product));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id; // Get the admin's ID from the token
  const product = await ProductService.updateProduct(id, req.body, adminId); // Pass it to the service
  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

const deleteProduct = asyncHandler(async (req, res) => {
  await ProductService.deleteProduct(req.params.id);
  res.status(204).send(); // No content response
});

const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const products = await ProductService.searchProducts(query);
  res.status(200).json(new ApiResponse(200, products));
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await ProductService.getFeaturedProducts();
  res.status(200).json(new ApiResponse(200, products));
});


module.exports = {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts,
  uploadProductImage,
  getFeaturedProducts,
};