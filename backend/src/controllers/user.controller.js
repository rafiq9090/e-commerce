// src/controllers/user.controller.js
const UserService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await UserService.getUserProfile(userId);
  res.status(200).json(new ApiResponse(200, profile));
});

const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const address = await UserService.addAddress(userId, req.body);
  res.status(201).json(new ApiResponse(201, address, 'Address added successfully'));
});

const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.params;
  const address = await UserService.updateAddress(userId, addressId, req.body);
  res.status(200).json(new ApiResponse(200, address, 'Address updated successfully'));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.params;
  await UserService.deleteAddress(userId, addressId);
  res.status(204).send();
});

module.exports = {
  getUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};