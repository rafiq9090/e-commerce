import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1/',
  withCredentials: true, // This is crucial! It allows cookies to be sent
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;