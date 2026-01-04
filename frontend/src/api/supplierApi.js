import apiClient from './apiConfig';

export const getSuppliers = async () => {
    try {
        const response = await apiClient.get('/suppliers');
        return response.data;
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        throw error;
    }
};

export const createSupplier = async (data) => {
    try {
        const response = await apiClient.post('/suppliers', data);
        return response.data;
    } catch (error) {
        console.error("Error creating supplier:", error);
        throw error;
    }
};

export const updateSupplier = async (id, data) => {
    try {
        const response = await apiClient.put(`/suppliers/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating supplier:", error);
        throw error;
    }
};

export const deleteSupplier = async (id) => {
    try {
        const response = await apiClient.delete(`/suppliers/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting supplier:", error);
        throw error;
    }
};
