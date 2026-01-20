const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class PaymentService {
  static async getOrderForPayment(orderId) {
    const id = Number(orderId);
    if (!Number.isInteger(id)) {
      throw new ApiError(400, 'Invalid order id');
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    if (!order.payment) {
      throw new ApiError(400, 'Order payment record missing');
    }
    return order;
  }

  static async markPaymentSuccess(orderId, paymentMethod, transactionId) {
    const id = Number(orderId);
    if (!Number.isInteger(id)) {
      throw new ApiError(400, 'Invalid order id');
    }
    return prisma.$transaction([
      prisma.paymentDetail.update({
        where: { orderId: id },
        data: {
          status: 'SUCCESS',
          transactionId: transactionId || null,
          paymentMethod,
        },
      }),
      prisma.order.update({
        where: { id },
        data: { status: 'PAID' },
      }),
      prisma.orderHistory.create({
        data: {
          orderId: id,
          status: 'PAID',
          comment: `${paymentMethod} payment successful.`,
        },
      }),
    ]);
  }

  static async markPaymentFailed(orderId, paymentMethod, transactionId, reason = '') {
    const id = Number(orderId);
    if (!Number.isInteger(id)) {
      throw new ApiError(400, 'Invalid order id');
    }
    return prisma.$transaction([
      prisma.paymentDetail.update({
        where: { orderId: id },
        data: {
          status: 'FAILED',
          transactionId: transactionId || null,
          paymentMethod,
        },
      }),
      prisma.orderHistory.create({
        data: {
          orderId: id,
          status: 'PENDING',
          comment: `${paymentMethod} payment failed.${reason ? ` ${reason}` : ''}`,
        },
      }),
    ]);
  }
}

module.exports = PaymentService;
