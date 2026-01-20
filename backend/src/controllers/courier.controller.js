const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const SteadfastService = require('../services/steadfast.service');

const createSteadfastOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    throw new ApiError(400, 'orderId is required');
  }
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { address: true, orderItems: true },
  });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const consignment = await SteadfastService.createOrder(order);
  res.status(200).json(new ApiResponse(200, consignment, 'Steadfast order created'));
});

const createSteadfastBulkOrders = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new ApiError(400, 'orderIds must be a non-empty array');
  }

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds.map(Number) } },
    include: { address: true, orderItems: true },
  });

  const pendingOrders = orders.filter(order => !order.steadfastConsignmentId && !order.steadfastTrackingCode);

  if (pendingOrders.length === 0) {
    throw new ApiError(404, 'No orders found');
  }

  const results = await SteadfastService.createBulkOrders(pendingOrders);
  res.status(200).json(new ApiResponse(200, results, 'Steadfast bulk orders created'));
});

module.exports = {
  createSteadfastOrder,
  createSteadfastBulkOrders,
};
