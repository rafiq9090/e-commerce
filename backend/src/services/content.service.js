const prisma = require('../config/prisma');

class ContentService {
  /**
   * Fetches all content and formats it as a simple key-value object.
   */
  static async getAllContent() {
    const allContent = await prisma.siteContent.findMany();

    // Convert the array of objects into a single key-value object for easy frontend use
    const contentObject = allContent.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return contentObject;
  }

  /**
   * Updates multiple content items in a single transaction.
   * @param {Array<{key: string, value: string}>} contentUpdates - e.g., [{key: "footer_copyright", value: "New Text"}]
   */
  static async updateContent(contentUpdates) {
    // Ensure contentUpdates is an array
    const updates = Array.isArray(contentUpdates) ? contentUpdates : [contentUpdates];

    // Use a transaction to ensure all updates succeed or none do
    const transactions = updates.map(item =>
      prisma.siteContent.upsert({
        where: { key: item.key },
        update: { value: item.value, type: item.type || 'TEXT' },
        create: { key: item.key, value: item.value, type: item.type || 'TEXT' },
      })
    );

    return await prisma.$transaction(transactions);
  }

  /**
   * Deletes a content item by key.
   * @param {string} key
   */
  static async deleteContent(key) {
    const result = await prisma.siteContent.deleteMany({ where: { key } });
    return result;
  }
}

module.exports = ContentService;
