// src/services/order.service.js
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const PromotionService = require('./promotion.service');
const ActivityLogService = require('./activityLog.service');
const transporter = require('../config/mailer');
const BlocklistService = require('./blocklist.service');

class OrderService {

  static async placeOrder(userId, orderData, ipAddress) {
    const { cartId, items, fullAddress, paymentMethod, promotionCode, guestDetails } = orderData;

    let orderItemsData = [];
    let subTotal = 0;
    let originalCartId = null;

    if (cartId) {
      const cart = await prisma.cart.findFirst({
        where: { OR: [{ userId }, { id: cartId }] },
        include: { items: { include: { product: true } } },
      });
      if (!cart || cart.items.length === 0) throw new ApiError(400, 'Cart is empty or not found.');

      originalCartId = cart.id;
      for (const item of cart.items) {
        const price = Number(item.product.sale_price || item.product.regular_price);
        subTotal += price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          productName: item.product.name,
        });
      }
    } else if (items && items.length > 0) {
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new ApiError(404, `Product with ID ${item.productId} not found.`);
        const price = Number(product.sale_price || product.regular_price);
        subTotal += price * item.quantity;
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

    // --- 2. Customer Details ---
    let customerName, customerPhone, customerEmail;
    if (userId) {
      const userWithProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (!userWithProfile || !userWithProfile.profile)
        throw new ApiError(404, 'User profile not found.');
      customerName = userWithProfile.profile.name;
      customerPhone = userWithProfile.profile.phone;
      customerEmail = userWithProfile.email;
    } else {
      if (!guestDetails || !guestDetails.name || !guestDetails.phone || !fullAddress)
        throw new ApiError(400, 'Guest name, phone, and a full address are required.');
      customerName = guestDetails.name;
      customerPhone = guestDetails.phone;
      customerEmail = guestDetails.email || null;
    }

    // --- Blocklist Check ---
    const isBlocked = await BlocklistService.isBlocked(ipAddress, customerPhone, customerEmail);
    if (isBlocked) {
      throw new ApiError(403, 'You fake cutomer please contact cutomer support');
    }

    // --- 3. Promotion Validation ---
    let discountAmount = 0;
    let finalTotal = subTotal;
    if (promotionCode) {
      try {
        const promo = await PromotionService.validatePromotion(promotionCode);
        if (promo.type === 'PERCENTAGE') discountAmount = (Number(promo.value) / 100) * subTotal;
        else if (promo.type === 'FIXED_AMOUNT') discountAmount = Number(promo.value);
        finalTotal = Math.max(0, subTotal - discountAmount);
      } catch (err) {
        console.warn(`Promotion validation failed: ${err.message}`);
      }
    }

    // --- 4. Database Transaction ---
    return await prisma.$transaction(async (tx) => {
      // Create Address
      const newAddress = await tx.address.create({
        data: {
          fullAddress,
          userId: userId || null,
        },
      });

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          addressId: newAddress.id,
          totalAmount: finalTotal,
          discountAmount,
          appliedPromotionCode: promotionCode || null,
          customerName,
          customerPhone,
          customerEmail,
          status: 'PENDING',
          ipAddress: ipAddress || null,
          orderItems: { create: orderItemsData },
          payment: { create: { paymentMethod, status: 'PENDING', amount: finalTotal } },
          history: { create: { status: 'PENDING', comment: 'Order placed by customer.' } },
        },
        include: { orderItems: true, payment: true, address: true, history: true },
      });

      // Update Inventory
      for (const item of orderItemsData) {
        await tx.productInventory.updateMany({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Delete original cart
      if (originalCartId) await tx.cart.delete({ where: { id: originalCartId } });

      // Send email notification to admin
      try {
        await transporter.sendMail({
          from: '"DeshShera" <no-reply@deshshera.com>',
          to: process.env.ADMIN_EMAIL_RECEIVER,
          subject: `🎉 New Order Received! #${newOrder.id}`,
          html: `<p>A new order #${newOrder.id} was placed. Total: ${newOrder.totalAmount} BDT.</p>`,
        });
      } catch (err) {
        console.error('Failed to send order email:', err);
      }

      // Log activity for logged-in user
      if (userId) {
        await ActivityLogService.createLog({
          actorType: 'Customer',
          actorId: userId,
          action: 'ORDER_PLACED',
          details: { orderId: newOrder.id, totalAmount: newOrder.totalAmount },
        });
      }

      return newOrder;
    });
  }


  static async trackOrderPublic(orderId) {
    console.log('🔍 Tracking order with ID:', orderId);

    const idAsInt = parseInt(orderId);
    if (isNaN(idAsInt)) {
      throw new ApiError(400, 'Invalid Order ID format.');
    }

    const order = await prisma.order.findFirst({
      where: { id: idAsInt },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        },
        address: true,
        payment: true
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    console.log('Order found:', order.id);
    return order;
  }

  static async trackOrderSecure(orderId, identifier) {
    const idAsInt = parseInt(orderId);
    if (isNaN(idAsInt)) {
      throw new ApiError(400, 'Invalid Order ID format.');
    }

    if (!identifier) {
      throw new ApiError(400, 'Email or phone is required for secure tracking.');
    }

    const order = await prisma.order.findFirst({
      where: {
        id: idAsInt,
        OR: [
          { customerPhone: identifier },
          { customerEmail: identifier },
        ],
      },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                slug: true
              }
            }
          }
        },
        address: true,
        payment: true
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found. Please check your credentials.');
    }

    return order;
  }

  static async getOrderHistory(userId) {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: true,
        address: true,
        payment: true
      },
    });
  }


  static async getAllOrders(filters = {}) {
    const { status, startDate, endDate, customer, search } = filters;
    const whereClause = {};

    // Use 'search' or 'customer' for the generic search term
    const searchTerm = search || customer;

    if (status) whereClause.status = status;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    if (searchTerm) {
      const searchConditions = [
        { customerName: { contains: searchTerm } },
        { customerPhone: { contains: searchTerm } },
        { customerEmail: { contains: searchTerm } },
        { user: { email: { contains: searchTerm } } },
      ];

      // If search term is a number, also assume it might be an Order ID
      const searchInt = parseInt(searchTerm);
      if (!isNaN(searchInt)) {
        searchConditions.push({ id: searchInt });
      }

      whereClause.OR = searchConditions;
    }

    return await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true } },
        address: true,
        orderItems: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }


  static async updateOrderStatus(orderId, newStatus, adminId, comment) {
    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(newStatus)) {
      throw new ApiError(400, 'Invalid status provided.');
    }

    const idAsInt = parseInt(orderId);
    if (isNaN(idAsInt)) throw new ApiError(400, 'Invalid Order ID format.');

    // Use a transaction to update status AND add history
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: idAsInt },
        data: { status: newStatus },
      }),
      prisma.orderHistory.create({
        data: {
          orderId: idAsInt,
          status: newStatus,
          comment: comment,
        },
      }),
    ]);

    await ActivityLogService.createLog({
      actorType: 'Admin',
      actorId: adminId,
      action: 'ORDER_STATUS_UPDATED',
      details: { orderId: idAsInt, newStatus: newStatus }
    });

    return updatedOrder;
  }

  static async getOrderStatistics(period = 'month') {
    const now = new Date();
    let startDate = new Date();

    if (period === 'day') startDate.setDate(now.getDate() - 1);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const where = {
      createdAt: { gte: startDate }
    };

    // Parallelize queries for efficiency
    const [
      totalOrders,
      revenueResult,
      pendingOrders,
      totalProducts,
      totalCustomers,
      lowStockProducts
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { ...where, status: { not: 'CANCELLED' } }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }), // Global pending
      prisma.product.count(), // Global products
      prisma.user.count(),    // Global users
      prisma.productInventory.count({ where: { quantity: { lte: 5 } } }) // Low stock (e.g. <= 5)
    ]);

    return {
      totalOrders,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      pendingOrders,
      totalProducts,
      totalCustomers,
      lowStockProducts
    };
  }
}

module.exports = OrderService;