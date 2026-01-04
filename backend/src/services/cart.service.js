const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

// 1. Create a reusable include clause for all functions
const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: true,
        },
      },
    },
  },
};

class CartService {

  static async getOrCreateCartByUserId(userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: cartInclude,
      });
    }
    return cart;
  }


  static async getOrCreateCartByOwner({ userId, guestCartId }) {
    if (userId) {
      try {
        const cart = await prisma.cart.upsert({
          where: { userId },
          update: {},
          create: { userId },
          include: cartInclude,
        });
        return { cart };
      } catch (error) {
        // If userId is not found in User table (e.g. it's an Admin ID), fall back to guest logic
        if (error.code === 'P2003') {
          console.warn(`CartService: Invalid userId ${userId} (likely Admin), falling back to guest cart.`);
          // proceed to guest logic
        } else {
          throw error;
        }
      }
    }

    if (guestCartId) {
      const cart = await prisma.cart.findUnique({
        where: { id: guestCartId },
        include: cartInclude,
      });
      if (cart) {
        return { cart };
      }
    }

    const newCart = await prisma.cart.create({
      data: {},
      include: cartInclude,
    });
    return { cart: newCart, newGuestCartId: newCart.id };
  }

  static async addItemToCart({ userId, cartId, productId, quantity }) {
    if (!productId) {
      throw new ApiError(400, 'Product ID is required.');
    }
    const itemQuantity = parseInt(quantity) || 1;
    if (itemQuantity <= 0) {
      throw new ApiError(400, 'Quantity must be at least 1.');
    }

    let cart;
    if (userId) {
      try {
        cart = await prisma.cart.upsert({
          where: { userId },
          update: {},
          create: { userId },
        });
      } catch (error) {
        if (error.code === 'P2003') {
          console.warn(`CartService addItem: Invalid userId ${userId}, treating as guest.`);
          // If passed a cartId, use it, else create new
          if (cartId) {
            cart = await prisma.cart.findUnique({ where: { id: cartId } });
            if (!cart) throw new ApiError(404, 'Guest cart not found.');
          } else {
            cart = await prisma.cart.create({ data: {} });
          }
        } else {
          throw error;
        }
      }
    } else if (cartId) {
      cart = await prisma.cart.findUnique({ where: { id: cartId } });
      if (!cart) throw new ApiError(404, 'Guest cart not found.');
    } else {
      cart = await prisma.cart.create({ data: {} });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: itemQuantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          quantity: itemQuantity,
          cart: { connect: { id: cart.id } },
          product: { connect: { id: productId } },
        },
      });
    }


    return await prisma.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });
  }


  static async updateItemQuantity({ cartItemId, quantity, userId, cartId }) {
    const idAsInt = parseInt(cartItemId);
    if (isNaN(idAsInt)) {
      throw new ApiError(400, 'Invalid cart item ID.');
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: idAsInt },
    });

    if (!item) {
      throw new ApiError(404, 'Cart item not found.');
    }

    // Security check
    if (userId) {
      const cart = await this.getOrCreateCartByUserId(userId);
      if (item.cartId !== cart.id) {
        throw new ApiError(403, 'You do not have permission to modify this item.');
      }
    } else if (cartId) {
      if (item.cartId !== cartId) {
        throw new ApiError(403, 'This item does not belong to your guest cart.');
      }
    } else {
      throw new ApiError(401, 'Unauthorized.');
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: idAsInt } });
    } else {
      await prisma.cartItem.update({
        where: { id: idAsInt },
        data: { quantity },
      });
    }

    // Return the correct cart
    if (userId) {
      return this.getOrCreateCartByUserId(userId);
    } else {
      return prisma.cart.findUnique({
        where: { id: cartId },
        include: cartInclude, // 2. Use the reusable include
      });
    }
  }

  /**
   * Removes an item from the cart for a user or guest.
   */
  static async removeItemFromCart({ cartItemId, userId, cartId }) {
    // --- 3. THIS IS THE FIX ---
    const idAsInt = parseInt(cartItemId);
    if (isNaN(idAsInt)) {
      throw new ApiError(400, 'Invalid cart item ID.');
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: idAsInt }, // Use the integer ID
    });
    // ------------------------

    if (!item) {
      throw new ApiError(404, 'Cart item not found.');
    }

    // Security check
    if (userId) {
      const cart = await this.getOrCreateCartByUserId(userId);
      if (item.cartId !== cart.id) {
        throw new ApiError(403, 'You do not have permission to delete this item.');
      }
    } else if (cartId) {
      if (item.cartId !== cartId) {
        throw new ApiError(403, 'This item does not belong to your guest cart.');
      }
    } else {
      throw new ApiError(401, 'Unauthorized.');
    }

    await prisma.cartItem.delete({ where: { id: idAsInt } });

    // Return the correct cart
    if (userId) {
      return this.getOrCreateCartByUserId(userId);
    } else {
      return prisma.cart.findUnique({
        where: { id: cartId },
        include: cartInclude, // 2. Use the reusable include
      });
    }
  }
}

module.exports = CartService;