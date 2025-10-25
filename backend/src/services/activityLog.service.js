// src/services/activityLog.service.js
const prisma = require('../config/prisma');

class ActivityLogService {
  /**
   * Creates a new log entry.
   * @param {object} logData - The data for the log.
   * @param {string} logData.actorType - 'Admin' or 'Customer'.
   * @param {string} logData.actorId - The ID of the user or admin.
   * @param {string} logData.action - A description of the action, e.g., 'ORDER_PLACED'.
   * @param {object} [logData.details] - Optional JSON data with more info.
   */
  static async createLog(logData) {
    return prisma.activityLog.create({
      data: logData,
    });
  }

  /**
   * For admins to fetch all logs.
   */
  static async getLogs() {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = ActivityLogService;