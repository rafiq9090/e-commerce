import apiClient from './apiConfig';

// Admin login
export const loginAdmin = async (email, password) => {
  try {
    const response = await apiClient.post('/admin/login', { email, password });

    // backend returns ApiResponse -> data: { token, admin }
    const { token, admin } = response.data.data;

    if (token) {
      localStorage.setItem('token', token);
    }

    return { admin, token };
  } catch (error) {
    console.error('Error admin login:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
