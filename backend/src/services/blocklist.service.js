const prisma = require('../config/prisma');
const { param } = require('../routes');
const ApiError = require('../utils/ApiError');

class BlocklistService {
    static async addToBlocklist(data) {
        const { type, value, reason } = data;
        try {
            return await prisma.blockedList.create({
                data: {
                    type,
                    value,
                    reason,
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ApiError(409, `This ${type} is already in the blocklist.`);
            }
            throw error;
        }
    }
    static async getAllBlocked() {
        return await prisma.blockedList.findMany({
            orderBy: { createdAt: 'desc' },
        });

    }

    static async removeFromBlocklist(blockId) {
        return await prisma.blockedList.delete({
            where: { id: blockId },
        });
    }

    static async isBlocked(ip, phone, email) {
        if (!ip && !phone && !email) return false;

        const conditions = [];
        if (ip) conditions.push({ type: 'IP', value: ip });
        if (phone) conditions.push({ type: 'PHONE', value: phone });
        if (email) conditions.push({ type: 'EMAIL', value: email });

        if (conditions.length === 0) return false;

        const blockedEntry = await prisma.blockedList.findFirst({
            where: {
                OR: conditions,
            },
        });

        return !!blockedEntry;
    }
}
module.exports = BlocklistService;