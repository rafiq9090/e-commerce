const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const BlocklistService = require('../services/blocklist.service');

const checkBlocklist = asyncHandler(async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  let phone = req.body.guestDetails?.phone;
  
  if(req.user) {
    const userProfile = await prisma.userProfile.findUnique({
        where: { userId: req.user.id },
    });
    if(userProfile.phone) {
        phone = userProfile.phone;
    }
    }

    const isBlocked = await BlocklistService.isBlocked(ip, phone);
    if (isBlocked) {
        throw new ApiError(403, 'Your request could not be processed at this time.');
    }
next();
});

module.exports = checkBlocklist;