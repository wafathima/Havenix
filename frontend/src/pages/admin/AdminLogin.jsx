import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import API from "../../api/axios";
import { FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";

function AdminLogin() {
  const { login } = useContext(AdminContext);
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
      const res = await API.post("/admin/login", {
        email: formData.email,
        password: formData.password,
      });
      const { token, ...adminData } = res.data;
      login(adminData, token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Jost:wght@300;400;500;600&display=swap');

        .admin-login-wrap {
          min-height: 100vh;
          display: flex;
          background: #f0ede6;
          font-family: 'Jost', sans-serif;
        }

        /* LEFT PANEL */
        .admin-left {
          width: 42%;
          background: #1a1a14;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem 3rem;
          position: relative;
          overflow: hidden;
        }

        .admin-left::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -80px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          border: 1px solid rgba(196,160,90,0.12);
          pointer-events: none;
        }
        .admin-left::after {
          content: '';
          position: absolute;
          bottom: 60px;
          left: -100px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          border: 1px solid rgba(196,160,90,0.08);
          pointer-events: none;
        }

        .left-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #f0ede6;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .left-logo svg {
          color: #c4a05a;
        }

        .left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 0;
        }

        .left-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #c4a05a;
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 2rem;
        }
        .left-badge span {
          width: 24px;
          height: 1px;
          background: #c4a05a;
          display: inline-block;
        }

        .left-icon-box {
          width: 58px;
          height: 58px;
          border: 1px solid rgba(196,160,90,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2.5rem;
          color: #c4a05a;
          font-size: 1.4rem;
        }

        .left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 4.2rem;
          font-weight: 300;
          line-height: 1.05;
          color: #f0ede6;
          margin-bottom: 0.2rem;
        }
        .left-title em {
          font-style: italic;
          color: #c4a05a;
        }

        .left-desc {
          margin-top: 1.8rem;
          color: rgba(240,237,230,0.5);
          font-size: 0.88rem;
          font-weight: 300;
          line-height: 1.75;
          max-width: 280px;
        }

        .left-footer {
          color: rgba(240,237,230,0.25);
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }

        /* RIGHT PANEL */
        .admin-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 4rem;
          background: #f0ede6;
          position: relative;
        }

        .right-inner {
          width: 100%;
          max-width: 420px;
        }

        .right-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #1a1a14;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 2.5rem;
        }
        .right-logo svg {
          color: #c4a05a;
        }

        .right-badge {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.2rem;
        }
        .right-badge-icon {
          width: 32px;
          height: 32px;
          border: 1px solid #c4a05a44;
          background: #c4a05a11;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          color: #c4a05a;
        }
        .right-badge-text {
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c4a05a;
          font-weight: 500;
        }

        .right-heading {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem;
          color: #1a1a14;
          font-weight: 400;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }
        .right-heading em {
          font-style: italic;
          color: #8a7a5a;
        }

        .right-sub {
          color: #7a7060;
          font-size: 0.88rem;
          font-weight: 300;
          margin-bottom: 2.5rem;
        }

        .field-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #5a5040;
          font-weight: 500;
          margin-bottom: 0.6rem;
        }

        .field-input {
          width: 100%;
          background: #e8e4db;
          border: 1px solid transparent;
          border-bottom: 1px solid #c4b898;
          padding: 0.85rem 1rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          color: #1a1a14;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .field-input::placeholder {
          color: #a89e88;
        }
        .field-input:focus {
          background: #e0dbd0;
          border-bottom-color: #c4a05a;
        }

        .password-wrap {
          position: relative;
        }
        .password-wrap .field-input {
          padding-right: 3rem;
        }
        .pw-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #a89e88;
          cursor: pointer;
          padding: 0;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .pw-toggle:hover { color: #1a1a14; }

        .field-group {
          margin-bottom: 1.5rem;
        }

        .error-box {
          background: rgba(180, 60, 60, 0.08);
          border: 1px solid rgba(180,60,60,0.2);
          color: #b43c3c;
          padding: 0.6rem 0.9rem;
          font-size: 0.82rem;
          margin-bottom: 1.5rem;
        }

        .submit-btn {
          width: 100%;
          background: #1a1a14;
          color: #f0ede6;
          border: none;
          padding: 1rem 1.5rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          transition: background 0.2s ease;
          margin-top: 0.5rem;
        }
        .submit-btn:hover:not(:disabled) {
          background: #c4a05a;
          color: #1a1a14;
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .back-link {
          display: block;
          text-align: center;
          margin-top: 1.8rem;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #a89e88;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: #1a1a14; }

        @media (max-width: 768px) {
          .admin-left { display: none; }
          .admin-right { background: #1a1a14; }
          .right-logo { color: #f0ede6; }
          .right-heading { color: #f0ede6; }
          .right-sub { color: rgba(240,237,230,0.5); }
          .field-label { color: rgba(240,237,230,0.6); }
          .field-input { background: rgba(240,237,230,0.08); color: #f0ede6; border-bottom-color: rgba(196,160,90,0.4); }
          .field-input::placeholder { color: rgba(240,237,230,0.3); }
          .submit-btn { background: #c4a05a; color: #1a1a14; }
          .back-link { color: rgba(240,237,230,0.4); }
          .back-link:hover { color: #f0ede6; }
        }
      `}</style>

      <div className="admin-login-wrap">
        {/* LEFT */}
        <div className="admin-left">
          <div className="left-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Havenix
          </div>

          <div className="left-body">
            <div className="left-badge">
              <span />
              Portal Access
            </div>
            <div className="left-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M20 21a8 8 0 1 0-16 0"/>
                <path d="M16 11l2 2 4-4"/>
              </svg>
            </div>
            <div className="left-title">
              Admin<br /><em>Portal</em>
            </div>
            <p className="left-desc">
              Manage users, projects, and monitor platform activity with the Havenix Admin Dashboard.
            </p>
          </div>

          <div className="left-footer">© 2026 Havenix. Build better, faster.</div>
        </div>

        {/* RIGHT */}
        <div className="admin-right">
          <div className="right-inner">
            <div className="right-logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Havenix
            </div>

            <div className="right-badge">
              <div className="right-badge-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M20 21a8 8 0 1 0-16 0"/>
                  <path d="M16 11l2 2 4-4"/>
                </svg>
              </div>
              <span className="right-badge-text">Admin Access</span>
            </div>

            <div className="right-heading">
              Welcome <em>Back</em>
            </div>
            <p className="right-sub">Sign in to your admin dashboard</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <div className="field-label">
                  <span>Email Address</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="field-input"
                  required
                />
              </div>

              <div className="field-group">
                <div className="field-label">
                  <span>Password</span>
                  <Link to="/admin/forgot-password" style={{ color: "#c4a05a", textDecoration: "none" }}>
                    Forgot?
                  </Link>
                </div>
                <div className="password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="field-input"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Signing in..." : "Continue as Admin"}
                <FaArrowRight />
              </button>
            </form>

            <Link to="/" className="back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;