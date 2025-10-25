// src/middleware/error.handler.js
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // For unexpected errors
  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};

module.exports = { errorHandler };