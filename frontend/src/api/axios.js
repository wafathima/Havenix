import axios from "axios";

const API = axios.create({
  baseURL: "https://havenix-backend.onrender.com/" 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  const finalToken = adminToken || token;
  
  if (finalToken) {
    config.headers.Authorization = `Bearer ${finalToken}`;
    console.log(`🔑 Token added for ${config.url}:`, finalToken.substring(0, 15) + '...');
  } else {
    console.log("⚠️ No token found in localStorage");
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔒 Authentication error:", error.response.data);
      
      if (error.config.url.includes('/admin/')) {
        console.log("Admin authentication failed, redirecting to login...");
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
