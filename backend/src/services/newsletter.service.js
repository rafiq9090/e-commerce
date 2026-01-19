const prisma = require('../config/prisma');

class NewsletterService {
  static async subscribe(email) {
    const normalized = email.trim().toLowerCase();
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });
    if (existing) return existing;
    return prisma.newsletterSubscriber.create({ data: { email: normalized } });
  }

  static async listSubscribers() {
    return prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async listSubscriberEmails() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      select: { email: true },
    });
    return subscribers.map((s) => s.email);
  }

  static async deleteSubscriber(id) {
    return prisma.newsletterSubscriber.delete({ where: { id } });
  }
}

module.exports = NewsletterService;
