const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const IncompleteOrderService = require('../services/incompleteOrder.service');

const upsertIncompleteOrder = asyncHandler(async (req, res) => {
  const order = await IncompleteOrderService.upsertOrder(req.body);
  res.status(200).json(new ApiResponse(200, order, 'Incomplete order saved'));
});

const listIncompleteOrders = asyncHandler(async (req, res) => {
  const orders = await IncompleteOrderService.listOrders();
  res.status(200).json(new ApiResponse(200, orders, 'Incomplete orders fetched'));
});

const clearIncompleteOrder = asyncHandler(async (req, res) => {
  const { clientId, source } = req.body;
  const result = await IncompleteOrderService.clearOrder(clientId, source);
  res.status(200).json(new ApiResponse(200, result, 'Incomplete order cleared'));
});

module.exports = {
  upsertIncompleteOrder,
  listIncompleteOrders,
  clearIncompleteOrder,
};
