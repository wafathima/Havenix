import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("admin");

    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
        console.log("✅ Admin loaded from localStorage");
      } catch (e) {
        console.error("❌ Error parsing admin data:", e);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
      }
    } else {
      console.log("ℹ️ No admin token found");
    }
    setLoading(false);
  }, []);

  const login = (adminData, token) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("admin", JSON.stringify(adminData));
    setAdmin(adminData);
    console.log("✅ Admin logged in, token stored as adminToken");
    
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    
    setAdmin(null);
    navigate("/admin/login");
  };

  return (
    <AdminContext.Provider value={{ 
      admin, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AdminContext.Provider>
  );
};