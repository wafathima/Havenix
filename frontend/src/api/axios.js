// import axios from "axios";

// const API = axios.create({
//   baseURL: "https://havenix-backend.onrender.com/" 
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   const adminToken = localStorage.getItem("adminToken");
  
//   const finalToken = adminToken || token;
  
//   if (finalToken) {
//     config.headers.Authorization = `Bearer ${finalToken}`;
//     console.log(`🔑 Token added for ${config.url}:`, finalToken.substring(0, 15) + '...');
//   } else {
//     console.log("⚠️ No token found in localStorage");
//   }
  
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.log("🔒 Authentication error:", error.response.data);
      
//       if (error.config.url.includes('/admin/')) {
//         console.log("Admin authentication failed, redirecting to login...");
//         localStorage.removeItem('adminToken');
//         localStorage.removeItem('admin');
        
//         if (!window.location.pathname.includes('/admin/login')) {
//           window.location.href = '/admin/login';
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;


// import axios from "axios";

// // Use environment variable for production, fallback to localhost for development
// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

// const API = axios.create({
//   baseURL: `${API_URL}/api/`,
//   withCredentials: true  // Important for cookies/auth
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   const adminToken = localStorage.getItem("adminToken");
  
//   const finalToken = adminToken || token;
  
//   if (finalToken) {
//     config.headers.Authorization = `Bearer ${finalToken}`;
//     console.log(`🔑 Token added for ${config.url}:`, finalToken.substring(0, 15) + '...');
//   } else {
//     console.log("⚠️ No token found in localStorage");
//   }
  
//   // Log the full URL being called (helpful for debugging)
//   console.log(`📡 API Call: ${config.baseURL}${config.url}`);
  
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.log("🔒 Authentication error:", error.response.data);
      
//       if (error.config.url.includes('/admin/')) {
//         console.log("Admin authentication failed, redirecting to login...");
//         localStorage.removeItem('adminToken');
//         localStorage.removeItem('admin');
        
//         if (!window.location.pathname.includes('/admin/login')) {
//           window.location.href = '/admin/login';
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;


import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";
console.log('🌐 API URL:', API_URL);

const API = axios.create({
  baseURL: `${API_URL}/api/`,
  withCredentials: true,
  timeout: 10000
});
// Log all requests
API.interceptors.request.use((config) => {
  console.log(`🚀 [${config.method?.toUpperCase()}] Request to: ${config.baseURL}${config.url}`);
  console.log('📦 Request data:', config.data);
  
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  const finalToken = adminToken || token;
  
  if (finalToken) {
    config.headers.Authorization = `Bearer ${finalToken}`;
    console.log('✅ Token attached');
  } else {
    console.log('⚠️ No token found');
  }
  
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Log all responses and errors
API.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.config.url}] Response:`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:');
    console.error('  - URL:', error.config?.url);
    console.error('  - Method:', error.config?.method);
    console.error('  - BaseURL:', error.config?.baseURL);
    console.error('  - Full URL:', `${error.config?.baseURL}${error.config?.url}`);
    console.error('  - Status:', error.response?.status);
    console.error('  - Status Text:', error.response?.statusText);
    console.error('  - Response Data:', error.response?.data);
    console.error('  - Message:', error.message);
    
    if (error.response?.status === 401) {
      console.log("🔒 Authentication error");
      if (error.config?.url?.includes('/admin/')) {
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
