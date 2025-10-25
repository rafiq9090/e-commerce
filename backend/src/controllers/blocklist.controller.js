const { param } = require('../routes');
const BlocklistService = require('../services/blocklist.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const addToBlocklist = asyncHandler(async (req, res) => {
  const { type, value, reason } = req.body;
  const blocklistEntry = await BlocklistService.addToBlocklist({ type, value, reason });
  res.status(201).json(new ApiResponse(201, blocklistEntry, 'Entry added to blocklist successfully'));
});

const getAllBlocked = asyncHandler(async (req, res) => {
  const blocklist = await BlocklistService.getAllBlocked();
  res.status(200).json(new ApiResponse(200, blocklist));
});

const removeFromBlocklist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await BlocklistService.removeFromBlocklist(parseInt(id));
  res.status(204).send();
});

module.exports = {
  addToBlocklist,
  getAllBlocked,
  removeFromBlocklist,
};