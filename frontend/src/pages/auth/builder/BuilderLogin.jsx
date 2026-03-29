import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../api/axios";
import { FaArrowRight, FaEye, FaEyeSlash, FaHome, FaHardHat } from "react-icons/fa";
import { GiConcreteBag } from "react-icons/gi";
import toast from "react-hot-toast";
import GoogleLogin from "../../../components/GoogleLogin";

function BuilderLogin() {
  const { login, redirectBasedOnRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await API.post("/user/login", { 
      email: formData.email, 
      password: formData.password 
    });
    
    const { token, role, isBlocked, ...userData } = response.data;
    
    // Check if user is blocked
    if (isBlocked) {
      toast.error("Your account has been blocked. Please contact administrator.");
      setError("Your account has been blocked. Please contact administrator.");
      setLoading(false);
      return;
    }
    
    if (role !== 'builder') {
      throw new Error('This login is for builders only. Please use the correct login page.');
    }
    
    login(userData, token);
    redirectBasedOnRole(role);
    toast.success(`Welcome back, ${userData.name || 'Builder'}!`);
    
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message || "Invalid email or password";
    
    if (err.response?.status === 403 && err.response?.data?.isBlocked) {
      setError(err.response.data.message || "Your account has been blocked");
    } else {
      setError(errMsg);
    }
    
    toast.error(errMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .bl-sans  { font-family: 'DM Sans', sans-serif; }
        .bl-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .bl-input {
          width: 100%;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1E1C18;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        }
        .bl-input:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
          background: white;
        }
        .bl-input::placeholder { color: #A89880; }

        .bl-btn {
          width: 100%;
          background: #1E1C18;
          color: #F5F0E8;
          border: none;
          padding: 14px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.25s ease, letter-spacing 0.25s ease;
        }
        .bl-btn:hover:not(:disabled) { background: #2C2A26; letter-spacing: 0.16em; }
        .bl-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .bl-link {
          color: #8B7355;
          text-decoration: none;
          font-size: 0.82rem;
          transition: color 0.2s ease;
        }
        .bl-link:hover { color: #1E1C18; text-decoration: underline; text-underline-offset: 3px; }

        .bl-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #A89880;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s ease;
        }
        .bl-eye-btn:hover { color: #8B7355; }

        @keyframes bl-error-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ display: 'flex', width: '100%', maxWidth: 960, background: 'white', borderRadius: 2, boxShadow: '0 32px 80px rgba(0,0,0,0.12)', overflow: 'hidden', minHeight: 580 }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ display: 'none', width: '45%', background: '#1E1C18', padding: '56px 48px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
          className="md-left-panel"
        >
          {/* Geometric accents */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, border: '1px solid rgba(139,115,85,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, border: '1px solid rgba(139,115,85,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 40, left: -40, width: 140, height: 140, background: 'rgba(139,115,85,0.06)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
              <FaHome style={{ fontSize: 18, color: '#8B7355' }} />
              <span className="bl-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F5F0E8', letterSpacing: '0.05em' }}>HAVENIX</span>
            </div>

            {/* Icon */}
            <div style={{ width: 56, height: 56, border: '1px solid rgba(139,115,85,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
              <FaHardHat style={{ fontSize: '1.5rem', color: '#C4A97A' }} />
            </div>

            <div className="bl-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 10 }}>
              Portal Access
            </div>
            <h1 className="bl-serif" style={{ fontSize: '3rem', fontWeight: 300, color: '#F5F0E8', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Builder<br /><em style={{ fontStyle: 'italic', color: '#C4A97A' }}>Portal</em>
            </h1>
            <p className="bl-sans" style={{ color: '#6B6355', fontSize: '0.875rem', lineHeight: 1.75, maxWidth: 260, fontWeight: 300 }}>
              Manage construction projects, track progress, and collaborate with your team seamlessly.
            </p>

            {/* Divider */}
            <div style={{ width: 40, height: 1, background: 'rgba(139,115,85,0.4)', marginTop: 32 }} />
          </div>

          <div className="bl-sans" style={{ fontSize: '0.68rem', color: '#3A3830', letterSpacing: '0.06em', position: 'relative', zIndex: 1 }}>
            © 2026 Havenix. Build better, faster.
          </div>
        </div>

        {/* ── RIGHT PANEL (Form) ── */}
        <div style={{ flex: 1, padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>

            {/* Mobile logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
              <FaHome style={{ fontSize: 16, color: '#8B7355' }} />
              <span className="bl-serif" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1E1C18', letterSpacing: '0.04em' }}>HAVENIX</span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, border: '1px solid rgba(139,115,85,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GiConcreteBag style={{ color: '#8B7355', fontSize: '0.9rem' }} />
                </div>
                <span className="bl-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355' }}>Builder Access</span>
              </div>
              <h2 className="bl-serif" style={{ fontSize: '2.2rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>
                Welcome <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Back</em>
              </h2>
              <p className="bl-sans" style={{ color: '#8B7355', fontSize: '0.85rem', fontWeight: 300 }}>Sign in to your builder dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bl-sans" style={{ background: 'rgba(196,80,60,0.08)', border: '1px solid rgba(196,80,60,0.25)', color: '#C4503C', padding: '12px 16px', borderRadius: 2, marginBottom: 24, fontSize: '0.82rem', animation: 'bl-error-in 0.2s ease forwards' }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label className="bl-sans" style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="builder@example.com"
                  className="bl-input"
                  required
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <label className="bl-sans" style={{ fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B7355' }}>
                    Password
                  </label>
                  <Link to="/forgot-password" className="bl-link" style={{ fontSize: '0.72rem' }}>Forgot?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bl-input"
                    style={{ paddingRight: 44 }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="bl-eye-btn">
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="bl-btn">
                {loading ? 'Signing in…' : 'Continue as Builder'}
                {!loading && <FaArrowRight size={13} />}
              </button>
            </form>

            {/* Google Login Button */}
<div style={{ marginTop: 24, position: 'relative' }}>
  <div style={{ 
    textAlign: 'center', 
    fontSize: '0.75rem', 
    color: '#A89880',
    marginBottom: 16,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(139,115,85,0.2)' }} />
    <span style={{ padding: '0 10px', background: '#fff' }}>OR</span>
    <div style={{ flex: 1, height: 1, background: 'rgba(139,115,85,0.2)' }} />
  </div>
  
  <GoogleLogin buttonText="Continue with Google" redirectTo="/builder" />
</div>

            {/* Footer links */}
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <p className="bl-sans" style={{ fontSize: '0.82rem', color: '#6B6355', marginBottom: 8 }}>
                New here?{' '}
                <Link to="/register/builder" className="bl-link" style={{ fontWeight: 500 }}>Create builder account</Link>
              </p>
              
            </div>

          </div>
        </div>
      </div>

      {/* Responsive: show left panel on md+ */}
      <style>{`
        @media (min-width: 768px) {
          .md-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default BuilderLogin;