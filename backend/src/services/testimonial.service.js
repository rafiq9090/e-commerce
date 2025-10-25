const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

class TestimonialService {
    static async createTestimonial(testimonialData) {
        const {authorName, content, rating} = testimonialData;
        return await prisma.testimonial.create({
            data: {
                authorName,
                content,
                rating,
                isApproved: false,
            },
        });
    }
    // Fetch only approved testimonials for public display
    static async getApprovedTestimonials() {
        return await prisma.testimonial.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async getAllTestimonials() {
        return await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    static async approveTestimonial(testimonialId) {
        return await prisma.testimonial.update({
            where: { id: testimonialId },
            data: { isApproved: true },
        });
    }
    static async deleteTestimonial(testimonialId) {
        return await prisma.testimonial.delete({
            where: { id: testimonialId },
        });
    }
}
module.exports = TestimonialService;