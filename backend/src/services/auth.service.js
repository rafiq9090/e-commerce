// src/services/auth.service.js
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { tr } = require('zod/v4/locales');
const { transporter } = require('../config/mailer');

class AuthService {
  static async registerUser(userData) {
    const { email, password, profile } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Use a transaction to create User and UserProfile together
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            name: profile.name,
            phone: profile.phone,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    delete newUser.password; // Never return the password
    return newUser;
  }

  static async loginUser({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const userToReturn = {
      id: user.id,
      email: user.email,
      name: user.profile.name,
    };

    return { token, user: userToReturn };
  }
  static async logoutUser(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

  }catch (error) {
    if (error.code === 'P2025') {
      throw new ApiError(404, 'User not found');
    }
    throw error;  
  }
}

   static async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await prisma.user.update({
      where: { email },
      data: { passwordResetToken, passwordResetExpires }, 
   });

   // A cleaner URL structure that matches our backend route
const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
// Use the exact same variable name 'resetUrl'
const message = `You requested a password reset. Please click this link to set a new password: ${resetUrl}\n\nIf you did not request this, please ignore this email.`;
   try{
    await transporter.sendMail({
      from: '"DeshShera" <no-reply@deshshera.com>',
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });
   }catch(error){
    await prisma.user.update({
        where: { email },
        data: { passwordResetToken: null, passwordResetExpires: null },
      });
      throw new ApiError(500, 'Failed to send password reset email');
   }
  }
  static async resetPassword(token, newPassword) {
    // Hash the incoming token to match the one stored in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find the user by the hashed token and check if it has not expired
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() }, // gte = Greater than or equal to now
      },
    });

    if (!user) {
      throw new ApiError(400, 'Token is invalid or has expired.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

}

module.exports = AuthService;