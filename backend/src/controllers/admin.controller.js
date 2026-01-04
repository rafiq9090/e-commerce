// src/controllers/admin.controller.js
const AdminService = require('../services/admin.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const registerAdmin = asyncHandler(async (req, res) => {
  const admin = await AdminService.registerAdmin(req.body);
  res.status(201).json(new ApiResponse(201, admin, 'Admin registered successfully'));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { token, admin } = await AdminService.loginAdmin(req.body);
  res.status(200).json(new ApiResponse(200, { token, admin }, 'Admin login successful'));
});

const getRoles = asyncHandler(async (req, res) => {
  const roles = await AdminService.getRoles();
  res.status(200).json(new ApiResponse(200, roles, 'Roles fetched successfully'));
});

const getAdmins = asyncHandler(async (req, res) => {
  const admins = await AdminService.getAllAdmins();
  res.status(200).json(new ApiResponse(200, admins, 'Admins fetched successfully'));
});

module.exports = {
  registerAdmin,
  loginAdmin,
  getRoles,
  getAdmins,
};