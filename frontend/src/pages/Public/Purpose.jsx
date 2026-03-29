import { useNavigate, useSearchParams } from "react-router-dom";
import { FaHome, FaCheckCircle, FaChevronRight } from "react-icons/fa";
import { useState } from "react";

function Purpose() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPurpose, setSelectedPurpose] = useState("");

  const type = searchParams.get("type");
  const purposes = [
    { id: "buyer",   label: "Buy a Home",       desc: "Explore and purchase properties.",   icon: "🏠" },
    { id: "seller",  label: "Sell a Property",   desc: "List and sell real estate.",         icon: "💰" },
    { id: "builder", label: "Build / Track",     desc: "Manage construction progress.",      icon: "🏗️" }
  ];

  const handleContinue = () => {
    if (!selectedPurpose) return;
    navigate(type === "login" ? `/login/${selectedPurpose}` : `/register/${selectedPurpose}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pu-sans  { font-family: 'DM Sans', sans-serif; }
        .pu-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .pu-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border: 1px solid rgba(139,115,85,0.18);
          border-radius: 2px;
          background: white;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .pu-card:hover {
          border-color: rgba(139,115,85,0.45);
          background: #FAFAF8;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .pu-card.selected {
          border-color: #8B7355;
          background: rgba(139,115,85,0.05);
          box-shadow: 0 6px 24px rgba(139,115,85,0.15);
          transform: translateX(3px);
        }

        .pu-icon-box {
          width: 44px; height: 44px;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          background: #F5F0E8;
          flex-shrink: 0;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .pu-card.selected .pu-icon-box {
          border-color: rgba(139,115,85,0.45);
          background: rgba(139,115,85,0.1);
        }

        .pu-check {
          opacity: 0;
          transform: scale(0.6);
          transition: opacity 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
          color: #8B7355;
        }
        .pu-card.selected .pu-check {
          opacity: 1;
          transform: scale(1);
        }

        .pu-btn {
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
          transition: background 0.25s ease, letter-spacing 0.25s ease, opacity 0.25s ease;
        }
        .pu-btn:hover:not(:disabled) { background: #2C2A26; letter-spacing: 0.16em; }
        .pu-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .pu-logo {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          width: fit-content;
        }
        .pu-logo:hover .pu-logo-icon { transform: rotate(12deg); }
        .pu-logo-icon { transition: transform 0.3s ease; }

        @keyframes pu-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pu-panel { animation: pu-rise 0.5s ease forwards; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ padding: '28px 36px' }}>
        <div className="pu-logo" onClick={() => navigate("/")}>
          <div className="pu-logo-icon" style={{ width: 34, height: 34, background: '#1E1C18', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaHome style={{ color: '#C4A97A', fontSize: '0.9rem' }} />
          </div>
          <span className="pu-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E1C18', letterSpacing: '0.05em' }}>HAVENIX</span>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="pu-panel" style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: 2, padding: '48px 44px', boxShadow: '0 24px 60px rgba(0,0,0,0.09)', border: '1px solid rgba(139,115,85,0.1)' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 20, height: 20, border: '1px solid #8B7355', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="pu-sans" style={{ fontSize: '0.55rem', fontWeight: 600, color: '#8B7355' }}>1</span>
            </div>
            <span className="pu-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355' }}>Step 1 of 2</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(139,115,85,0.15)', marginLeft: 4 }} />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 className="pu-serif" style={{ fontSize: '2.4rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
              Choose Your <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Role</em>
            </h2>
            <p className="pu-sans" style={{ color: '#8B7355', fontSize: '0.875rem', fontWeight: 300 }}>
              How would you like to use Havenix today?
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {purposes.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPurpose(p.id)}
                className={`pu-card ${selectedPurpose === p.id ? 'selected' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="pu-icon-box">{p.icon}</div>
                  <div>
                    <div className="pu-sans" style={{ fontSize: '0.93rem', fontWeight: 600, color: selectedPurpose === p.id ? '#1E1C18' : '#2C2A26', marginBottom: 2 }}>
                      {p.label}
                    </div>
                    <div className="pu-sans" style={{ fontSize: '0.78rem', color: '#8B7355', fontWeight: 300 }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
                <FaCheckCircle className="pu-check" size={18} />
              </button>
            ))}
          </div>

          {/* CTA */}
          <button onClick={handleContinue} disabled={!selectedPurpose} className="pu-btn">
            Continue as {selectedPurpose ? purposes.find(p => p.id === selectedPurpose)?.label : '…'}
            <FaChevronRight size={12} />
          </button>

          <p className="pu-sans" style={{ textAlign: 'center', marginTop: 18, fontSize: '0.72rem', color: '#A89880', letterSpacing: '0.04em' }}>
            You can change your role later in settings
          </p>

        </div>
      </div>
    </div>
  );
}

export default Purpose;