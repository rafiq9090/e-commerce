// src/controllers/supplier.controller.js
const SupplierService = require('../services/supplier.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await SupplierService.createSupplier(req.body);
  res.status(201).json(new ApiResponse(201, supplier, 'Supplier created successfully'));
});

const getAllSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await SupplierService.getAllSuppliers();
  res.status(200).json(new ApiResponse(200, suppliers));
});

const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await SupplierService.getSupplierById(req.params.id);
  res.status(200).json(new ApiResponse(200, supplier));
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await SupplierService.updateSupplier(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, supplier, 'Supplier updated successfully'));
});

const deleteSupplier = asyncHandler(async (req, res) => {
  await SupplierService.deleteSupplier(req.params.id);
  res.status(204).send();
});

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};