import apiClient from './apiConfig';

// Get all site content (Public/Admin)
export const getAllContent = async () => {
    try {
        const response = await apiClient.get('/content');
        return response.data;
    } catch (error) {
        console.error("Error fetching site content:", error);
        throw error;
    }
};

// Update content key-value (Admin)
// Expects: { key: "header_title", value: "My Shop", type: "TEXT" }
export const updateContent = async (data) => {
    try {
        const response = await apiClient.put('/content', data);
        return response.data;
    } catch (error) {
        console.error("Error updating site content:", error);
        throw error;
    }
};
