import apiClient from './apiConfig';

export const loginUser = async (email, password) => {
  try {
    // This calls POST http://localhost:5000/api/v1/auth/login
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // This will return { success, data: { user, accessToken } }
  } catch (error) {
    console.error("Error logging in:", error);
    // Throw the error's response data to be caught in the component
    throw error.response.data;
  }
};

export const registerUser = async (name, email, password) => {
  try {
    // This calls POST http://localhost:5000/api/v1/auth/register
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data; // This will return { success, data: { user, accessToken } }
  } catch (error) {
    console.error("Error registering:", error);
    throw error.response.data;
  }
};

export const logoutUser = async () => {
    try{
        const response = await apiClient.post('/auth/logout');
        return response.data;
    }catch(error){
        console.error("Error logging out:", error);
        throw error.response.data;
    
    }

}