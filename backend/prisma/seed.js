const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with 10 Demo Products...');

  const deleteTable = async (model) => {
    try {
      if (prisma[model]) {
        await prisma[model].deleteMany({});
        console.log(`- Cleared ${model}`);
      }
    } catch (err) { console.log(`- Skip clearing ${model}`); }
  };

  console.log('Cleaning existing data...');
  await deleteTable('paymentDetail');
  await deleteTable('orderHistory');
  await deleteTable('orderItem');
  await deleteTable('order');
  await deleteTable('productImage');
  await deleteTable('productInventory');
  await deleteTable('cartItem');
  await deleteTable('product');
  await deleteTable('category');
  await deleteTable('supplier');
  await deleteTable('adminUser');
  await deleteTable('adminRole');
  await deleteTable('siteContent');

  console.log('Creating Admin Roles & Permissions...');

  // Define permissions
  const allPermissions = {
    can_manage_products: true,
    can_manage_orders: true,
    can_manage_categories: true,
    can_manage_suppliers: true,
    can_manage_content: true,
    can_manage_users: true,
    // New Permissions
    can_manage_menus: true,
    can_manage_site_content: true,
    can_manage_blocklist: true,
    can_manage_promotions: true,
  };

  const productPermissions = {
    can_manage_products: true,
    can_manage_categories: true,
    can_manage_suppliers: true,
  };

  const orderPermissions = {
    can_manage_orders: true,
  };

  const contentPermissions = {
    can_manage_content: true,
  };

  // Create Roles
  const superAdminRole = await prisma.adminRole.create({
    data: { name: 'SUPER_ADMIN', permissions: allPermissions }
  });

  await prisma.adminRole.create({
    data: { name: 'PRODUCT_MANAGER', permissions: productPermissions }
  });

  await prisma.adminRole.create({
    data: { name: 'ORDER_MANAGER', permissions: orderPermissions }
  });

  await prisma.adminRole.create({
    data: { name: 'CONTENT_MANAGER', permissions: contentPermissions }
  });

  console.log('Creating Super Admin User...');
  const hashedPw = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.create({
    data: { name: 'Super Admin', email: 'admin@example.com', password: hashedPw, roleId: superAdminRole.id }
  });

  console.log('Creating Demo Site Content...');
  await prisma.siteContent.createMany({
    data: [
      { key: 'shipping_policy_title', value: 'Shipping Policy', type: 'TEXT' },
      { key: 'shipping_policy_body', value: 'We process orders within 1-2 business days.\n\nStandard delivery takes 2-5 business days depending on your location. Express options may be available at checkout.\n\nShipping fees are calculated at checkout based on weight, destination, and service level.\n\nYou will receive a tracking number by email once your order ships.', type: 'TEXT' },
      { key: 'return_refund_title', value: 'Return & Refund Policy', type: 'TEXT' },
      { key: 'return_refund_body', value: 'We accept returns within 7 days of delivery for unused items in original packaging.\n\nTo request a return, contact support with your order number and reason for return.\n\nRefunds are issued to the original payment method within 5-10 business days after inspection.\n\nShipping fees are non-refundable unless the item arrived damaged or incorrect.', type: 'TEXT' },
      { key: 'privacy_policy_title', value: 'Privacy Policy', type: 'TEXT' },
      { key: 'privacy_policy_body', value: 'We respect your privacy and only collect information needed to process your orders and improve your shopping experience.\n\nWe never sell your personal data to third parties.\n\nWe use cookies to remember your preferences and optimize site performance.\n\nYou can request access to or deletion of your data by contacting support.', type: 'TEXT' },
      { key: 'terms_conditions_title', value: 'Terms & Conditions', type: 'TEXT' },
      { key: 'terms_conditions_body', value: 'By using this site, you agree to our terms and conditions.\n\nPrices and availability are subject to change without notice.\n\nWe reserve the right to cancel orders for suspected fraud or misuse.\n\nAny disputes will be handled according to local laws and regulations.', type: 'TEXT' },
      { key: 'about_us_title', value: 'About Us', type: 'TEXT' },
      { key: 'about_us_body', value: 'DeshShera is built for shoppers who want quality and value. We curate products from trusted suppliers and deliver fast across Bangladesh.\n\nOur mission is to make everyday shopping effortless with transparent pricing, reliable delivery, and friendly support.', type: 'TEXT' },
      { key: 'todays_deals_title', value: "Today's Deals", type: 'TEXT' },
      { key: 'todays_deals_body', value: 'Discover limited-time discounts across electronics, fashion, and home essentials.\n\nCheck back daily for new deals and flash sales curated just for you.', type: 'TEXT' },
      { key: 'contact_us_title', value: 'Contact Us', type: 'TEXT' },
      { key: 'contact_us_body', value: 'Have a question or need help with an order? Reach out anytime and our support team will respond within 24 hours.', type: 'TEXT' },
      { key: 'steadfast_base_url', value: 'https://portal.packzy.com/api/v1', type: 'TEXT' },
      { key: 'newsletter_title', value: 'Subscribe to Our Newsletter', type: 'TEXT' },
      { key: 'newsletter_description', value: 'Get the latest updates on new products and upcoming sales.', type: 'TEXT' },
      { key: 'newsletter_from_email', value: 'no-reply@deshshera.com', type: 'TEXT' },
      { key: 'show_newsletter', value: 'true', type: 'TEXT' },
      { key: 'min_order_success_rate', value: '0', type: 'TEXT' },
      { key: 'show_order_success_rate', value: 'true', type: 'TEXT' },
      { key: 'support_phone', value: '', type: 'TEXT' },
      { key: 'email_host', value: 'smtp.gmail.com', type: 'TEXT' },
      { key: 'email_port', value: '587', type: 'TEXT' },
      { key: 'email_user', value: 'your@gmail.com', type: 'TEXT' },
      { key: 'email_pass', value: 'your_app_password', type: 'TEXT' },
      { key: 'email_from', value: 'your@gmail.com', type: 'TEXT' },
      { key: 'landing_what_you_get_title', value: 'What you get', type: 'TEXT' },
      { key: 'landing_what_you_get_item_1', value: 'Original product package', type: 'TEXT' },
      { key: 'landing_what_you_get_item_2', value: 'Warranty card & manual', type: 'TEXT' },
      { key: 'landing_what_you_get_item_3', value: 'After-sales support', type: 'TEXT' },
      { key: 'landing_what_you_get_note', value: 'Specs and package contents may vary by model.', type: 'TEXT' },
      { key: 'show_bkash', value: 'false', type: 'TEXT' },
      { key: 'show_nagad', value: 'false', type: 'TEXT' },
      { key: 'bkash_number', value: '', type: 'TEXT' },
      { key: 'nagad_number', value: '', type: 'TEXT' },
      { key: 'bkash_env', value: 'sandbox', type: 'TEXT' },
      { key: 'bkash_app_key', value: '', type: 'TEXT' },
      { key: 'bkash_app_secret', value: '', type: 'TEXT' },
      { key: 'bkash_username', value: '', type: 'TEXT' },
      { key: 'bkash_password', value: '', type: 'TEXT' },
      { key: 'nagad_env', value: 'sandbox', type: 'TEXT' },
      { key: 'nagad_merchant_id', value: '', type: 'TEXT' },
      { key: 'nagad_merchant_number', value: '', type: 'TEXT' },
      { key: 'nagad_merchant_private_key', value: '', type: 'TEXT' },
      { key: 'nagad_public_key', value: '', type: 'TEXT' }
    ]
  });

  const supplier = await prisma.supplier.create({
    data: { name: 'Global Tech', location: 'Dhaka', contactEmail: 'supplier@demo.com' }
  });

  console.log('Creating Categories...');
  const catElec = await prisma.category.create({ data: { name: 'Electronics', slug: 'electronics' } });
  const catFash = await prisma.category.create({ data: { name: 'Fashion', slug: 'fashion' } });
  const catHome = await prisma.category.create({ data: { name: 'Home & Living', slug: 'home-living' } });

  const productsData = [
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: 145000, sale: 135000, catId: catElec.id, sku: 'IP15P', img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc' },
    { name: 'MacBook Air M2', slug: 'macbook-air-m2', price: 125000, sale: 118000, catId: catElec.id, sku: 'MBA-M2', img: 'https://images.unsplash.com/photo-1611186871348-b1ec696e523b' },
    { name: 'Sony WH-1000XM5', slug: 'sony-headphones', price: 35000, sale: 32000, catId: catElec.id, sku: 'SONY-H', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
    { name: 'Samsung S23 Ultra', slug: 'samsung-s23-u', price: 110000, sale: 105000, catId: catElec.id, sku: 'S23U', img: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7' },
    { name: 'Denim Jacket Blue', slug: 'denim-jacket', price: 2500, sale: 2000, catId: catFash.id, sku: 'DJ-01', img: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d' },
    { name: 'Cotton Polo Shirt', slug: 'cotton-polo', price: 1200, sale: 950, catId: catFash.id, sku: 'POLO-01', img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820' },
    { name: 'Leather Wallet', slug: 'leather-wallet', price: 1500, sale: 1300, catId: catFash.id, sku: 'LW-01', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93' },
    { name: 'Ceramic Flower Vase', slug: 'flower-vase', price: 1800, sale: 1500, catId: catHome.id, sku: 'HOME-V', img: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427' },
    { name: 'LED Smart Bulb', slug: 'smart-bulb', price: 800, sale: 650, catId: catHome.id, sku: 'LED-B', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853' },
    { name: 'Automatic Coffee Maker', slug: 'coffee-maker', price: 7500, sale: 6800, catId: catHome.id, sku: 'COFFEE-M', img: 'https://images.unsplash.com/photo-1520970014086-2208d157c9e2' }
  ];

  for (const item of productsData) {
    await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: `${item.name} high quality premium product.`,
        regular_price: item.price,
        sale_price: item.sale,
        status: 'PUBLISHED',
        supplierId: supplier.id,
        categoryId: item.catId,
        inventory: { create: { quantity: 50, sku: item.sku } },
        images: { create: [{ url: item.img, isFeatured: true }] }
      }
    });
  }

  console.log('✅ Seed successful! Login: admin@example.com / admin123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
