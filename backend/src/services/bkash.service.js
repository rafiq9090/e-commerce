const ContentService = require('./content.service');
const ApiError = require('../utils/ApiError');
const { requestJson } = require('../utils/httpClient');

const BKASH_BASE_URLS = {
  sandbox: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  production: 'https://tokenized.pay.bka.sh/v1.2.0-beta',
};

const getBkashConfig = async () => {
  const content = await ContentService.getAllContent();
  const env = content.bkash_env === 'production' ? 'production' : 'sandbox';
  const appKey = content.bkash_app_key;
  const appSecret = content.bkash_app_secret;
  const username = content.bkash_username;
  const password = content.bkash_password;

  if (!appKey || !appSecret || !username || !password) {
    throw new ApiError(400, 'bKash credentials are missing in settings');
  }

  return {
    env,
    baseUrl: BKASH_BASE_URLS[env],
    appKey,
    appSecret,
    username,
    password,
  };
};

const grantToken = async (config) => {
  const url = `${config.baseUrl}/tokenized/checkout/token/grant`;
  const response = await requestJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: config.username,
      password: config.password,
    },
    body: JSON.stringify({
      app_key: config.appKey,
      app_secret: config.appSecret,
    }),
  });

  if (response.status >= 400) {
    throw new ApiError(response.status, response.data?.message || 'Failed to get bKash token');
  }
  if (response.data?.statusCode && response.data.statusCode !== '0000') {
    throw new ApiError(400, response.data?.statusMessage || 'bKash token request failed');
  }

  const idToken = response.data?.id_token;
  if (!idToken) {
    throw new ApiError(500, 'bKash token not found in response');
  }
  return idToken;
};

const createPayment = async ({ amount, invoiceNumber, callbackURL }) => {
  const config = await getBkashConfig();
  const token = await grantToken(config);
  const url = `${config.baseUrl}/tokenized/checkout/create`;
  const payload = {
    amount: Number(amount).toFixed(2),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: invoiceNumber,
    callbackURL,
  };

  const response = await requestJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-App-Key': config.appKey,
    },
    body: JSON.stringify(payload),
  });

  if (response.status >= 400) {
    throw new ApiError(response.status, response.data?.message || 'Failed to create bKash payment');
  }
  if (response.data?.statusCode && response.data.statusCode !== '0000') {
    throw new ApiError(400, response.data?.statusMessage || 'bKash payment creation failed');
  }

  const paymentID = response.data?.paymentID;
  const bkashURL = response.data?.bkashURL;
  if (!paymentID || !bkashURL) {
    throw new ApiError(500, 'bKash payment creation response missing data');
  }
  return { paymentID, bkashURL };
};

const executePayment = async (paymentID) => {
  const config = await getBkashConfig();
  const token = await grantToken(config);
  const url = `${config.baseUrl}/tokenized/checkout/execute`;
  const response = await requestJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-App-Key': config.appKey,
    },
    body: JSON.stringify({ paymentID }),
  });

  if (response.status >= 400) {
    throw new ApiError(response.status, response.data?.message || 'Failed to execute bKash payment');
  }
  if (response.data?.statusCode && response.data.statusCode !== '0000') {
    throw new ApiError(400, response.data?.statusMessage || 'bKash payment execution failed');
  }
  return response.data;
};

module.exports = {
  createPayment,
  executePayment,
};
