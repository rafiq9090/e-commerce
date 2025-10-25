// src/utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}

module.exports = ApiError;