import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);



  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!email.trim()) {
    toast.error("Please enter your email address");
    return;
  }

  try {
    setLoading(true);
    const { data } = await API.post("/user/forgot-password", { email });
    
    setSubmitted(true);
    toast.success("Reset link sent! Check your email.");
  } catch (error) {
    console.error("Forgot password error:", error);
    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

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
          animation: fp-fade-in 0.4s ease;
        }
        
        @keyframes fp-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
        .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="fp-card">
        {/* Header */}
        <div style={{ 
          background: '#1E1C18', 
          padding: '32px 32px 24px',
          borderBottom: '1px solid rgba(196,169,122,0.15)'
        }}>
          <Link 
            to="/purpose?type=register" 
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
            Forgot <em style={{ fontStyle: 'italic', color: '#C4A97A' }}>Password?</em>
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          {!submitted ? (
            <>
              <p className="fp-sans" style={{ 
                color: '#6B6355', 
                fontSize: '0.95rem', 
                lineHeight: 1.6,
                marginBottom: 24
              }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label className="fp-sans" style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#8B7355',
                    marginBottom: 6
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail 
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
                      type="email"
                      className="fp-input"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 60,
                height: 60,
                background: 'rgba(139,115,85,0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle size={30} color="#8B7355" />
              </div>
              
              <h3 className="fp-serif" style={{ 
                fontSize: '1.5rem', 
                fontWeight: 400, 
                color: '#1E1C18',
                marginBottom: 8
              }}>
                Check Your <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Email</em>
              </h3>
              
              <p className="fp-sans" style={{ 
                color: '#6B6355', 
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: 24
              }}>
                We've sent a password reset link to <strong>{email}</strong>. 
                The link will expire in 1 hour.
              </p>
              
              <p className="fp-sans" style={{ 
                fontSize: '0.85rem',
                color: '#A89880'
              }}>
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#8B7355', 
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit'
                  }}
                >
                  try again
                </button>
              </p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default ForgotPassword;