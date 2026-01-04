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