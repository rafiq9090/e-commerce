// src/controllers/cart.controller.js
const CartService = require('../services/cart.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const guestCartId = req.cookies.guestCartId || null;

  const { cart, newGuestCartId } = await CartService.getOrCreateCartByOwner({
    userId,
    guestCartId,
  });

  if (newGuestCartId) {
    res.cookie('guestCartId', newGuestCartId, cookieOptions);
  }

  res.status(200).json(new ApiResponse(200, cart));
});

const addItem = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const guestCartId = req.cookies.guestCartId || null;
  const { productId, quantity } = req.body;

  const cart = await CartService.addItemToCart({
    userId,
    cartId: guestCartId,
    productId,
    quantity: parseInt(quantity) || 1,
  });

  if (!userId && !guestCartId) {
    res.cookie('guestCartId', cart.id, cookieOptions);
  }

  res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

// --- THIS FUNCTION IS NOW FIXED ---
const updateItem = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const guestCartId = req.cookies.guestCartId || null;

  // This was the bug. It is now fixed.
  const { itemId } = req.params;

  const { quantity } = req.body;

  const cart = await CartService.updateItemQuantity({
    cartItemId: itemId,
    quantity: parseInt(quantity),
    userId,
    cartId: guestCartId,
  });

  res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
});

// This function was already correct
const removeItem = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const guestCartId = req.cookies.guestCartId || null;
  const { itemId } = req.params;

  const cart = await CartService.removeItemFromCart({
    cartItemId: itemId,
    userId,
    cartId: guestCartId,
  });

  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const guestCartId = req.cookies.guestCartId || null;

  const cart = await CartService.clearCart({
    userId,
    cartId: guestCartId,
  });

  res.status(200).json(new ApiResponse(200, cart, 'Cart cleared successfully'));
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};