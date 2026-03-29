import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { userAPI } from "../../api/userApi";
import {
  Bell, Lock, Eye, EyeOff, Shield, Mail, Smartphone, Monitor,
  Languages, AlertCircle, Check, X, Save, User,
  Settings as SettingsIcon, ChevronRight, LogOut, Trash2,
  History, HelpCircle, FileText, MessageCircle, Star
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Settings() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);

  const [profileSettings, setProfileSettings] = useState({
    fullName: "", email: "", phone: "", language: "en", timezone: "IST", bio: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true, pushNotifications: true, smsNotifications: false,
    propertyAlerts: true, chatMessages: true, marketingEmails: false,
    weeklyNewsletter: true, newFeatureUpdates: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", showEmail: false, showPhone: false,
    showSavedProperties: true, activityStatus: true, twoFactorAuth: false,
  });

  const [securitySettings] = useState({
    lastLogin: new Date().toLocaleString(),
    lastPasswordChange: "30 days ago",
    loginDevices: [
      { device: "Chrome on Windows", location: "Mumbai, India", active: true },
      { device: "Safari on iPhone",  location: "Mumbai, India", active: false },
    ],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
    showCurrent: false, showNew: false, showConfirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileSettings({
        fullName: user.name || "", email: user.email || "", phone: user.phoneNo || "",
        language: user.language || "en", timezone: user.timezone || "IST", bio: user.bio || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await updateUser({ name: profileSettings.fullName, phoneNo: profileSettings.phone, bio: profileSettings.bio, language: profileSettings.language, timezone: profileSettings.timezone });
      toast.success("Profile updated successfully!");
    } catch { toast.error("Failed to update profile"); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("Passwords don't match!"); return; }
    if (passwordData.newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    try {
      setLoading(true);
      await userAPI.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "", showCurrent: false, showNew: false, showConfirm: false });
    } catch (err) { toast.error(err.message || "Failed to change password"); }
    finally { setLoading(false); }
  };

  const handleNotificationUpdate = async () => {
    try { setLoading(true); await updateUser({ notifications: notificationSettings }); toast.success("Notification settings updated!"); }
    catch { toast.error("Failed to update notification settings"); }
    finally { setLoading(false); }
  };

  const handlePrivacyUpdate = async () => {
    try { setLoading(true); await updateUser({ privacy: privacySettings }); toast.success("Privacy settings updated!"); }
    catch { toast.error("Failed to update privacy settings"); }
    finally { setLoading(false); }
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm("Are you sure you want to log out from all devices?")) {
      try { setLoading(true); await userAPI.logoutAllDevices(); logout(); navigate("/login"); toast.success("Logged out from all devices"); }
      catch { toast.error("Failed to log out from all devices"); }
      finally { setLoading(false); }
    }
  };

  

  const sections = [
    { id: "profile",       name: "Profile",          icon: User,         desc: "Personal information"       },
    { id: "notifications", name: "Notifications",     icon: Bell,         desc: "Alerts & preferences"       },
    { id: "privacy",       name: "Privacy",           icon: Shield,       desc: "Visibility controls"        },
    { id: "security",      name: "Security",          icon: Lock,         desc: "Password & sessions"        },
    { id: "history",       name: "Activity History",  icon: History,      desc: "Recent activity"            },
    { id: "help",          name: "Help & Support",    icon: HelpCircle,   desc: "Get assistance"             },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', padding: '40px 24px 80px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .st-sans  { font-family: 'DM Sans', sans-serif; }
        .st-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        /* ─ Nav item ─ */
        .st-nav-item {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 2px; cursor: pointer;
          border: none; background: transparent; text-align: left;
          transition: background 0.2s ease;
        }
        .st-nav-item:hover { background: rgba(139,115,85,0.06); }
        .st-nav-item.active { background: #1E1C18; }

        /* ─ Toggle switch ─ */
        .st-toggle { position: relative; display: inline-block; width: 42px; height: 24px; flex-shrink: 0; }
        .st-toggle input { opacity: 0; width: 0; height: 0; }
        .st-slider {
          position: absolute; inset: 0; background: rgba(139,115,85,0.2);
          border-radius: 24px; cursor: pointer;
          transition: background 0.25s ease;
        }
        .st-slider::before {
          content: ''; position: absolute;
          width: 18px; height: 18px; left: 3px; top: 3px;
          background: white; border-radius: 50%;
          transition: transform 0.25s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .st-toggle input:checked + .st-slider { background: #8B7355; }
        .st-toggle input:checked + .st-slider::before { transform: translateX(18px); }

        /* ─ Input ─ */
        .st-input {
          width: 100%; background: #F5F0E8; border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px; padding: 11px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1E1C18;
          outline: none; transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .st-input:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); background: white; }
        .st-input::placeholder { color: #A89880; }
        .st-input:disabled { opacity: 0.6; cursor: not-allowed; }

        .st-select {
          width: 100%; background: #F5F0E8; border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px; padding: 11px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1E1C18;
          outline: none; appearance: none; cursor: pointer;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        }
        .st-select:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); }

        .st-textarea {
          width: 100%; background: #F5F0E8; border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px; padding: 11px 14px; resize: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1E1C18;
          outline: none; transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .st-textarea:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); background: white; }
        .st-textarea::placeholder { color: #A89880; }

        .st-label {
          display: block; font-family: 'DM Sans', sans-serif;
          font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: #8B7355; margin-bottom: 7px;
        }

        /* ─ Buttons ─ */
        .st-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1E1C18; color: #F5F0E8; border: none;
          padding: 10px 24px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
          cursor: pointer; transition: background 0.25s ease, letter-spacing 0.25s ease;
        }
        .st-btn-primary:hover:not(:disabled) { background: #2C2A26; letter-spacing: 0.16em; }
        .st-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .st-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #8B7355;
          border: 1px solid rgba(139,115,85,0.35); padding: 10px 20px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          cursor: pointer; transition: all 0.25s ease;
        }
        .st-btn-ghost:hover { background: rgba(139,115,85,0.08); border-color: #8B7355; }

        .st-btn-danger {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #C4503C;
          border: 1px solid rgba(196,80,60,0.3); padding: 10px 20px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          cursor: pointer; transition: all 0.25s ease; width: 100%; justify-content: flex-start;
        }
        .st-btn-danger:hover { background: rgba(196,80,60,0.07); border-color: #C4503C; }

        /* ─ Section card ─ */
        .st-box {
          background: #FAFAF8; border: 1px solid rgba(139,115,85,0.12);
          border-radius: 2px; padding: 24px 28px; margin-bottom: 16px;
        }

        /* ─ Toggle row ─ */
        .st-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid rgba(139,115,85,0.08);
        }
        .st-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }

        /* ─ Help card ─ */
        .st-help-card {
          background: white; border: 1px solid rgba(139,115,85,0.15); border-radius: 2px;
          padding: 24px; cursor: pointer;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
        }
        .st-help-card:hover { border-color: #8B7355; box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }

        /* Password eye button */
        .st-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #A89880; cursor: pointer; padding: 0;
          display: flex; align-items: center; transition: color 0.2s ease;
        }
        .st-eye:hover { color: #8B7355; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '28px 36px', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, border: '2px solid #EDE8DC', borderTop: '2px solid #8B7355', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p className="st-sans" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355' }}>Saving…</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1140, margin: '0 auto' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 32 }}>
          <div className="st-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Account</div>
          <h1 className="st-serif" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 300, color: '#1E1C18', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Settings <em style={{ fontStyle: 'italic', color: '#8B7355' }}>&amp; Preferences</em>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* ── SIDEBAR ── */}
          <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 24 }}>
            <div style={{ background: 'white', borderRadius: 2, border: '1px solid rgba(139,115,85,0.12)', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>

              {/* User chip */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(139,115,85,0.1)' }}>
                <div className="st-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>Signed in as</div>
                <div className="st-sans" style={{ fontSize: '0.83rem', color: '#1E1C18', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                <div className="st-sans" style={{ fontSize: '0.72rem', color: '#8B7355', fontWeight: 300 }}>{user?.role || ''}</div>
              </div>

              {/* Nav links */}
              <div style={{ padding: '8px 12px' }}>
                {sections.map(({ id, name, icon: Icon, desc }) => (
                  <button key={id} className={`st-nav-item ${activeSection === id ? 'active' : ''}`} onClick={() => setActiveSection(id)}>
                    <div style={{ width: 30, height: 30, border: `1px solid ${activeSection === id ? 'rgba(196,169,122,0.3)' : 'rgba(139,115,85,0.2)'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color={activeSection === id ? '#C4A97A' : '#8B7355'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="st-sans" style={{ fontSize: '0.78rem', fontWeight: 500, color: activeSection === id ? '#F5F0E8' : '#2C2A26' }}>{name}</div>
                      <div className="st-sans" style={{ fontSize: '0.65rem', color: activeSection === id ? 'rgba(245,240,232,0.5)' : '#A89880', fontWeight: 300 }}>{desc}</div>
                    </div>
                    <ChevronRight size={13} color={activeSection === id ? '#C4A97A' : '#C4B9A8'} />
                  </button>
                ))}
              </div>

             
            </div>
          </div>

          {/* ── MAIN PANEL ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: 'white', borderRadius: 2, border: '1px solid rgba(139,115,85,0.12)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', padding: '36px 40px' }}>

              {/* Section heading helper */}
              {(() => {
                const sec = sections.find(s => s.id === activeSection);
                return (
                  <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(139,115,85,0.1)' }}>
                    <div className="st-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>{sec?.desc}</div>
                    <h2 className="st-serif" style={{ fontSize: '1.8rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em' }}>
                      {sec?.name.split(' ')[0]} <em style={{ fontStyle: 'italic', color: '#8B7355' }}>{sec?.name.split(' ').slice(1).join(' ')}</em>
                    </h2>
                  </div>
                );
              })()}

              {/* ── PROFILE ── */}
              {activeSection === "profile" && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label className="st-label">Full Name</label>
                      <input type="text" className="st-input" value={profileSettings.fullName} onChange={e => setProfileSettings(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="st-label">Email Address <span style={{ color: '#C4A97A', fontSize: '0.55rem' }}> — read only</span></label>
                      <input type="email" className="st-input" value={profileSettings.email} disabled />
                    </div>
                    <div>
                      <label className="st-label">Phone Number</label>
                      <input type="tel" className="st-input" value={profileSettings.phone} onChange={e => setProfileSettings(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label className="st-label">Language</label>
                        <select className="st-select" value={profileSettings.language} onChange={e => setProfileSettings(p => ({ ...p, language: e.target.value }))}>
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="mr">Marathi</option>
                          <option value="gu">Gujarati</option>
                        </select>
                      </div>
                      <div>
                        <label className="st-label">Timezone</label>
                        <select className="st-select" value={profileSettings.timezone} onChange={e => setProfileSettings(p => ({ ...p, timezone: e.target.value }))}>
                          <option value="IST">IST</option>
                          <option value="EST">EST</option>
                          <option value="PST">PST</option>
                          <option value="GMT">GMT</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label className="st-label">Bio</label>
                    <textarea className="st-textarea" rows={4} value={profileSettings.bio} onChange={e => setProfileSettings(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us a little about yourself…" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="st-btn-primary" onClick={handleProfileUpdate} disabled={loading}><Save size={13} /> Save Changes</button>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === "notifications" && (
                <div>
                  <div className="st-box">
                    {[
                      { id: "emailNotifications", label: "Email Notifications",  desc: "Receive updates via email",          Icon: Mail        },
                      { id: "pushNotifications",  label: "Push Notifications",   desc: "Receive browser notifications",      Icon: Monitor     },
                      { id: "smsNotifications",   label: "SMS Notifications",    desc: "Receive text messages",              Icon: Smartphone  },
                      { id: "propertyAlerts",     label: "Property Alerts",      desc: "Get alerts for new properties",      Icon: Bell        },
                      { id: "chatMessages",       label: "Chat Messages",        desc: "Instant message notifications",      Icon: MessageCircle },
                      { id: "marketingEmails",    label: "Marketing Emails",     desc: "Receive promotional offers",         Icon: Mail        },
                      { id: "weeklyNewsletter",   label: "Weekly Newsletter",    desc: "Get weekly property updates",        Icon: FileText    },
                      { id: "newFeatureUpdates",  label: "Feature Updates",      desc: "Learn about new features",           Icon: Star        },
                    ].map(({ id, label, desc, Icon }) => (
                      <div key={id} className="st-toggle-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={14} color="#8B7355" />
                          </div>
                          <div>
                            <div className="st-sans" style={{ fontSize: '0.85rem', color: '#1E1C18', fontWeight: 500 }}>{label}</div>
                            <div className="st-sans" style={{ fontSize: '0.72rem', color: '#A89880', fontWeight: 300 }}>{desc}</div>
                          </div>
                        </div>
                        <label className="st-toggle">
                          <input type="checkbox" checked={notificationSettings[id]} onChange={e => setNotificationSettings(p => ({ ...p, [id]: e.target.checked }))} />
                          <span className="st-slider" />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="st-btn-primary" onClick={handleNotificationUpdate} disabled={loading}><Save size={13} /> Save Preferences</button>
                  </div>
                </div>
              )}

              {/* ── PRIVACY ── */}
              {activeSection === "privacy" && (
                <div>
                  <div className="st-box" style={{ marginBottom: 16 }}>
                    <label className="st-label">Profile Visibility</label>
                    <select className="st-select" value={privacySettings.profileVisibility} onChange={e => setPrivacySettings(p => ({ ...p, profileVisibility: e.target.value }))}>
                      <option value="public">Public — Anyone can see your profile</option>
                      <option value="private">Private — Only you can see your profile</option>
                      <option value="contacts">Contacts Only</option>
                    </select>
                  </div>
                  <div className="st-box">
                    {[
                      { id: "showEmail",            label: "Show Email",                  desc: "Display your email on your profile"        },
                      { id: "showPhone",            label: "Show Phone",                  desc: "Display your phone number on your profile"  },
                      { id: "showSavedProperties",  label: "Show Saved Properties",       desc: "Display your saved properties publicly"     },
                      { id: "activityStatus",       label: "Activity Status",             desc: "Show when you're active"                   },
                      { id: "twoFactorAuth",        label: "Two-Factor Authentication",   desc: "Enable 2FA for extra security"             },
                    ].map(({ id, label, desc }) => (
                      <div key={id} className="st-toggle-row">
                        <div>
                          <div className="st-sans" style={{ fontSize: '0.85rem', color: '#1E1C18', fontWeight: 500 }}>{label}</div>
                          <div className="st-sans" style={{ fontSize: '0.72rem', color: '#A89880', fontWeight: 300 }}>{desc}</div>
                        </div>
                        <label className="st-toggle">
                          <input type="checkbox" checked={privacySettings[id]} onChange={e => setPrivacySettings(p => ({ ...p, [id]: e.target.checked }))} />
                          <span className="st-slider" />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="st-btn-primary" onClick={handlePrivacyUpdate} disabled={loading}><Save size={13} /> Save Privacy Settings</button>
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeSection === "security" && (
                <div>
                  {/* Change password */}
                  <div className="st-box">
                    <div className="st-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 16 }}>Change Password</div>
                    <form onSubmit={handlePasswordChange}>
                      {[
                        { key: 'currentPassword', showKey: 'showCurrent', label: 'Current Password', placeholder: 'Enter current password' },
                        { key: 'newPassword',      showKey: 'showNew',     label: 'New Password',     placeholder: 'Enter new password'     },
                        { key: 'confirmPassword',  showKey: 'showConfirm', label: 'Confirm Password', placeholder: 'Confirm new password'   },
                      ].map(({ key, showKey, label, placeholder }) => (
                        <div key={key} style={{ marginBottom: 14, position: 'relative' }}>
                          <label className="st-label">{label}</label>
                          <input
                            type={passwordData[showKey] ? "text" : "password"}
                            value={passwordData[key]}
                            onChange={e => setPasswordData(p => ({ ...p, [key]: e.target.value }))}
                            className="st-input"
                            style={{ paddingRight: 40 }}
                            placeholder={placeholder}
                            required
                          />
                          <button type="button" className="st-eye" onClick={() => setPasswordData(p => ({ ...p, [showKey]: !p[showKey] }))}>
                            {passwordData[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button type="submit" className="st-btn-primary" disabled={loading}><Lock size={13} /> Update Password</button>
                      </div>
                    </form>
                  </div>

                  {/* Sessions */}
                  <div className="st-box">
                    <div className="st-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 16 }}>Active Sessions</div>
                    {securitySettings.loginDevices.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < securitySettings.loginDevices.length - 1 ? '1px solid rgba(139,115,85,0.08)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.active ? '#8B7355' : 'rgba(139,115,85,0.25)', flexShrink: 0 }} />
                          <div>
                            <div className="st-sans" style={{ fontSize: '0.83rem', color: '#1E1C18', fontWeight: 500 }}>{d.device}</div>
                            <div className="st-sans" style={{ fontSize: '0.7rem', color: '#A89880', fontWeight: 300 }}>{d.location}</div>
                          </div>
                        </div>
                        {d.active && (
                          <button className="st-sans" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.68rem', color: '#C4503C', letterSpacing: '0.06em', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                            Logout
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={handleLogoutAllDevices} className="st-sans" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#8B7355', marginTop: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      Logout from all devices
                    </button>
                  </div>

                  {/* Login history */}
                  <div className="st-box" style={{ marginBottom: 0 }}>
                    <div className="st-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 14 }}>Login History</div>
                    {[
                      { label: 'Last login',            value: securitySettings.lastLogin           },
                      { label: 'Last password change',  value: securitySettings.lastPasswordChange  },
                    ].map(({ label, value }, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i === 0 ? '1px solid rgba(139,115,85,0.08)' : 'none' }}>
                        <span className="st-sans" style={{ fontSize: '0.78rem', color: '#8B7355', fontWeight: 300 }}>{label}</span>
                        <span className="st-sans" style={{ fontSize: '0.78rem', color: '#1E1C18' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── HISTORY ── */}
              {activeSection === "history" && (
                <div>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(139,115,85,0.08)' }}>
                      <div style={{ width: 36, height: 36, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <History size={14} color="#8B7355" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="st-sans" style={{ fontSize: '0.85rem', color: '#1E1C18', fontWeight: 500 }}>Viewed property: Luxury Villa in Goa</div>
                        <div className="st-sans" style={{ fontSize: '0.72rem', color: '#A89880', fontWeight: 300 }}>2 hours ago</div>
                      </div>
                      <span className="st-sans" style={{ fontSize: '0.65rem', color: '#C4B9A8', letterSpacing: '0.06em' }}>ID #12345</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── HELP ── */}
              {activeSection === "help" && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                    {[
                      { Icon: MessageCircle, title: 'Live Chat',       desc: 'Chat with our support team'       },
                      { Icon: Mail,          title: 'Email Support',   desc: 'support@havenix.com'              },
                      { Icon: FileText,      title: 'Documentation',   desc: 'Read our guides and tutorials'    },
                      { Icon: HelpCircle,    title: 'FAQ',             desc: 'Find answers to common questions' },
                    ].map(({ Icon, title, desc }, i) => (
                      <div key={i} className="st-help-card">
                        <div style={{ width: 36, height: 36, border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                          <Icon size={15} color="#8B7355" />
                        </div>
                        <div className="st-sans" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E1C18', marginBottom: 4 }}>{title}</div>
                        <div className="st-sans" style={{ fontSize: '0.75rem', color: '#A89880', fontWeight: 300 }}>{desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Dark CTA strip */}
                  <div style={{ background: '#1E1C18', borderRadius: 2, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, border: '1px solid rgba(196,169,122,0.12)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div className="st-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>24/7 Support</div>
                      <h3 className="st-serif" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#F5F0E8', marginBottom: 4 }}>Need immediate <em style={{ fontStyle: 'italic', color: '#C4A97A' }}>help?</em></h3>
                      <p className="st-sans" style={{ fontSize: '0.8rem', color: '#6B6355', fontWeight: 300 }}>Our support team is available around the clock.</p>
                    </div>
                    <button className="st-btn-primary" style={{ background: '#F5F0E8', color: '#1E1C18', position: 'relative', zIndex: 1 }}>
                      Contact Support
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;