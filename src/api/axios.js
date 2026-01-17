import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api/v1',
  withCredentials: true,
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
      originalRequest._retry = true;
      
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api/v1'}/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        return api(originalRequest);
      } catch (refreshError) {
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;