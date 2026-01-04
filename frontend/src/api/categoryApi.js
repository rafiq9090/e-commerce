import apiClient from './apiConfig';

export const getCategories = async () => {
    try {
        const response = await apiClient.get('/categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

export const createCategory = async (data) => {
    try {
        const response = await apiClient.post('/categories', data);
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const updateCategory = async (id, data) => {
    try {
        const response = await apiClient.put(`/categories/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await apiClient.delete(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};
