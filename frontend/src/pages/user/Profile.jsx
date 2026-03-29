import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { userAPI } from "../../api/userApi";
import API from "../../api/axios"; 
import {
  Pencil, Lock, Camera, X, Check, Upload, User, Mail,
  MapPin, Hash, Building2, Phone, Trash2, Settings,
  Shield, Award, Calendar, Heart, Home, Briefcase,
  Star, BadgeCheck, Sparkles,   
} from "lucide-react";

function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    fullName: "", emailId: "", address: "", zipCode: "",
    city: "", phoneNo: "", bio: "", role: "",
  });
  const [tempFormData, setTempFormData] = useState({ ...formData });
  const [profilePic, setProfilePic] = useState("");
  const [bgGradient, setBgGradient] = useState("charcoal");
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [stats, setStats] = useState({
  savedProperties: 0,
  totalProperties: 0,
  activeProperties: 0,
  totalProjects: 0,
  completedProjects: 0
});

  const bannerOptions = [
    { name: "Charcoal",      value: "charcoal",    css: "linear-gradient(135deg, #1E1C18 0%, #2C2A26 100%)" },
    { name: "Warm Dusk",     value: "dusk",        css: "linear-gradient(135deg, #2C2016 0%, #4A3420 100%)" },
    { name: "Deep Slate",    value: "slate",       css: "linear-gradient(135deg, #1A1F2C 0%, #2D3447 100%)" },
    { name: "Forest",        value: "forest",      css: "linear-gradient(135deg, #141E18 0%, #1E3426 100%)" },
    { name: "Ivory Gold",    value: "ivory",       css: "linear-gradient(135deg, #3A3020 0%, #6A5430 100%)" },
    { name: "Muted Wine",    value: "wine",        css: "linear-gradient(135deg, #2A1020 0%, #3E1830 100%)" },
  ];

  const getBannerCSS = (val) => bannerOptions.find(b => b.value === val)?.css || bannerOptions[0].css;

  const DEFAULT_AVATAR = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?w=740";

  useEffect(() => {
    if (user) {
      let pic = DEFAULT_AVATAR;
      if (user.profilePic) {
        if (user.profilePic.startsWith('http')) pic = user.profilePic;
        else if (user.profilePic.startsWith('/uploads')) pic = `http://localhost:5050${user.profilePic}`;
        else if (user.profilePic.startsWith('data:image')) pic = user.profilePic;
      }
      setProfilePic(pic);
      setBgGradient(user.bgGradient || "charcoal");
      const data = {
        fullName: user.name || "", emailId: user.email || "", address: user.address || "",
        zipCode: user.zipCode || "", city: user.city || "", phoneNo: user.phoneNo || "",
        bio: user.bio || "", role: user.role || "",
      };
      setFormData(data);
      setTempFormData(data);
    }
  }, [user]);

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ text: "", type: "" }), 3500);
      return () => clearTimeout(t);
    }
  }, [message.text]);

  const handleEdit = async () => {
    if (isEditing) {
      try {
        setLoading(true);
        const updated = await updateUser({
          name: tempFormData.fullName, address: tempFormData.address,
          zipCode: tempFormData.zipCode, city: tempFormData.city,
          phoneNo: tempFormData.phoneNo, bio: tempFormData.bio, bgGradient,
        });
        setFormData({
          fullName: updated.name || "", emailId: updated.email || "",
          address: updated.address || "", zipCode: updated.zipCode || "",
          city: updated.city || "", phoneNo: updated.phoneNo || "",
          bio: updated.bio || "", role: updated.role || "",
        });
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setIsEditing(false);
      } catch (err) {
        setMessage({ text: err.message || "Failed to update", type: "error" });
      } finally { setLoading(false); }
    } else {
      setTempFormData({ ...formData });
      setIsEditing(true);
    }
  };

  const handleCancel = () => { setTempFormData({ ...formData }); setIsEditing(false); };
  const handleInputChange = (e) => setTempFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const fd = new FormData(); fd.append("profilePic", file);
      const res = await userAPI.uploadProfilePic(fd);
      const path = res.profilePic.startsWith('/') ? res.profilePic : `/${res.profilePic}`;
      setProfilePic(`http://localhost:5050${path}`);
      setShowProfilePicModal(false);
      setMessage({ text: "Profile picture updated!", type: "success" });
    } catch { setMessage({ text: "Upload failed", type: "error" }); }
    finally { setLoading(false); }
  };

  const handleRemoveProfilePic = async () => {
    try {
      setLoading(true);
      await updateUser({ profilePic: null });
      setProfilePic(DEFAULT_AVATAR);
      setShowProfilePicModal(false);
      setMessage({ text: "Profile picture removed", type: "success" });
    } catch { setMessage({ text: "Failed to remove image", type: "error" }); }
    finally { setLoading(false); }
  };

  const handleGradientChange = async (val) => {
    setBgGradient(val);
    try { await updateUser({ bgGradient: val }); setMessage({ text: "Banner updated!", type: "success" }); }
    catch { setMessage({ text: "Failed to update banner", type: "error" }); }
    setShowBackgroundModal(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "Passwords don't match!", type: "error" }); return;
    }
    try {
      setLoading(true);
      await userAPI.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setMessage({ text: "Password changed!", type: "success" });
      setShowPasswordModal(false);
    } catch (err) { setMessage({ text: err.message || "Failed", type: "error" }); }
    finally { setLoading(false); }
  };


