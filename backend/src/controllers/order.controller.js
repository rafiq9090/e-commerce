// src/controllers/order.controller.js
const OrderService = require('../services/order.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// --- Customer Controllers ---
const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id; // Null if it's a guest
  const orderData = req.body;
  const ipAddress = req.ip;

  const order = await OrderService.placeOrder(userId, orderData, ipAddress);
  
  res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
});



const getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await OrderService.getOrderHistory(userId);
  res.status(200).json(new ApiResponse(200, orders));
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

  const order = await OrderService.updateOrderStatus(parseInt(id), status, adminId, comment);
  res.status(200).json(new ApiResponse(200, order, 'Order status updated successfully'));
});

const trackOrder = asyncHandler(async (req, res) => {
  const { orderId, identifier } = req.body;
  if (!orderId || !identifier) {
    const orderTrack = await OrderService.trackOrder(orderId, identifier);
    res.status(200).json(new ApiResponse(200, orderTrack, 'Order details fetched successfully.'));
  }
  if (!orderId || !identifier) {
    throw new ApiError(400, "Order ID and an email or phone number are required.");
  }
  
  const order = await OrderService.trackOrder(parseInt(orderId), identifier);
  res.status(200).json(new ApiResponse(200, order, 'Order details fetched successfully.'));
});

module.exports = {
  placeOrder,
  getOrderHistory,
  getAllOrders,
  updateOrderStatus,
  trackOrder,

};