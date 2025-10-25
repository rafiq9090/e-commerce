// src/services/cart.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class CartService {
  /**
   * Retrieves a user's cart. If one doesn't exist, it creates one.
   * @param {string} userId - The ID of the authenticated user.
   */
  static async getOrCreateCartByUserId(userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }
    return cart;
  }

  // static async addItemToCart(userId, productId, quantity) {
  //   const cart = await this.getOrCreateCartByUserId(userId);

  //   try {
  //     const existingItem = await prisma.cartItem.findFirst({
  //       where: { cartId: cart.id, productId },
  //     });

  //     if (existingItem) {
  //       // If item exists, update its quantity
  //       await prisma.cartItem.update({
  //         where: { id: existingItem.id },
  //         data: { quantity: { increment: quantity } },
  //       });
  //     } else {
  //       // If item does not exist, create it
  //       await prisma.cartItem.create({
  //         data: {
  //           cartId: cart.id,
  //           productId,
  //           quantity,
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     if (error.code === 'P2003') {
  //       throw new ApiError(404, `Product with id ${productId} not found.`);
  //     }
  //     throw error;
  //   }

  //   return this.getOrCreateCartByUserId(userId);
  // }
  static async addItemToCart({ userId, cartId, productId, quantity }) {
    if (!productId) {
      throw new ApiError(400, 'Product ID is required.');
    }

    // Default quantity to 1 if it's not provided or is invalid
    const itemQuantity = parseInt(quantity);

    let cart;
    // Find or create a cart for the user OR guest
    if (userId) {
      // For a logged-in user, find their cart or create one if it doesn't exist
      cart = await prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
    } else if (cartId) {
      // For a returning guest, find their cart by the provided cartId
      cart = await prisma.cart.findUnique({ where: { id: cartId } });
      if (!cart) throw new ApiError(404, 'Guest cart not found.');
    } else {
      // For a new guest, create a brand new cart
      cart = await prisma.cart.create({ data: {} });
    }

    // Check if the item already exists in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (existingItem) {
      // If item exists, update its quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: itemQuantity } },
      });
    } else {
      // If item does not exist, create it using the correct 'connect' syntax
      await prisma.cartItem.create({
        data: {
          quantity: itemQuantity,
          cart: { connect: { id: cart.id } },
          product: { connect: { id: productId } },
        },
      });
    }

    // Return the full cart with all items and product details
    return await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  static async updateItemQuantity(userId, cartItemId, quantity) {
    // Ensure the cart item belongs to the user's cart for security
    const item = await prisma.cartItem.findFirst({
      where: { id: parseInt(cartItemId), cart: { userId } },
    });

    if (!item) {
      throw new ApiError(404, 'Cart item not found or you do not have permission to modify it.');
    }

    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      await prisma.cartItem.delete({ where: { id: parseInt(cartItemId) } });
    } else {
      // Otherwise, update the quantity
      await prisma.cartItem.update({
        where: { id: parseInt(cartItemId) },
        data: { quantity },
      });
    }
    return this.getOrCreateCartByUserId(userId);
  }

  static async removeItemFromCart(userId, cartItemId) {
    // Verify item ownership before deleting
    const item = await prisma.cartItem.findFirst({
      where: { id: parseInt(cartItemId), cart: { userId } },
    });

    if (!item) {
      throw new ApiError(404, 'Cart item not found or you do not have permission to delete it.');
    }

    await prisma.cartItem.delete({ where: { id: parseInt(cartItemId) } });
    return this.getOrCreateCartByUserId(userId);
  }
}

module.exports = CartService;