const MenuService = require('../services/menu.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// public controllers
const getMenuByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const menu = await MenuService.getMenuByName(name);
  res.status(200).json(new ApiResponse(200, menu));
});

// admin controllers
const createMenu = asyncHandler(async (req, res) => {
  const menu = await MenuService.createMenu(req.body);
  res.status(201).json(new ApiResponse(201, menu, 'Menu created successfully'));
});

const getAllMenus = asyncHandler(async (req, res) => {
  const menus = await MenuService.getAllMenus();
  res.status(200).json(new ApiResponse(200, menus));
});

const addMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuService.addMenuItem(req.body);
  res.status(201).json(new ApiResponse(201, item, 'Menu item added successfully'));
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const item = await MenuService.updateMenuItem(itemId, req.body);
  res.status(200).json(new ApiResponse(200, item, 'Menu item updated successfully'));
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  await MenuService.deleteMenuItem(itemId);
  res.status(204).send(); // No content response
});

module.exports = {
    getMenuByName,
    createMenu,
    getAllMenus,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
};