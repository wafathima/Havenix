import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../api/userApi";
import { useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("Initializing auth...");
    console.log("Token exists:", !!token);
    console.log("Stored user exists:", !!storedUser);

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Check if stored user is blocked
        if (parsedUser.isBlocked) {
          console.log("❌ Stored user is blocked, logging out");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          setUser(null);
          setLoading(false);
          return;
        }
        
        setUser(parsedUser);
        
        try {
          console.log("📡 Fetching fresh profile from backend...");
          const profileData = await userAPI.getProfile();
          console.log("✅ Fresh profile received:", profileData);
          
          // Check if profile indicates user is blocked
          if (profileData.isBlocked) {
            console.log("❌ User is blocked, logging out");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            setUser(null);
            toast.error("Your account has been blocked. Please contact administrator.");
            setLoading(false);
            return;
          }
          
          localStorage.setItem("user", JSON.stringify(profileData));
          setUser(profileData);
        } catch (error) {
          console.log("⚠️ Could not fetch fresh profile, using cached data");
          
          if (error.response?.status === 401) {
            console.log("❌ Token invalid, logging out");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            setUser(null);
          } else if (error.response?.status === 403 && error.response?.data?.isBlocked) {
            console.log("❌ User is blocked, logging out");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            setUser(null);
            toast.error("Your account has been blocked. Please contact administrator.");
          }
        }
      } catch (error) {
        console.error("❌ Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      console.log("👤 No stored user found");
      setUser(null);
    }
    
    setLoading(false);
  };

  initializeAuth();
}, []);

  const login = (userData, token) => {
    console.log("🔐 Login:", userData.email);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    console.log("🚪 Logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/purpose?type=register");
  };

  const updateUser = async (updatedData) => {
    try {
      console.log("📝 Updating user with data:", updatedData);
      const response = await userAPI.updateProfile(updatedData);
      console.log("✅ Update response:", response);
      
      localStorage.setItem("user", JSON.stringify(response));
      
      setUser(response);
      
      return response;
    } catch (error) {
      console.error("❌ Update user error:", error);
      throw error;
    }
  };

  const updateUserRole = (role) => {
    const updatedUser = { ...user, role };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("role", role);
    setUser(updatedUser);
  };

  const redirectBasedOnRole = (role) => {
  if (role === "admin") {
    navigate("/admin/dashboard");
  } 
  else if (role === "seller") {
    navigate("/seller");
  } 
  else if (role === "builder") {
    navigate("/builder");
  } 
  else if (role === "buyer") {
    navigate("/buyer");
  } 
  else {
    navigate("/");
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        updateUserRole,
        redirectBasedOnRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
