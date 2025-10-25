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
    // Use a transaction to ensure all updates succeed or none do
    const transactions = contentUpdates.map(item => 
      prisma.siteContent.update({
        where: { key: item.key },
        data: { value: item.value },
      })
    );

    return await prisma.$transaction(transactions);
  }
}

module.exports = ContentService;