import { useContext, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

export default function GoogleLogin({ buttonText = "Continue with Google", redirectTo = "/" }) {
  const { login, redirectBasedOnRole } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);



const handleGoogleLogin = async () => {
  try {
    setLoading(true);
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log("Google user:", user);
    
    const userData = {
      name: user.displayName,
      email: user.email,
      profilePic: user.photoURL,
      firebaseUid: user.uid 
    };
    
    console.log("Sending to backend:", userData);
    
    const response = await API.post('/user/google-login', userData);
    
    const { token, role, isBlocked, ...userInfo } = response.data;
    
    if (isBlocked) {
      toast.error("Your account has been blocked. Please contact administrator.");
      return;
    }
    
    login(userInfo, token);
    
    if (redirectTo === "/" && role) {
      redirectBasedOnRole(role);
    } else {
      window.location.href = redirectTo;
    }
    
    toast.success(`Welcome, ${userInfo.name || 'User'}!`);
    
  } catch (error) {
    console.error("Google login error:", error);
    console.error("Error response:", error.response?.data);
    toast.error(error.response?.data?.message || "Failed to login with Google");
  } finally {
    setLoading(false);
  }
};  

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: 'white',
        border: '1px solid rgba(139,115,85,0.25)',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.85rem',
        color: '#1E1C18',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F5F0E8'}
      onMouseLeave={e => e.currentTarget.style.background = 'white'}
    >
      <FcGoogle size={20} />
      {loading ? 'Please wait...' : buttonText}
    </button>
  );
}