// src/middleware/validation.middleware.js
const validateOrderStatus = (req, res, next) => {
  const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  
  if (req.body.status && !validStatuses.includes(req.body.status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }
  next();
};

