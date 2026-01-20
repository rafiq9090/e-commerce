const crypto = require('crypto');
const ContentService = require('./content.service');
const ApiError = require('../utils/ApiError');
const { requestJson } = require('../utils/httpClient');

const NAGAD_BASE_URLS = {
  sandbox: 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs',
  production: 'https://api.mynagad.com/api/dfs',
};

const NAGAD_API_VERSION = 'v-0.2.0';

const formatKey = (key, type) => {
  if (!key) return '';
  return /begin/i.test(key) ? key.trim() : `-----BEGIN ${type} KEY-----\n${key.trim()}\n-----END ${type} KEY-----`;
};

const getTimestamp = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const map = {};
  parts.forEach((part) => {
    if (part.type !== 'literal') map[part.type] = part.value;
  });
  return `${map.year}${map.month}${map.day}${map.hour}${map.minute}${map.second}`;
};

const createHash = (value) => crypto.createHash('sha1').update(String(value)).digest('hex').toUpperCase();

const encrypt = (data, publicKey) => {
  const buffer = Buffer.from(JSON.stringify(data));
  return crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    buffer
  ).toString('base64');
};

const decrypt = (data, privateKey) => {
  const buffer = Buffer.from(data, 'base64');
  return crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    buffer
  ).toString('utf8');
};

const sign = (data, privateKey) => {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(JSON.stringify(data));
  signer.end();
  return signer.sign(privateKey, 'base64');
};

const getNagadConfig = async () => {
  const content = await ContentService.getAllContent();
  const env = content.nagad_env === 'production' ? 'production' : 'sandbox';
  const merchantId = content.nagad_merchant_id;
  const privateKey = formatKey(content.nagad_merchant_private_key, 'PRIVATE');
  const publicKey = formatKey(content.nagad_public_key, 'PUBLIC');
  const merchantNumber = content.nagad_merchant_number || merchantId;

  if (!merchantId || !privateKey || !publicKey) {
    throw new ApiError(400, 'Nagad credentials are missing in settings');
  }

  return {
    env,
    baseUrl: NAGAD_BASE_URLS[env],
    merchantId,
    merchantNumber,
    privateKey,
    publicKey,
  };
};

const createPayment = async ({ orderId, amount, ipAddress, callbackURL, clientType = 'PC_WEB' }) => {
  const config = await getNagadConfig();
  const timestamp = getTimestamp();
  const challenge = createHash(orderId);
  const sensitive = {
    merchantId: config.merchantId,
    datetime: timestamp,
    orderId: String(orderId),
    challenge,
  };

  const payload = {
    accountNumber: config.merchantNumber,
    dateTime: timestamp,
    sensitiveData: encrypt(sensitive, config.publicKey),
    signature: sign(sensitive, config.privateKey),
  };

  const initUrl = `${config.baseUrl}/check-out/initialize/${config.merchantId}/${orderId}`;
  const initResponse = await requestJson(initUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-KM-Api-Version': NAGAD_API_VERSION,
      'X-KM-IP-V4': ipAddress,
      'X-KM-Client-Type': clientType,
    },
    body: JSON.stringify(payload),
  });

  if (initResponse.status >= 400) {
    throw new ApiError(initResponse.status, initResponse.data?.message || 'Failed to initialize Nagad payment');
  }

  const encryptedSensitive = initResponse.data?.sensitiveData;
  if (!encryptedSensitive) {
    throw new ApiError(500, 'Nagad initialize response missing sensitive data');
  }

  const decrypted = JSON.parse(decrypt(encryptedSensitive, config.privateKey));
  const paymentReferenceId = decrypted.paymentReferenceId;
  const initChallenge = decrypted.challenge;

  if (!paymentReferenceId || !initChallenge) {
    throw new ApiError(500, 'Nagad initialize response missing reference data');
  }

  const confirmSensitive = {
    merchantId: config.merchantId,
    orderId: String(orderId),
    amount: String(amount),
    currencyCode: '050',
    challenge: initChallenge,
  };

  const confirmPayload = {
    paymentRefId: paymentReferenceId,
    sensitiveData: encrypt(confirmSensitive, config.publicKey),
    signature: sign(confirmSensitive, config.privateKey),
    merchantCallbackURL: callbackURL,
    additionalMerchantInfo: {
      orderId: String(orderId),
    },
  };

  const completeUrl = `${config.baseUrl}/check-out/complete/${paymentReferenceId}`;
  const completeResponse = await requestJson(completeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-KM-Api-Version': NAGAD_API_VERSION,
      'X-KM-IP-V4': ipAddress,
      'X-KM-Client-Type': clientType,
    },
    body: JSON.stringify(confirmPayload),
  });

  if (completeResponse.status >= 400) {
    throw new ApiError(completeResponse.status, completeResponse.data?.message || 'Failed to complete Nagad payment');
  }

  const paymentURL = completeResponse.data?.callBackUrl || completeResponse.data?.callBackURL || completeResponse.data?.redirectUrl;
  if (!paymentURL) {
    throw new ApiError(500, 'Nagad payment URL missing in response');
  }

  return { paymentURL, paymentReferenceId };
};

const verifyPayment = async (paymentReferenceId) => {
  const config = await getNagadConfig();
  const url = `${config.baseUrl}/verify/payment/${paymentReferenceId}`;
  const response = await requestJson(url, {
    method: 'GET',
    headers: {
      'X-KM-Api-Version': NAGAD_API_VERSION,
    },
  });
  if (response.status >= 400) {
    throw new ApiError(response.status, response.data?.message || 'Failed to verify Nagad payment');
  }
  return response.data;
};

module.exports = {
  createPayment,
  verifyPayment,
};
