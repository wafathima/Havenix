import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../../api/axios";
import { FaArrowRight, FaEye, FaEyeSlash, FaHome, FaDollarSign } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

function SellerRegister() {
  const navigate = useNavigate();
  const { role } = useParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    companyName: "",
    gstNumber: "",
    yearsOfExperience: ""
  });
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
      const res = await API.post("/user/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNo: formData.phoneNo,
        role: "seller",
        sellerDetails: {
          companyName: formData.companyName,
          gstNumber: formData.gstNumber,
          yearsOfExperience: parseInt(formData.yearsOfExperience)
        }
      });
      const userData = res.data;
      const token = userData.token;
      if (!token) throw new Error("No authentication token received");
      const { token: _, ...userWithoutToken } = userData;
      localStorage.setItem("token", token);
      login(userWithoutToken, token);
      toast.success("Seller account created successfully!");
      navigate("/seller/dashboard");
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "Registration failed";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .sr-sans  { font-family: 'DM Sans', sans-serif; }
        .sr-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .sr-input {
          width: 100%;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px;
          padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #1E1C18;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .sr-input:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
          background: white;
        }
        .sr-input::placeholder { color: #A89880; }

        .sr-label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #8B7355;
          margin-bottom: 7px;
        }

        .sr-opt-badge {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #A89880;
          border: 1px solid rgba(139,115,85,0.2);
          padding: 1px 6px;
          border-radius: 2px;
          margin-left: 6px;
          vertical-align: middle;
        }

        .sr-btn {
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
          margin-top: 8px;
        }
        .sr-btn:hover:not(:disabled) { background: #2C2A26; letter-spacing: 0.16em; }
        .sr-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .sr-link {
          color: #8B7355;
          text-decoration: none;
          font-size: 0.82rem;
          transition: color 0.2s ease;
        }
        .sr-link:hover { color: #1E1C18; text-decoration: underline; text-underline-offset: 3px; }

        .sr-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #A89880; cursor: pointer; padding: 0;
          display: flex; align-items: center; transition: color 0.2s ease;
        }
        .sr-eye:hover { color: #8B7355; }

        @keyframes sr-error-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 1024px) { .sr-left { display: flex !important; } }
      `}</style>

      <div style={{ display: 'flex', width: '100%', maxWidth: 1000, background: 'white', borderRadius: 2, boxShadow: '0 32px 80px rgba(0,0,0,0.12)', overflow: 'hidden', minHeight: 680 }}>

        {/* ── LEFT PANEL ── */}
        <div className="sr-left" style={{ display: 'none', width: '42%', background: '#1E1C18', padding: '56px 48px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: -70, right: -70, width: 240, height: 240, border: '1px solid rgba(139,115,85,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 170, height: 170, border: '1px solid rgba(139,115,85,0.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 60, left: -50, width: 160, height: 160, background: 'rgba(139,115,85,0.05)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
              <FaHome style={{ fontSize: 18, color: '#8B7355' }} />
              <span className="sr-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F5F0E8', letterSpacing: '0.05em' }}>HAVENIX</span>
            </div>

            <div style={{ width: 52, height: 52, border: '1px solid rgba(139,115,85,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
              <FaDollarSign style={{ color: '#C4A97A', fontSize: '1.3rem' }} />
            </div>

            <div className="sr-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 10 }}>
              Join Our Network
            </div>
            <h1 className="sr-serif" style={{ fontSize: '3rem', fontWeight: 300, color: '#F5F0E8', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Join as a<br /><em style={{ fontStyle: 'italic', color: '#C4A97A' }}>Seller</em>
            </h1>
            <p className="sr-sans" style={{ color: '#6B6355', fontSize: '0.875rem', lineHeight: 1.75, maxWidth: 260, fontWeight: 300 }}>
              List your properties, reach potential buyers, and close deals faster with our platform.
            </p>

            <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 1, background: 'rgba(139,115,85,0.4)' }} />
              <span className="sr-sans" style={{ fontSize: '0.72rem', color: '#8B7355', letterSpacing: '0.08em' }}>500+ Active Sellers</span>
            </div>
          </div>

          <div className="sr-sans" style={{ fontSize: '0.68rem', color: '#3A3830', letterSpacing: '0.06em', position: 'relative', zIndex: 1 }}>
            © 2026 Havenix. Sell with confidence.
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>

            {/* Mobile logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
              <FaHome style={{ fontSize: 16, color: '#8B7355' }} />
              <span className="sr-serif" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1E1C18', letterSpacing: '0.04em' }}>HAVENIX</span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, border: '1px solid rgba(139,115,85,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaDollarSign style={{ color: '#8B7355', fontSize: '0.85rem' }} />
                </div>
                <span className="sr-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355' }}>Seller Registration</span>
              </div>
              <h2 className="sr-serif" style={{ fontSize: '2rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>
                Create Your <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Account</em>
              </h2>
              <p className="sr-sans" style={{ color: '#8B7355', fontSize: '0.83rem', fontWeight: 300 }}>
                Start listing properties and reaching buyers today
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="sr-sans" style={{ background: 'rgba(196,80,60,0.08)', border: '1px solid rgba(196,80,60,0.25)', color: '#C4503C', padding: '11px 16px', borderRadius: 2, marginBottom: 20, fontSize: '0.82rem', animation: 'sr-error-in 0.2s ease forwards' }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                {/* Full Name — full width */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="sr-label">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="sr-input" required />
                </div>

                {/* Email — full width */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="sr-label">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seller@example.com" className="sr-input" required />
                </div>

                {/* Phone + Experience side by side */}
                <div>
                  <label className="sr-label">Phone</label>
                  <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="+91 98765 43210" className="sr-input" required />
                </div>
                <div>
                  <label className="sr-label">Experience (yrs)</label>
                  <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} placeholder="5" className="sr-input" />
                </div>

                {/* Company + GST side by side */}
                <div>
                  <label className="sr-label">
                    Company <span className="sr-opt-badge">optional</span>
                  </label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Havenix Realty" className="sr-input" />
                </div>
                <div>
                  <label className="sr-label">
                    GST No. <span className="sr-opt-badge">optional</span>
                  </label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="sr-input" />
                </div>

                {/* Password — full width */}
                <div style={{ gridColumn: 'span 2', marginBottom: 4 }}>
                  <label className="sr-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="sr-input"
                      style={{ paddingRight: 44 }}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="sr-eye">
                      {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="sr-btn">
                {loading ? 'Creating Account…' : 'Create Seller Account'}
                {!loading && <FaArrowRight size={13} />}
              </button>
            </form>

            {/* Footer links */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(139,115,85,0.1)', textAlign: 'center' }}>
              <p className="sr-sans" style={{ fontSize: '0.82rem', color: '#6B6355', marginBottom: 8 }}>
                Already have an account?{' '}
                <Link to="/login/seller" className="sr-link" style={{ fontWeight: 500 }}>Login here</Link>
              </p>
              <Link to="/register" className="sr-link" style={{ fontSize: '0.75rem', color: '#A89880' }}>
                Other roles? Register here
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerRegister;