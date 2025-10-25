// src/services/admin.service.js
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

class AdminService {
  static async registerAdmin(adminData) {
    const { name, email, password, roleId } = adminData;

    if (!email || !name || !password || !roleId) {
      throw new ApiError(400, 'Email, name, password, and roleId are required.');
    }

    // 1. Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });
    if (existingAdmin) {
      throw new ApiError(409, 'Admin with this email already exists');
    }

    // 2. Check if the role exists
    const roleExists = await prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!roleExists) {
      throw new ApiError(404, 'Admin Role not found');
    }

    // 3. Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 4. Create the new admin user
    const newAdmin = await prisma.adminUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      },
      include: {
        role: true, // Include role details in the response
      },
    });

    delete newAdmin.password;
    return newAdmin;
  }

  static async loginAdmin({ email, password }) {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role.name },
      process.env.JWT_SECRET,
     { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const adminToReturn = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role.name,
    };

    return { token, admin: adminToReturn };
  }
}

module.exports = AdminService;