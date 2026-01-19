const NewsletterService = require('../services/newsletter.service');
const { buildTransporter } = require('../config/mailer');
const prisma = require('../config/prisma');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'Valid email is required');
  }
  const subscriber = await NewsletterService.subscribe(email);
  res.status(201).json(new ApiResponse(201, subscriber, 'Subscribed successfully'));
});

const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await NewsletterService.listSubscribers();
  res.status(200).json(new ApiResponse(200, subscribers));
});

const deleteSubscriber = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    throw new ApiError(400, 'Invalid subscriber id');
  }
  await NewsletterService.deleteSubscriber(id);
  res.status(204).send();
});

const sendToSubscribers = async ({ subject, html }) => {
  const settings = await prisma.siteContent.findMany({
    where: {
      key: {
        in: [
          'email_host',
          'email_port',
          'email_user',
          'email_pass',
          'email_from',
          'newsletter_from_email'
        ]
      }
    }
  });
  const map = settings.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  const emails = await NewsletterService.listSubscriberEmails();
  if (emails.length === 0) {
    return { sent: 0, failed: 0 };
  }

  if (!map.email_host && !process.env.EMAIL_HOST) {
    throw new ApiError(400, 'Email host is not configured.');
  }
  if (!map.email_user && !process.env.EMAIL_USER) {
    throw new ApiError(400, 'Email user is not configured.');
  }
  if (!map.email_pass && !process.env.EMAIL_PASS) {
    throw new ApiError(400, 'Email password is not configured.');
  }

  const transporter = buildTransporter({
    host: map.email_host || undefined,
    port: map.email_port || undefined,
    user: map.email_user || undefined,
    pass: map.email_pass || undefined,
  });

  const from =
    map.email_from ||
    map.newsletter_from_email ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER;
  const results = await Promise.allSettled(
    emails.map((email) => transporter.sendMail({ from, to: email, subject, html }))
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;
  return { sent, failed };
};

const sendNewProductEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const productUrl = `${frontendUrl}/product/${product.slug}`;
  const imageUrl = product.images?.[0]?.url || '';

  const subject = `New Product: ${product.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">${product.name}</h2>
      ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" />` : ''}
      <p>${product.short_description || product.description || 'Check out our latest product.'}</p>
      <p><strong>Price:</strong> ${product.sale_price || product.regular_price}</p>
      <a href="${productUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">View Product</a>
    </div>
  `;

  const result = await sendToSubscribers({ subject, html });
  res.status(200).json(new ApiResponse(200, result, 'Product email sent'));
});

const sendNewPromotionEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const promo = await prisma.promotion.findUnique({
    where: { id: parseInt(id, 10) },
    include: { product: true }
  });
  if (!promo) {
    throw new ApiError(404, 'Promotion not found');
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const dealsUrl = `${frontendUrl}/deals`;
  const productUrl = promo.product ? `${frontendUrl}/product/${promo.product.slug}` : null;

  const subject = `New Offer: ${promo.code}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">New Offer</h2>
      <p><strong>Code:</strong> ${promo.code}</p>
      ${promo.description ? `<p>${promo.description}</p>` : ''}
      <p><strong>Discount:</strong> ${promo.type === 'PERCENTAGE' ? `${promo.value}%` : `${promo.value}`}</p>
      ${promo.product ? `<p><strong>Product:</strong> ${promo.product.name}</p>` : ''}
      <p><strong>Valid:</strong> ${promo.startDate ? new Date(promo.startDate).toLocaleDateString() : ''} ${promo.endDate ? `- ${new Date(promo.endDate).toLocaleDateString()}` : ''}</p>
      <a href="${productUrl || dealsUrl}" style="display: inline-block; background: #16a34a; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">${productUrl ? 'View Product' : 'See Deals'}</a>
    </div>
  `;

  const result = await sendToSubscribers({ subject, html });
  res.status(200).json(new ApiResponse(200, result, 'Promotion email sent'));
});

module.exports = {
  subscribe,
  getSubscribers,
  deleteSubscriber,
  sendNewProductEmail,
  sendNewPromotionEmail,
};
