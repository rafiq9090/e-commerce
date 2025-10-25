// src/controllers/activityLog.controller.js
const ActivityLogService = require('../services/activityLog.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLogService.getLogs();
  res.status(200).json(new ApiResponse(200, logs));
});

module.exports = { getLogs };