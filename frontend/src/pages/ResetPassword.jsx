import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const { data } = await API.get(`/user/verify-reset-token/${token}`);
      setTokenValid(data.valid);
    } catch (error) {
      console.error("Token verification error:", error);
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
       const { data } = await API.post(`/user/reset-password/${token}`, { password });
      
      setResetComplete(true);
      toast.success("Password reset successful!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#F5F0E8', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '2px solid #EDE8DC', 
            borderTop: '2px solid #8B7355', 
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p className="fp-sans" style={{ color: '#8B7355' }}>Verifying your link...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#F5F0E8', 
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        `}</style>
        
        <div style={{ 
          background: 'white',
          borderRadius: 2,
          maxWidth: 400,
          width: '100%',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: 70,
            height: 70,
            background: 'rgba(196,80,60,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <AlertCircle size={35} color="#C4503C" />
          </div>
          
          <h1 className="fp-serif" style={{ 
            fontSize: '1.8rem', 
            fontWeight: 400, 
            color: '#1E1C18',
            marginBottom: 10
          }}>
            Invalid or <em style={{ fontStyle: 'italic', color: '#C4503C' }}>Expired</em> Link
          </h1>
          
          <p className="fp-sans" style={{ 
            color: '#6B6355', 
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: 24
          }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          
          <Link 
            to="/forgot-password"
            className="fp-btn"
            style={{ 
              display: 'inline-block',
              textDecoration: 'none',
              padding: '12px 32px'
            }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#F5F0E8', 
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        `}</style>
        
        <div style={{ 
          background: 'white',
          borderRadius: 2,
          maxWidth: 400,
          width: '100%',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: 70,
            height: 70,
            background: 'rgba(139,115,85,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle size={35} color="#8B7355" />
          </div>
          
          <h1 className="fp-serif" style={{ 
            fontSize: '1.8rem', 
            fontWeight: 400, 
            color: '#1E1C18',
            marginBottom: 10
          }}>
            Password <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Reset</em>
          </h1>
          
          <p className="fp-sans" style={{ 
            color: '#6B6355', 
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: 24
          }}>
            Your password has been successfully reset. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F5F0E8', 
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .fp-sans { font-family: 'DM Sans', sans-serif; }
        .fp-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        
        .fp-card {
          background: white;
          border-radius: 2px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 440px;
          overflow: hidden;
        }
        
        .fp-input {
          width: 100%;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #1E1C18;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .fp-input:focus {
          border-color: #8B7355;
          background: white;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }
        
        .fp-btn {
          width: 100%;
          background: #8B7355;
          color: #F5F0E8;
          border: none;
          padding: 14px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .fp-btn:hover:not(:disabled) { background: #7A6445; }
      `}</style>

      <div className="fp-card">
        {/* Header */}
        <div style={{ 
          background: '#1E1C18', 
          padding: '32px 32px 24px',
          borderBottom: '1px solid rgba(196,169,122,0.15)'
        }}>
          <Link 
            to="/login" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              color: '#8B7355', 
              textDecoration: 'none',
              fontSize: '0.8rem',
              marginBottom: 16
            }}
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
          
          <h1 className="fp-serif" style={{ 
            fontSize: '2.2rem', 
            fontWeight: 400, 
            color: '#F5F0E8', 
            margin: 0,
            lineHeight: 1.2
          }}>
            Create <em style={{ fontStyle: 'italic', color: '#C4A97A' }}>New Password</em>
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="fp-sans" style={{
                display: 'block',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#8B7355',
                marginBottom: 6
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: 14, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#A89880'
                  }} 
                />
                <input
                  type="password"
                  className="fp-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 42 }}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="fp-sans" style={{
                display: 'block',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#8B7355',
                marginBottom: 6
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: 14, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#A89880'
                  }} 
                />
                <input
                  type="password"
                  className="fp-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="fp-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={{ 
                    width: 16, 
                    height: 16, 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid white', 
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;