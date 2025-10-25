// src/services/order.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const PromotionService = require('./promotion.service'); 
const ActivityLogService = require('./activityLog.service'); 
const transporter = require('../config/mailer');
class OrderService {
 static async placeOrder(userId, orderData, ipAddress) {
    const { cartId, items, addressId, fullAddress, paymentMethod, promotionCode, guestDetails } = orderData;

    let orderItemsData = [];
    let subTotal = 0;
    let originalCartId = cartId;

    // --- Logic to get order items ---
    if (cartId) {
      // **Case 1: Order is placed from a cart**
      const cart = await prisma.cart.findFirst({
        where: { OR: [{ userId }, { id: cartId }] },
        include: { items: { include: { product: true } } },
      });
      if (!cart || cart.items.length === 0) throw new ApiError(400, 'Cart is empty or not found.');
      
      for (const item of cart.items) {
        const price = item.product.sale_price || item.product.regular_price;
        subTotal += Number(price) * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          productName: item.product.name,
        });
      }

    } else if (items && items.length > 0) {
      // **Case 2: Direct order (no cart)**
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new ApiError(404, `Product with ID ${item.productId} not found.`);
        
        const price = product.sale_price || product.regular_price;
        subTotal += Number(price) * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: price,
          productName: product.name,
        });
      }
    } else {
      throw new ApiError(400, 'Order must contain items or a valid cart ID.');
    }

    // --- Common Logic for all order types ---
    
    let customerName, customerPhone, customerEmail, finalAddressId;
    if (userId) {
      const userWithProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (!userWithProfile || !userWithProfile.profile) throw new ApiError(404, 'User profile not found.');
      customerName = userWithProfile.profile.name;
      customerPhone = userWithProfile.profile.phone;
      customerEmail = userWithProfile.email;
      finalAddressId = addressId;
    } else {
      if (!guestDetails || !fullAddress || !guestDetails.name || !guestDetails.phone) {
        throw new ApiError(400, 'Guest name, phone, and a full address are required.');
      }
      customerName = guestDetails.name;
      customerPhone = guestDetails.phone;
      customerEmail = guestDetails.email; // Optional email
      const newGuestAddress = await prisma.address.create({ data: { fullAddress } });
      finalAddressId = newGuestAddress.id;
    }

    // Promotion validation
    let discountAmount = 0;
    let finalTotal = subTotal;
    if (promotionCode) {
      const promo = await PromotionService.validatePromotion(promotionCode);
      if (promo.type === 'PERCENTAGE') {
        discountAmount = (Number(promo.value) / 100) * subTotal;
      } else if (promo.type === 'FIXED_AMOUNT') {
        discountAmount = Number(promo.value);
      }
      finalTotal = Math.max(0, subTotal - discountAmount);
    }

    // --- Database Transaction ---
    return await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          addressId: finalAddressId,
          totalAmount: finalTotal,
          discountAmount,
          appliedPromotionCode: promotionCode,
          customerName,
          customerPhone,
          customerEmail,
          status: 'PENDING',
          ipAddress: ipAddress,
          orderItems: { create: orderItemsData },
          payment: { create: { paymentMethod, status: 'PENDING', amount: finalTotal } },
        },
        include: { orderItems: true, payment: true, address: true },
      });

      for (const item of orderItemsData) {
        await tx.productInventory.updateMany({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      if (originalCartId) {
        await tx.cart.delete({ where: { id: originalCartId } });
      }

      try {
        await transporter.sendMail({
          from: '"DeshShera" <no-reply@deshshera.com>',
          to: process.env.ADMIN_EMAIL_RECEIVER,
          subject: `🎉 New Order Received! #${newOrder.id}`,
          html: `<p>A new order with ID #${newOrder.id} has been placed for ${newOrder.totalAmount} BDT.</p>`,
        });
      } catch (error) {
        console.error('Failed to send new order notification email:', error);
      }
      
      if (userId) { 
        await ActivityLogService.createLog({
            actorType: 'Customer',
            actorId: userId,
            action: 'ORDER_PLACED',
            details: { orderId: newOrder.id, totalAmount: newOrder.totalAmount }
        });
      }

      return newOrder;
    });
  }
static async trackOrder(orderId, identifier) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        // Check if the identifier matches either the phone or email
        OR: [
          { customerPhone: identifier },
          { customerEmail: identifier },
        ],
      },
      include: {
        // Include the history, sorted by newest first
        history: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        orderItems: true,
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found. Please check your Order ID and email/phone.');
    }

    return order;
  }

  // --- Other methods remain unchanged ---

  static async getOrderHistory(userId) {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAllOrders(filters = {}) {
  const { status, startDate, endDate, customer } = filters;
  
  // 1. Check the spelling of this variable declaration
  const whereClause = {};

  // Filter by status
  if (status) {
    whereClause.status = status;
  }

  // Filter by date range
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt.lte = new Date(endDate);
    }
  }
  
  // Search by customer name, phone, or email
  if (customer) {
    whereClause.OR = [
      { customerName: { contains: customer } },
      { customerPhone: { contains: customer } },
      { user: { email: { contains: customer } } }
    ];
  }

  return await prisma.order.findMany({
    // 2. Make sure the spelling here EXACTLY matches the declaration above
    where: whereClause,
    include: {
      user: { select: { email: true } },
      address: true,
      orderItems: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

  static async updateOrderStatus(orderId, status) {
    return await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
    });
  }
}

module.exports = OrderService;