// Fetch role-specific stats
useEffect(() => {
  const fetchRoleStats = async () => {
    if (!user) return;

    try {
      if (user.role === 'buyer') {
        const saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
        setStats(prev => ({ ...prev, savedProperties: saved.length }));
      }
      
      else if (user.role === 'seller') {
        const { data } = await API.get('/seller/properties');
        const properties = Array.isArray(data) ? data : (data.properties || []);
        const active = properties.filter(p => p.status === 'available').length;
        setStats(prev => ({ 
          ...prev, 
          totalProperties: properties.length,
          activeProperties: active
        }));
      }
      
      else if (user.role === 'builder') {
        const { data } = await API.get('/builder/projects');
        const projects = Array.isArray(data) ? data : (data.projects || []);
        const completed = projects.filter(p => p.status === 'completed').length;
        setStats(prev => ({ 
          ...prev, 
          totalProjects: projects.length,
          completedProjects: completed
        }));
      }
    } catch (error) {
      console.error("Error fetching role stats:", error);
      toast.error("Failed to load your statistics");
    }
  };

  fetchRoleStats();
}, [user]);

  const roleLabel = formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : "User";

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pf-sans  { font-family: 'DM Sans', sans-serif; }
        .pf-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .pf-field {
          display: flex; align-items: center;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 11px 14px;
          background: #F5F0E8;
          gap: 10px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .pf-field.active {
          border-color: #8B7355;
          background: white;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }
        .pf-field.disabled { opacity: 0.7; }

        .pf-input {
          width: 100%; background: transparent; border: none; outline: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1E1C18;
        }
        .pf-input::placeholder { color: #A89880; }
        .pf-input:disabled { color: #6B6355; }

        .pf-textarea {
          width: 100%; border: 1px solid rgba(139,115,85,0.2); border-radius: 2px;
          padding: 12px 14px; background: #F5F0E8; outline: none; resize: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1E1C18;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-sizing: border-box;
        }
        .pf-textarea.active { border-color: #8B7355; background: white; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); }
        .pf-textarea:disabled { color: #6B6355; opacity: 0.7; }
        .pf-textarea::placeholder { color: #A89880; }

        .pf-label {
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: #8B7355; margin-bottom: 7px;
        }

        .pf-tab {
          flex: 1; padding: 14px 20px;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          color: #A89880; border-bottom: 2px solid transparent;
          transition: color 0.25s ease, border-color 0.25s ease;
        }
        .pf-tab.active { color: #1E1C18; border-bottom-color: #8B7355; }
        .pf-tab:hover:not(.active) { color: #6B6355; }

        .pf-btn-primary {
          display: flex; align-items: center; gap: 8px;
          background: #1E1C18; color: #F5F0E8;
          border: none; padding: 10px 22px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
          cursor: pointer; transition: background 0.25s ease, letter-spacing 0.25s ease;
        }
        .pf-btn-primary:hover { background: #2C2A26; letter-spacing: 0.16em; }

        .pf-btn-ghost {
          display: flex; align-items: center; gap: 8px;
          background: transparent; color: #8B7355;
          border: 1px solid rgba(139,115,85,0.35); padding: 10px 20px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          cursor: pointer; transition: all 0.25s ease;
        }
        .pf-btn-ghost:hover { background: rgba(139,115,85,0.08); border-color: #8B7355; }

        .pf-btn-danger {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          background: rgba(196,80,60,0.08); color: #C4503C;
          border: 1px solid rgba(196,80,60,0.25); padding: 12px 20px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
          cursor: pointer; width: 100%; transition: all 0.25s ease;
        }
        .pf-btn-danger:hover { background: rgba(196,80,60,0.14); border-color: #C4503C; }

        .pf-stat-box {
          text-align: center; padding: 16px 8px;
          border-right: 1px solid rgba(139,115,85,0.1);
        }
        .pf-stat-box:last-child { border-right: none; }

        .pf-info-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(139,115,85,0.08);
        }
        .pf-info-row:last-child { border-bottom: none; }

        .pf-banner-swatch {
          height: 56px; border-radius: 2px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; font-size: 0.65rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; color: rgba(255,255,255,0.7);
          border: 2px solid transparent;
          transition: all 0.25s ease;
        }
        .pf-banner-swatch:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.25); }
        .pf-banner-swatch.selected { border-color: #C4A97A; color: white; }

        .pf-modal-input {
          width: 100%; background: #F5F0E8; border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px; padding: 12px 14px; outline: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #1E1C18;
          transition: all 0.25s ease; box-sizing: border-box;
        }
        .pf-modal-input:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); background: white; }
        .pf-modal-input::placeholder { color: #A89880; }

        .pf-avatar-ring {
          width: 120px; height: 120px; border-radius: 50%;
          border: 4px solid white; box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          overflow: hidden; position: relative;
        }
        .pf-avatar-ring img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .pf-avatar-group:hover .pf-avatar-ring img { transform: scale(1.08); }
        .pf-camera-btn {
          position: absolute; bottom: 3px; right: 3px;
          width: 30px; height: 30px; border-radius: 50%;
          background: #1E1C18; border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.25s ease;
        }
        .pf-avatar-group:hover .pf-camera-btn { opacity: 1; }

        @keyframes pf-slide-in {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes pf-scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .pf-toast   { animation: pf-slide-in 0.3s ease forwards; }
        .pf-modal   { animation: pf-scale-in 0.2s ease forwards; }
      `}</style>

      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '32px 40px', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '2px solid #EDE8DC', borderTop: '2px solid #8B7355', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p className="pf-sans" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355' }}>Loading…</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── TOAST ── */}
      {message.text && (
        <div className="pf-toast" style={{
          position: 'fixed', top: 24, right: 24, zIndex: 60,
          background: message.type === 'success' ? '#1E1C18' : 'rgba(196,80,60,0.95)',
          color: '#F5F0E8', padding: '12px 20px', borderRadius: 2,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          borderLeft: `3px solid ${message.type === 'success' ? '#C4A97A' : '#F5A090'}`,
        }}>
          {message.type === 'success' ? <Check size={15} color="#C4A97A" /> : <X size={15} color="#F5A090" />}
          <span className="pf-sans" style={{ fontSize: '0.82rem' }}>{message.text}</span>
        </div>
      )}

      {/* ── BANNER ── */}
      <div style={{ height: 220, background: getBannerCSS(bgGradient), position: 'relative', overflow: 'hidden' }}>
        {/* Subtle gold ring accents */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, border: '1px solid rgba(196,169,122,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, border: '1px solid rgba(196,169,122,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 160, height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Banner name */}
        <div style={{ position: 'absolute', bottom: 20, left: 32 }}>
          <div className="pf-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(196,169,122,0.7)', marginBottom: 2 }}>
            {formData.role && `${roleLabel} Profile`}
          </div>
        </div>

        <button
          onClick={() => setShowBackgroundModal(true)}
          style={{ position: 'absolute', bottom: 16, right: 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 2, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.25s ease' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          <Pencil size={13} color="rgba(255,255,255,0.8)" />
          <span className="pf-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Style</span>
        </button>
      </div>

      {/* ── LAYOUT ── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* ── SIDEBAR ── */}
          <div style={{ width: 300, flexShrink: 0, marginTop: -60, position: 'relative', zIndex: 10 }}>
            <div style={{ background: 'white', borderRadius: 2, border: '1px solid rgba(139,115,85,0.12)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', overflow: 'visible' }}>

              {/* Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 24px', marginTop: -40 }}>
                <div className="pf-avatar-group" style={{ position: 'relative', marginBottom: 16 }}>
                  <div className="pf-avatar-ring">
                    <img src={profilePic} alt="Profile" />
                  </div>
                  <button className="pf-camera-btn" onClick={() => setShowProfilePicModal(true)}>
                    <Camera size={13} color="white" />
                  </button>
                </div>

                <h2 className="pf-serif" style={{ fontSize: '1.6rem', fontWeight: 500, color: '#1E1C18', marginBottom: 4, textAlign: 'center' }}>
                  {formData.fullName || "Your Name"}
                </h2>
                <p className="pf-sans" style={{ fontSize: '0.8rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
                  <Mail size={12} /> {formData.emailId || "email@example.com"}
                </p>

                <div className="pf-sans" style={{ background: '#1E1C18', color: '#C4A97A', padding: '5px 14px', borderRadius: 2, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {roleLabel}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(139,115,85,0.1)', margin: '0 0' }} />

              {/* Stats */}
              {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
                {[
                  { Icon: Home,  label: 'Properties', value: '12' },
                  { Icon: Heart, label: 'Saved',       value: '8'  },
                  { Icon: Star,  label: 'Rating',      value: '4.8'},
                ].map(({ Icon, label, value }, i) => (
                  <div key={i} className="pf-stat-box">
                    <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>{value}</div>
                    <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div> */}

              {/* Stats - Role Specific */}
<div style={{ display: 'grid', gridTemplateColumns: user?.role === 'buyer' ? 'repeat(1,1fr)' : 'repeat(2,1fr)', gap: '10px' }}>
  
  {/* Buyer Stats - Show only Saved Properties */}
  {user?.role === 'buyer' && (
    <div className="pf-stat-box" style={{ borderRight: 'none' }}>
      <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>
        {stats.savedProperties || 0}
      </div>
      <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>
        <Heart size={12} style={{ display: 'inline', marginRight: 4 }} /> Saved
      </div>
    </div>
  )}

  {/* Seller Stats - Show Total Properties */}
  {user?.role === 'seller' && (
    <>
      <div className="pf-stat-box">
        <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>
          {stats.totalProperties || 0}
        </div>
        <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>
          <Home size={12} style={{ display: 'inline', marginRight: 4 }} /> Properties
        </div>
      </div>
      <div className="pf-stat-box">
        <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>
          {stats.activeProperties || 0}
        </div>
        <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>
          <Briefcase size={12} style={{ display: 'inline', marginRight: 4 }} /> Active
        </div>
      </div>
    </>
  )}

  {/* Builder Stats - Show Total Projects */}
  {user?.role === 'builder' && (
    <>
      <div className="pf-stat-box">
        <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>
          {stats.totalProjects || 0}
        </div>
        <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>
          <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} /> Projects
        </div>
      </div>
      <div className="pf-stat-box">
        <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>
          {stats.completedProjects || 0}
        </div>
        <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>
          <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> Completed
        </div>
      </div>
    </>
  )}

  {/* Default/Admin Stats */}
  {(!user?.role || user?.role === 'admin') && (
    <>
      <div className="pf-stat-box">
        <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>0</div>
        <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>Activity</div>
      </div>
      <div className="pf-stat-box">
        <div className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1 }}>0</div>
        <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginTop: 4 }}>Metrics</div>
      </div>
    </>
  )}
</div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(139,115,85,0.1)' }} />

              {/* Info rows */}
              <div style={{ padding: '16px 24px' }}>
                <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A89880', marginBottom: 12 }}>Details</div>

                {[
                  { Icon: Phone,    label: 'Phone',      value: formData.phoneNo || '—'          },
                  { Icon: MapPin,   label: 'Location',   value: formData.city    || '—'          },
                  { Icon: Calendar, label: 'Member',     value: 'Since 2024'                     },
                  { Icon: Award,    label: 'Membership', value: 'Premium Gold'                   },
                ].map(({ Icon, label, value }, i) => (
                  <div key={i} className="pf-info-row">
                    <div style={{ width: 32, height: 32, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color="#8B7355" />
                    </div>
                    <div>
                      <div className="pf-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A89880' }}>{label}</div>
                      <div className="pf-sans" style={{ fontSize: '0.83rem', color: '#1E1C18', fontWeight: 400 }}>{value}</div>
                    </div>
                  </div>
                ))}

                {/* Verified badge */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {[
                    { Icon: BadgeCheck, label: 'Verified'       },
                    { Icon: Shield,     label: 'Secure Account' },
                  ].map(({ Icon, label }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(139,115,85,0.07)', border: '1px solid rgba(139,115,85,0.18)', borderRadius: 2, padding: '5px 10px' }}>
                      <Icon size={11} color="#8B7355" />
                      <span className="pf-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN CARD ── */}
          <div style={{ flex: 1, minWidth: 0, marginTop: 28 }}>
            <div style={{ background: 'white', borderRadius: 2, border: '1px solid rgba(139,115,85,0.12)', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(139,115,85,0.12)', background: '#FAFAF8' }}>
                {[
                  { id: 'profile',  label: 'Profile Information' },
                  { id: 'security', label: 'Security Settings'   },
                ].map(tab => (
                  <button key={tab.id} className={`pf-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '32px 36px' }}>

                {/* ── PROFILE TAB ── */}
                {activeTab === 'profile' && (
                  <>
                    {/* Section header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div className="pf-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Manage</div>
                        <h3 className="pf-serif" style={{ fontSize: '1.6rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em' }}>
                          Profile <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Settings</em>
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {isEditing ? (
                          <>
                            <button className="pf-btn-primary" onClick={handleEdit}>
                              <Check size={14} /> Save Changes
                            </button>
                            <button className="pf-btn-ghost" onClick={handleCancel}>
                              <X size={14} /> Cancel
                            </button>
                          </>
                        ) : (
                          <button className="pf-btn-primary" onClick={() => { setTempFormData({...formData}); setIsEditing(true); }}>
                            <Pencil size={14} /> Edit Profile
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                      {/* Full Name */}
                      <div>
                        <div className="pf-label"><User size={11} /> Full Name</div>
                        <div className={`pf-field ${isEditing ? 'active' : 'disabled'}`}>
                          <User size={15} color="#A89880" />
                          <input className="pf-input" type="text" name="fullName" value={isEditing ? tempFormData.fullName : formData.fullName} onChange={handleInputChange} disabled={!isEditing} placeholder="Your full name" />
                        </div>
                      </div>

                      {/* Email (locked) */}
                      <div>
                        <div className="pf-label"><Mail size={11} /> Email Address</div>
                        <div className="pf-field disabled">
                          <Mail size={15} color="#A89880" />
                          <input className="pf-input" type="email" name="emailId" value={formData.emailId} disabled placeholder="email@example.com" />
                          <Lock size={13} color="#C4A97A" style={{ flexShrink: 0 }} />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <div className="pf-label"><Phone size={11} /> Phone Number</div>
                        <div className={`pf-field ${isEditing ? 'active' : 'disabled'}`}>
                          <Phone size={15} color="#A89880" />
                          <input className="pf-input" type="tel" name="phoneNo" value={isEditing ? tempFormData.phoneNo : formData.phoneNo} onChange={handleInputChange} disabled={!isEditing} placeholder="+91 98765 43210" />
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <div className="pf-label"><Building2 size={11} /> City</div>
                        <div className={`pf-field ${isEditing ? 'active' : 'disabled'}`}>
                          <Building2 size={15} color="#A89880" />
                          <input className="pf-input" name="city" value={isEditing ? tempFormData.city : formData.city} onChange={handleInputChange} disabled={!isEditing} placeholder="Your city" />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <div className="pf-label"><MapPin size={11} /> Address</div>
                        <div className={`pf-field ${isEditing ? 'active' : 'disabled'}`}>
                          <MapPin size={15} color="#A89880" />
                          <input className="pf-input" type="text" name="address" value={isEditing ? tempFormData.address : formData.address} onChange={handleInputChange} disabled={!isEditing} placeholder="Street address" />
                        </div>
                      </div>

                      {/* Zip Code */}
                      <div>
                        <div className="pf-label"><Hash size={11} /> Zip Code</div>
                        <div className={`pf-field ${isEditing ? 'active' : 'disabled'}`}>
                          <Hash size={15} color="#A89880" />
                          <input className="pf-input" name="zipCode" value={isEditing ? tempFormData.zipCode : formData.zipCode} onChange={handleInputChange} disabled={!isEditing} placeholder="000000" />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <div className="pf-label"><User size={11} /> Bio</div>
                      <textarea
                        className={`pf-textarea ${isEditing ? 'active' : ''}`}
                        name="bio" rows={4}
                        value={isEditing ? tempFormData.bio : formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Tell us a little about yourself…"
                      />
                    </div>
                  </>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === 'security' && (
                  <div>
                    <div style={{ marginBottom: 28 }}>
                      <div className="pf-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Manage</div>
                      <h3 className="pf-serif" style={{ fontSize: '1.6rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em' }}>
                        Security <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Settings</em>
                      </h3>
                    </div>

                    <div style={{ maxWidth: 420 }}>
                      <div style={{ background: '#FAFAF8', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '24px 28px', marginBottom: 16 }}>
                        <div className="pf-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 12 }}>Password</div>
                        <p className="pf-sans" style={{ fontSize: '0.83rem', color: '#6B6355', marginBottom: 20, fontWeight: 300 }}>
                          Update your account password to keep your account secure.
                        </p>
                        <button className="pf-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowPasswordModal(true)}>
                          <Lock size={14} /> Update Password
                        </button>
                      </div>

                      <div style={{ background: '#FAFAF8', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Shield size={16} color="#8B7355" />
                          <div>
                            <div className="pf-sans" style={{ fontSize: '0.78rem', color: '#1E1C18', fontWeight: 500 }}>Two-Factor Auth</div>
                            <div className="pf-sans" style={{ fontSize: '0.72rem', color: '#A89880', fontWeight: 300 }}>Currently disabled</div>
                          </div>
                        </div>
                        <button className="pf-btn-ghost" style={{ padding: '7px 16px' }}>Enable</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Profile Pic ── */}
      {showProfilePicModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="pf-modal" style={{ background: 'white', borderRadius: 2, padding: '32px 36px', width: '100%', maxWidth: 400, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <div>
                <div className="pf-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Update</div>
                <h3 className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18' }}>Profile Picture</h3>
              </div>
              <button onClick={() => setShowProfilePicModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89880' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className="pf-btn-primary" style={{ justifyContent: 'center', cursor: 'pointer' }}>
                <Upload size={14} /> Upload New Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePicUpload} />
              </label>
              <button className="pf-btn-danger" onClick={handleRemoveProfilePic}>
                <Trash2 size={14} /> Remove Current Photo
              </button>
              <button onClick={() => setShowProfilePicModal(false)} className="pf-sans" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89880', fontSize: '0.78rem', padding: '8px', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Password ── */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="pf-modal" style={{ background: 'white', borderRadius: 2, padding: '32px 36px', width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <div>
                <div className="pf-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Security</div>
                <h3 className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18' }}>Update Password</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89880' }}><X size={18} /></button>
            </div>
            <form onSubmit={handlePasswordChange}>
              {[
                { label: 'Current Password',  key: 'currentPassword', placeholder: 'Enter current password' },
                { label: 'New Password',       key: 'newPassword',     placeholder: 'Enter new password'     },
                { label: 'Confirm Password',   key: 'confirmPassword', placeholder: 'Confirm new password'   },
              ].map(({ label, key, placeholder }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div className="pf-label">{label}</div>
                  <input type="password" required className="pf-modal-input" placeholder={placeholder} onChange={e => setPasswordData(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button type="submit" className="pf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Lock size={14} /> Update Password
                </button>
                <button type="button" className="pf-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Banner ── */}
      {showBackgroundModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div className="pf-modal" style={{ background: 'white', borderRadius: 2, padding: '32px 36px', width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <div>
                <div className="pf-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Personalise</div>
                <h3 className="pf-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18' }}>Banner Style</h3>
              </div>
              <button onClick={() => setShowBackgroundModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89880' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {bannerOptions.map((g, i) => (
                <div
                  key={i}
                  className={`pf-banner-swatch ${bgGradient === g.value ? 'selected' : ''}`}
                  style={{ background: g.css }}
                  onClick={() => handleGradientChange(g.value)}
                >
                  {g.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;