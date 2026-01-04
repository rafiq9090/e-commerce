// src/controllers/order.controller.js
const OrderService = require('../services/order.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// --- Customer Controllers ---
const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const orderData = req.body;
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || req.ip;

  if (!orderData) {
    throw new ApiError(400, 'Order data is required');
  }

  if (!userId && (!orderData.guestDetails?.name || !orderData.guestDetails?.phone)) {
    throw new ApiError(400, 'Guest name and phone are required');
  }

  if (!orderData.fullAddress) {
    throw new ApiError(400, 'Shipping address is required');
  }

  const order = await OrderService.placeOrder(userId, orderData, ipAddress);
  res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
});

const getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await OrderService.getOrderHistory(userId);
  res.status(200).json(new ApiResponse(200, orders, 'Order history fetched successfully'));
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!id) {
    throw new ApiError(400, 'Order ID is required');
  }

  const order = await OrderService.getOrderDetails(id, userId);
  res.status(200).json(new ApiResponse(200, order, 'Order details fetched successfully'));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { reason } = req.body;

  if (!id) {
    throw new ApiError(400, 'Order ID is required');
  }

  const order = await OrderService.cancelOrder(id, userId, reason);
  res.status(200).json(new ApiResponse(200, order, 'Order cancelled successfully'));
});

// --- Public Tracking ---
const trackOrderPublic = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new ApiError(400, 'Order ID is required');
  }

  const order = await OrderService.trackOrderPublic(orderId);
  res.status(200).json(new ApiResponse(200, order, 'Order details fetched successfully'));
});

const trackOrderSecure = asyncHandler(async (req, res) => {
  const { orderId, email, phone } = req.body;
  const identifier = email || phone;

  if (!orderId || !identifier) {
    throw new ApiError(400, 'Order ID and email/phone are required');
  }

  const order = await OrderService.trackOrderSecure(orderId, identifier);
  res.status(200).json(new ApiResponse(200, order, 'Order details fetched successfully'));
});

// --- Admin Controllers ---
const getAllOrders = asyncHandler(async (req, res) => {
  const filters = req.query;
  const orders = await OrderService.getAllOrders(filters);
  res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  const adminId = req.user.id;

  if (!id) {
    throw new ApiError(400, 'Order ID is required');
  }

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const order = await OrderService.updateOrderStatus(id, status, adminId, comment);
  res.status(200).json(new ApiResponse(200, order, 'Order status updated successfully'));
});

const getOrderStatistics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  const validPeriods = ['day', 'week', 'month', 'year'];
  if (!validPeriods.includes(period)) {
    throw new ApiError(400, 'Invalid period. Use: day, week, month, year');
  }

  const stats = await OrderService.getOrderStatistics(period);
  res.status(200).json(new ApiResponse(200, stats, 'Order statistics fetched successfully'));
});

module.exports = {
  placeOrder,
  getOrderHistory,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  trackOrderPublic,
  trackOrderSecure,
  cancelOrder,
  getOrderStatistics
};