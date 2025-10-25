// src/controllers/cart.controller.js
const CartService = require('../services/cart.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await CartService.getOrCreateCartByUserId(userId);
  res.status(200).json(new ApiResponse(200, cart));
});

const addItem = asyncHandler(async (req, res) => {
const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ message: "Login required to add to cart" });
  }
  const { productId, qty } = req.body;
  // CartService.addItem will handle add/update logic
  const cartItem = await CartService.addItemToCart(userId, productId, qty);
  res.status(200).json({ message: "Item added to cart", cartItem });
});

const updateItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const { quantity } = req.body;
  const cart = await CartService.updateItemQuantity(userId, itemId, quantity);
  res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
});

const removeItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const cart = await CartService.removeItemFromCart(userId, itemId);
  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
};