import API from "./axios";

export const userAPI = {
  getProfile: async () => {
    try {
      console.log("📡 Fetching profile...");
      const response = await API.get("/user/profile");
      return response.data;
    } catch (error) {
      console.error("❌ Get profile error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      console.log("📡 Updating profile:", userData);
      const response = await API.put("/user/profile", userData);
      console.log("✅ Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Update profile error:", error.response?.data || error.message);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await API.put("/user/change-password", passwordData);
      return response.data;
    } catch (error) {
      console.error("❌ Change password error:", error.response?.data || error.message);
      throw error;
    }
  },

  uploadProfilePic: async (formData) => {
    try {
      console.log("📸 Uploading profile picture...");
      
      const response = await API.post("/user/upload-profile-pic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, 
      });
      
      console.log("✅ Upload response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Upload error:", error);
      throw error;
    }
  },
};