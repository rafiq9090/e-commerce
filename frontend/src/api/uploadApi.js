import apiClient from './apiConfig';

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // { statusCode, data: { url: ... }, message, success }
    } catch (error) {
        throw error.response?.data || error;
    }
};
