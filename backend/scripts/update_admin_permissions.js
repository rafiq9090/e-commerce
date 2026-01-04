const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePermissions() {
    console.log('Updating Admin Permissions...');

    const allPermissions = {
        can_manage_products: true,
        can_manage_orders: true,
        can_manage_categories: true,
        can_manage_suppliers: true,
        can_manage_content: true,
        can_manage_users: true,
        can_manage_menus: true,
        can_manage_site_content: true,
        can_manage_blocklist: true,
    };

    try {
        const role = await prisma.adminRole.findFirst({
            where: { name: 'SUPER_ADMIN' }
        });

        if (role) {
            await prisma.adminRole.update({
                where: { id: role.id },
                data: { permissions: allPermissions }
            });
            console.log('✅ SUPER_ADMIN permissions updated successfully.');
        } else {
            console.log('❌ SUPER_ADMIN role not found.');
        }
    } catch (error) {
        console.error('Error updating permissions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePermissions();
