const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const PaymentService = require('../services/payment.service');
const BkashService = require('../services/bkash.service');
const NagadService = require('../services/nagad.service');

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return '103.100.200.100';
  }
  return ip;
};

const createBkashPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    throw new ApiError(400, 'orderId is required');
  }
  const order = await PaymentService.getOrderForPayment(orderId);
  if (order.payment.paymentMethod !== 'bKash') {
    throw new ApiError(400, 'Order is not a bKash payment');
  }
  if (order.payment.status === 'SUCCESS') {
    throw new ApiError(400, 'Payment already completed');
  }

  const callbackURL = `${getBaseUrl(req)}/api/v1/payments/bkash/callback?orderId=${order.id}`;
  const payment = await BkashService.createPayment({
    amount: order.totalAmount,
    invoiceNumber: `order-${order.id}`,
    callbackURL,
  });

  res.status(200).json(new ApiResponse(200, {
    paymentURL: payment.bkashURL,
    paymentID: payment.paymentID,
  }));
});

const bkashCallback = asyncHandler(async (req, res) => {
  const { paymentID, status, orderId } = req.query;
  if (!orderId) {
    throw new ApiError(400, 'orderId missing in callback');
  }
  if (!paymentID) {
    throw new ApiError(400, 'paymentID missing in callback');
  }

  const normalizedStatus = String(status || '').toLowerCase();
  const frontendUrl = getFrontendUrl();

  if (normalizedStatus !== 'success') {
    await PaymentService.markPaymentFailed(orderId, 'bKash', paymentID, normalizedStatus);
    return res.redirect(`${frontendUrl}/order-success?orderId=${orderId}&payment=failed`);
  }

  const result = await BkashService.executePayment(paymentID);
  const trxId = result?.trxID || result?.transactionId || paymentID;
  await PaymentService.markPaymentSuccess(orderId, 'bKash', trxId);
  return res.redirect(`${frontendUrl}/order-success?orderId=${orderId}&payment=success`);
});

const createNagadPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    throw new ApiError(400, 'orderId is required');
  }
  const order = await PaymentService.getOrderForPayment(orderId);
  if (order.payment.paymentMethod !== 'Nagad') {
    throw new ApiError(400, 'Order is not a Nagad payment');
  }
  if (order.payment.status === 'SUCCESS') {
    throw new ApiError(400, 'Payment already completed');
  }

  const callbackURL = `${getBaseUrl(req)}/api/v1/payments/nagad/callback?orderId=${order.id}`;
  const payment = await NagadService.createPayment({
    orderId: order.id,
    amount: Number(order.totalAmount).toFixed(2),
    ipAddress: getClientIp(req),
    callbackURL,
  });

  res.status(200).json(new ApiResponse(200, {
    paymentURL: payment.paymentURL,
    paymentReferenceId: payment.paymentReferenceId,
  }));
});

const nagadCallback = asyncHandler(async (req, res) => {
  const orderId = req.query.orderId || req.query.order_id;
  const paymentRefId = req.query.payment_ref_id || req.query.paymentRefId || req.query.paymentRefID;
  const status = String(req.query.status || '').toLowerCase();
  const frontendUrl = getFrontendUrl();

  if (!orderId || !paymentRefId) {
    throw new ApiError(400, 'Missing callback parameters');
  }

  if (status && status !== 'success') {
    await PaymentService.markPaymentFailed(orderId, 'Nagad', paymentRefId, status);
    return res.redirect(`${frontendUrl}/order-success?orderId=${orderId}&payment=failed`);
  }

  const verification = await NagadService.verifyPayment(paymentRefId);
  const verificationStatus = String(verification?.status || verification?.statusMessage || '').toLowerCase();
  const isSuccess = verificationStatus.includes('success') || verification?.statusCode === '000';
  if (!isSuccess) {
    await PaymentService.markPaymentFailed(orderId, 'Nagad', paymentRefId, verificationStatus);
    return res.redirect(`${frontendUrl}/order-success?orderId=${orderId}&payment=failed`);
  }

  const transactionId = verification?.trxId || verification?.transactionId || paymentRefId;
  await PaymentService.markPaymentSuccess(orderId, 'Nagad', transactionId);
  return res.redirect(`${frontendUrl}/order-success?orderId=${orderId}&payment=success`);
});

module.exports = {
  createBkashPayment,
  bkashCallback,
  createNagadPayment,
  nagadCallback,
};
