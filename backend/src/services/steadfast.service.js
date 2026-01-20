const prisma = require('../config/prisma');
const ContentService = require('./content.service');
const ApiError = require('../utils/ApiError');
const { requestJson } = require('../utils/httpClient');

const DEFAULT_BASE_URL = 'https://portal.packzy.com/api/v1';

const getConfig = async () => {
  const content = await ContentService.getAllContent();
  const apiKey = content.steadfast_api_key;
  const secretKey = content.steadfast_secret_key;
  const baseUrl = process.env.STEADFAST_BASE_URL || DEFAULT_BASE_URL;

  if (!apiKey || !secretKey) {
    throw new ApiError(400, 'Steadfast API key or secret is missing in settings');
  }

  return { apiKey, secretKey, baseUrl };
};

const buildPayload = (order) => {
  const address = order.address?.fullAddress || order.fullAddress || '';
  if (!order.customerName || !order.customerPhone || !address) {
    throw new ApiError(400, `Order #${order.id} missing customer data or address`);
  }
  return {
    invoice: String(order.id),
    recipient_name: order.customerName,
    recipient_phone: order.customerPhone,
    alternative_phone: order.customerPhone || '',
    recipient_email: order.customerEmail || '',
    recipient_address: address,
    cod_amount: Number(order.totalAmount || 0),
    note: `Order #${order.id}`,
    item_description: order.orderItems?.map(item => item.productName).filter(Boolean).join(', ') || '',
    total_lot: order.orderItems?.length || 1,
    delivery_type: 0,
  };
};

const createOrder = async (order) => {
  try {
    if (order.steadfastConsignmentId || order.steadfastTrackingCode) {
      throw new ApiError(400, 'Order already sent to Steadfast');
    }
    const { apiKey, secretKey, baseUrl } = await getConfig();
    const payload = buildPayload(order);

    const response = await requestJson(`${baseUrl}/create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'User-Agent': 'DeshShera/1.0',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (typeof response.data === 'string') {
      const lower = response.data.toLowerCase();
      if (lower.includes('feature is disabled')) {
        throw new ApiError(400, 'Steadfast: Feature is disabled. Please enable API access on your Steadfast account.');
      }
      if (lower.includes('<html')) {
        throw new ApiError(502, `Steadfast returned HTML error (${response.status}). Check base URL, API key/secret, and API access.`);
      }
    }

    if (response.status >= 400) {
      const message = response.data?.message || response.data || 'Failed to create Steadfast order';
      throw new ApiError(response.status, message);
    }

    if (response.data?.status && response.data.status !== 200) {
      const message = response.data?.message || response.data || 'Steadfast rejected the order';
      throw new ApiError(400, message);
    }

    const consignment = response.data?.consignment || response.data?.data || response.data;
    if (!consignment?.tracking_code) {
      throw new ApiError(500, 'Steadfast response missing tracking code');
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        steadfastConsignmentId: String(consignment.consignment_id || ''),
        steadfastTrackingCode: String(consignment.tracking_code || ''),
        steadfastStatus: consignment.status || 'in_review',
        steadfastSentAt: new Date(),
      },
    });

    return consignment;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err?.code === 'P2022' || String(err?.message || '').toLowerCase().includes('steadfast')) {
      throw new ApiError(500, 'Database missing Steadfast columns. Run Prisma migrate and restart backend.');
    }
    throw new ApiError(500, err?.message || 'Steadfast request failed');
  }
};

const createBulkOrders = async (orders) => {
  try {
    const { apiKey, secretKey, baseUrl } = await getConfig();
    const payload = orders.map(buildPayload);

    const response = await requestJson(`${baseUrl}/create_order/bulk-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'User-Agent': 'DeshShera/1.0',
        Accept: 'application/json',
      },
      body: JSON.stringify({ data: JSON.stringify(payload) }),
    });

    if (typeof response.data === 'string') {
      const lower = response.data.toLowerCase();
      if (lower.includes('feature is disabled')) {
        throw new ApiError(400, 'Steadfast: Feature is disabled. Please enable API access on your Steadfast account.');
      }
      if (lower.includes('<html')) {
        throw new ApiError(502, `Steadfast returned HTML error (${response.status}). Check base URL, API key/secret, and API access.`);
      }
    }

    if (response.status >= 400) {
      const message = response.data?.message || response.data || 'Failed to create Steadfast bulk orders';
      throw new ApiError(response.status, message);
    }

    const results = Array.isArray(response.data) ? response.data : response.data?.data;
    if (!Array.isArray(results)) {
      throw new ApiError(500, 'Unexpected Steadfast bulk response');
    }

    const updates = [];
    results.forEach((item) => {
      if (item.status !== 'success') return;
      const orderId = Number(item.invoice);
      if (!Number.isInteger(orderId)) return;
      updates.push(
        prisma.order.update({
          where: { id: orderId },
          data: {
            steadfastConsignmentId: String(item.consignment_id || ''),
            steadfastTrackingCode: String(item.tracking_code || ''),
            steadfastStatus: item.status || 'success',
            steadfastSentAt: new Date(),
          },
        })
      );
    });

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return results;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err?.code === 'P2022' || String(err?.message || '').toLowerCase().includes('steadfast')) {
      throw new ApiError(500, 'Database missing Steadfast columns. Run Prisma migrate and restart backend.');
    }
    throw new ApiError(500, err?.message || 'Steadfast bulk request failed');
  }
};

module.exports = {
  createOrder,
  createBulkOrders,
};
