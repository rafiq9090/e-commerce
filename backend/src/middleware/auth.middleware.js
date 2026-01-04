// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ca } = require('zod/v4/locales');

/**
 * Middleware to verify JWT and attach user payload to the request object.
 * This works for both regular Users and AdminUsers.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    throw new ApiError(401, 'No token provided. Authorization denied.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // Attach decoded payload (e.g., { id, email, role })
  next();
});

const sofAuthenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded payload (e.g., { id, email, role })
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
});


/**
 * Middleware to check for specific admin permissions.
 * This is a higher-order function that takes a permission string.
 * @param {string} permission - The permission key to check (e.g., 'can_manage_products').
 */
const authorize = (permission) => {
  return asyncHandler(async (req, res, next) => {
    // Assumes authenticate middleware has already run and attached req.user
    const adminId = req.user.id;

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: adminId },
      include: { role: true }, // Include the role to access the permissions JSON
    });

    if (!adminUser || !adminUser.role || !adminUser.role.permissions || !adminUser.role.permissions[permission]) {
      throw new ApiError(403, 'Forbidden: You do not have permission to perform this action.');
    }

    next();
  });
};

module.exports = {
  authenticate,
  authorize,
  sofAuthenticate
};