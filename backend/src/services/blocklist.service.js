const prisma = require('../config/prisma');
const { param } = require('../routes');
const ApiError = require('../utils/ApiError');

class BlocklistService {
    static async addToBlocklist(data) {
        const { type, value , reason} = data;
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
    static async getAllBlocked(){
        return await prisma.blockedList.findMany({
            orderBy: { createdAt: 'desc' },
        });

    }

    static async removeFromBlocklist(blockId) {
        return await prisma.blockedList.delete({
            where: { id: blockId },
        });
    }

    static async isBlocked(ip, phone) {
    if (!ip && !phone) return false;

    const blockedEntry = await prisma.blockedList.findFirst({
      where: {
        OR: [
          { type: 'IP', value: ip },
          { type: 'PHONE', value: phone },
        ],
      },
    });

    return !!blockedEntry; 
  }
}
module.exports = BlocklistService;