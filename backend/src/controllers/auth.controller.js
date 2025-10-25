// src/controllers/auth.controller.js
const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await AuthService.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { token, user } = await AuthService.loginUser(req.body);
  res.status(200).json(new ApiResponse(200, { token, user }, 'Login successful'));
});

const logout = asyncHandler(async (req, res) => {
  // Define cookie options. They must match the options used when you set the cookie during login.
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use 'true' in production
  };

  // Clear the accessToken and refreshToken cookies by sending back expired cookies
  res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Please provide an email address.');
  }
  await AuthService.forgotPassword(email);
  // Always send a generic success response to prevent email enumeration
  res.status(200).json(new ApiResponse(200, null, 'If an account with that email exists, a password reset link has been sent.'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (!password) {
    throw new ApiError(400, 'Please provide a new password.');
  }

  await AuthService.resetPassword(token, password);
  res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully.'));
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,

};