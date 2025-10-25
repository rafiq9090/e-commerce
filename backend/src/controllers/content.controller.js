const ContentService = require('../services/content.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getAllContent = asyncHandler(async (req, res) => {
  const content = await ContentService.getAllContent();
  res.status(200).json(new ApiResponse(200, content, "Site content fetched successfully"));
});

const updateContent = asyncHandler(async (req, res) => {
  // The request body should be an array of {key, value} objects
  const updatedContent = await ContentService.updateContent(req.body);
  res.status(200).json(new ApiResponse(200, updatedContent, 'Content updated successfully'));
});

module.exports = { 
  getAllContent, 
  updateContent 
};