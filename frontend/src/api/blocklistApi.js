import apiClient from './apiConfig';

// Get all blocked entries
export const getAllBlocked = async () => {
    try {
        const response = await apiClient.get('/blocklist/admin');
        return response.data;
    } catch (error) {
        console.error("Error fetching blocklist:", error);
        throw error;
    }
};

// Add to blocklist
export const addToBlocklist = async (data) => {
    try {
        const response = await apiClient.post('/blocklist/admin', data);
        return response.data;
    } catch (error) {
        console.error("Error blocking user:", error);
        throw error;
    }
};

// Remove from blocklist
export const removeFromBlocklist = async (id) => {
    try {
        const response = await apiClient.delete(`/blocklist/admin/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error removing from blocklist:", error);
        throw error;
    }
};
