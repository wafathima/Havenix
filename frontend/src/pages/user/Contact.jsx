import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import contact from "../../assets/contact.png";
import { FaHome, FaPaperPlane, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const Contact = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/enquiries/contact', {
        name: formData.name,
        email: formData.email,
        message: formData.message
      });
      toast.success(response.data.message || "Message sent successfully!");
      setFormData({ name: user?.name || '', email: user?.email || '', message: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      if (user && user.role === 'buyer') {
        setTimeout(() => navigate('/buyer?tab=enquiries'), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ct-sans  { font-family: 'DM Sans', sans-serif; }
        .ct-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .ct-input {
          width: 100%;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1E1C18;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .ct-input:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
          background: white;
        }
        .ct-input::placeholder { color: #A89880; }
        .ct-input:disabled { opacity: 0.65; cursor: not-allowed; }

        .ct-textarea {
          width: 100%;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1E1C18;
          outline: none;
          resize: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .ct-textarea:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
          background: white;
        }
        .ct-textarea::placeholder { color: #A89880; }
        .ct-textarea:disabled { opacity: 0.65; cursor: not-allowed; }

        .ct-label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #8B7355;
          margin-bottom: 8px;
        }

        .ct-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #1E1C18;
          color: #F5F0E8;
          border: none;
          padding: 14px 36px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s ease, letter-spacing 0.25s ease;
        }
        .ct-btn:hover:not(:disabled) { background: #2C2A26; letter-spacing: 0.16em; }
        .ct-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ct-info-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(196,169,122,0.15);
        }
        .ct-info-row:last-child { border-bottom: none; }

        @keyframes ct-success-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ct-success { animation: ct-success-in 0.3s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .ct-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(245,240,232,0.3);
          border-top-color: #F5F0E8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 520 }}>
        <div className="ct-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 12 }}>
          Get in Touch
        </div>
        <h1 className="ct-serif" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 300, color: '#1E1C18', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Contact <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Us</em>
        </h1>
        <p className="ct-sans" style={{ color: '#6B6355', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300 }}>
          Have a question or need assistance? We'd love to hear from you.
        </p>
      </div>

      {/* ── SUCCESS BANNER ── */}
      {submitted && (
        <div className="ct-success" style={{ width: '100%', maxWidth: 1100, marginBottom: 20, background: 'rgba(139,115,85,0.08)', border: '1px solid rgba(139,115,85,0.25)', borderLeft: '3px solid #8B7355', borderRadius: 2, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaCheckCircle style={{ color: '#8B7355', fontSize: '1.1rem', flexShrink: 0 }} />
          <div>
            <div className="ct-sans" style={{ fontWeight: 600, color: '#1E1C18', fontSize: '0.875rem' }}>Message Sent Successfully!</div>
            <div className="ct-sans" style={{ color: '#8B7355', fontSize: '0.78rem', fontWeight: 300 }}>Our team will get back to you within 24 hours.</div>
          </div>
        </div>
      )}

      {/* ── MAIN CARD ── */}
      <div style={{ width: '100%', maxWidth: 1100, background: 'white', borderRadius: 2, boxShadow: '0 24px 70px rgba(0,0,0,0.09)', overflow: 'hidden', display: 'flex', minHeight: 620, border: '1px solid rgba(139,115,85,0.1)' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ width: '38%', minWidth: 280, background: '#1E1C18', padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {/* Geometric ring accents */}
          <div style={{ position: 'absolute', top: -70, right: -70, width: 240, height: 240, border: '1px solid rgba(196,169,122,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 170, height: 170, border: '1px solid rgba(196,169,122,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 60, left: -50, width: 160, height: 160, background: 'rgba(139,115,85,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, cursor: 'pointer' }} onClick={() => navigate("/")}>
              <FaHome style={{ fontSize: 18, color: '#8B7355' }} />
              <span className="ct-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F5F0E8', letterSpacing: '0.05em' }}>HAVENIX</span>
            </div>

            <div className="ct-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 10 }}>
              Let's Talk
            </div>
            <h2 className="ct-serif" style={{ fontSize: '2.6rem', fontWeight: 300, color: '#F5F0E8', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 36 }}>
              Let's build<br />something <em style={{ fontStyle: 'italic', color: '#C4A97A' }}>great.</em>
            </h2>

            {/* Contact info rows */}
            <div>
              {[
                { Icon: FaPhoneAlt,      value: '+1 (234) 567-890'          },
                { Icon: FaEnvelope,      value: 'support@havenix.com'       },
                { Icon: FaMapMarkerAlt,  value: '123 Business Ave, Tech City' },
              ].map(({ Icon, value }, i) => (
                <div key={i} className="ct-info-row">
                  <div style={{ width: 36, height: 36, border: '1px solid rgba(196,169,122,0.25)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ color: '#C4A97A', fontSize: '0.82rem' }} />
                  </div>
                  <span className="ct-sans" style={{ fontSize: '0.83rem', color: '#9A9080', fontWeight: 300 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: 32 }}>
            <img src={contact} alt="Contact" style={{ width: '100%', maxWidth: 240, display: 'block', opacity: 0.85, filter: 'grayscale(20%)' }} />
          </div>
        </div>

        {/* ── RIGHT PANEL (Form) ── */}
        <div style={{ flex: 1, padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* Form heading */}
          <div style={{ marginBottom: 32 }}>
            <div className="ct-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Send a Message</div>
            <h3 className="ct-serif" style={{ fontSize: '1.8rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em' }}>
              How can we <em style={{ fontStyle: 'italic', color: '#8B7355' }}>help?</em>
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name + Email grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="ct-label">Full Name <span style={{ color: '#C4503C' }}>*</span></label>
                <input type="text" name="name" value={formData.name} required placeholder="John Doe" className="ct-input" onChange={handleChange} disabled={loading} />
              </div>
              <div>
                <label className="ct-label">Email Address <span style={{ color: '#C4503C' }}>*</span></label>
                <input type="email" name="email" value={formData.email} required placeholder="john@example.com" className="ct-input" onChange={handleChange} disabled={loading} />
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 20 }}>
              <label className="ct-label">Your Message <span style={{ color: '#C4503C' }}>*</span></label>
              <textarea name="message" value={formData.message} rows={5} required placeholder="How can we help you?" className="ct-textarea" onChange={handleChange} disabled={loading} />
            </div>

            {/* Logged-in notice */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '10px 14px', background: 'rgba(139,115,85,0.06)', border: '1px solid rgba(139,115,85,0.18)', borderRadius: 2 }}>
                <FaEnvelope style={{ color: '#8B7355', fontSize: '0.75rem', flexShrink: 0 }} />
                <span className="ct-sans" style={{ fontSize: '0.75rem', color: '#6B6355', fontWeight: 300 }}>
                  Logged in as <strong style={{ color: '#1E1C18', fontWeight: 500 }}>{user.email}</strong> — this message will be linked to your account.
                </span>
              </div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <button type="submit" disabled={loading} className="ct-btn">
                {loading ? <><div className="ct-spinner" /> Sending…</> : <>Send Message <FaPaperPlane size={12} /></>}
              </button>
              <span className="ct-sans" style={{ fontSize: '0.72rem', color: '#A89880', fontWeight: 300 }}>
                We respond within 24 hours on business days.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;