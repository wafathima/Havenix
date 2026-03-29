import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios"; 
import NotificationBell from "./Notification/NotificationBell";
import {
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineChevronDown,
  HiOutlineChat,
} from "react-icons/hi";
import { FaHome } from "react-icons/fa";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [profilePic, setProfilePic] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.profilePic) {
      let picUrl = user.profilePic;
      if (picUrl.startsWith('/uploads')) {
        picUrl = `http://localhost:5050${picUrl}`;
      }
      setProfilePic(picUrl);
    } else {
      setProfilePic("");
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/purpose?type=register";
    switch (user.role) {
      case "buyer":   return "/buyer";
      case "seller":  return "/seller";
      case "builder": return "/builder";
      default:        return "/";
    }
  };

  const formatRole = (role) => {
    if (!role) return "USER";
    return role.toUpperCase();
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "buyer":   return { background: "rgba(139,115,85,0.15)", color: "#C4A97A", border: "1px solid rgba(196,169,122,0.3)" };
      case "seller":  return { background: "rgba(139,115,85,0.15)", color: "#C4A97A", border: "1px solid rgba(196,169,122,0.3)" };
      case "builder": return { background: "rgba(139,115,85,0.15)", color: "#C4A97A", border: "1px solid rgba(196,169,122,0.3)" };
      default:        return { background: "rgba(139,115,85,0.1)", color: "#8B7355", border: "1px solid rgba(139,115,85,0.2)" };
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/chats');
      if (data.success) {
        setUnreadCount(data.totalUnread || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getUserName = () => {
    if (!user) return "";
    return user.name || user.fullName || user.username || "User";
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase() || "U";
  };

  const getUserFirstName = () => {
    const name = getUserName();
    return name.split(" ")[0] || "User";
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/settings");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hdr-sans { font-family: 'DM Sans', sans-serif; }
        .hdr-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .hdr-nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4A4540;
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
          font-weight: 500;
          transition: color 0.25s ease;
        }
        .hdr-nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background: #8B7355;
          transition: width 0.3s ease;
        }
        .hdr-nav-link:hover { color: #8B7355; }
        .hdr-nav-link:hover::after { width: 100%; }

        .hdr-avatar-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          outline: none;
        }
        .hdr-avatar-ring {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(139,115,85,0.4);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #EDE8DC;
          transition: border-color 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }
        .hdr-avatar-btn:hover .hdr-avatar-ring {
          border-color: #8B7355;
          transform: scale(1.05);
        }

        .hdr-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: 260px;
          background: #1E1C18;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
          overflow: hidden;
          animation: hdr-drop 0.2s ease forwards;
          z-index: 100;
        }
        @keyframes hdr-drop {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hdr-drop-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          color: #A89880;
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
          letter-spacing: 0.01em;
        }
        .hdr-drop-item:hover { background: rgba(139,115,85,0.1); color: #F5F0E8; }
        .hdr-drop-item.danger { color: #C4846A; }
        .hdr-drop-item.danger:hover { background: rgba(196,132,106,0.1); color: #E09880; }

        .hdr-cta {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          color: #1E1C18;
          background: #8B7355;
          border: none;
          padding: 10px 26px;
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: background 0.25s ease, letter-spacing 0.25s ease;
        }
        .hdr-cta:hover { background: #7A6445; letter-spacing: 0.16em; color: #F5F0E8; }

        .hdr-chevron {
          transition: transform 0.25s ease;
          color: #8B7355;
        }
        .hdr-chevron.open { transform: rotate(180deg); }
        
        /* Add spacing between notification bell and avatar */
        .hdr-notification-wrapper {
          margin-right: 8px;
        }
      `}</style>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: scrolled ? 'rgba(245,240,232,0.92)' : 'rgba(245,240,232,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(139,115,85,0.2)' : '1px solid transparent',
          transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <nav style={{maxWidth:'1280px', margin:'0 auto', padding:'0 24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', height:64}}>

            {/* ── LOGO ── */}
            <div
              style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', textDecoration:'none'}}
              onClick={() => navigate("/")}
            >
              <FaHome style={{fontSize:22, color:'#8B7355'}} />
              <span
                className="hdr-serif"
                style={{fontSize:'1.35rem', fontWeight:600, color:'#1E1C18', letterSpacing:'0.04em'}}
              >
                HAVENIX
              </span>
            </div>

            {/* ── NAV LINKS ── */}
            <div style={{display:'flex', alignItems:'center', gap:40}}>
              <Link to="/properties" className="hdr-nav-link">Explore</Link>
              <Link to={user ? getDashboardLink() : "/purpose?type=register"} className="hdr-nav-link">Dashboard</Link>
              <Link
                to={user ? "/contact" : "#"}
                onClick={(e) => { if (!user) { e.preventDefault(); navigate("/purpose?type=register"); }}}
                className="hdr-nav-link"
              >
                Contact
              </Link>
            </div>

            {/* ── RIGHT SIDE ── */}
            <div style={{display:'flex', alignItems:'center', gap:16}}>
              {user ? (
                <>
                  {/* Notification Bell - Place it here */}
                  <div className="hdr-notification-wrapper">
                    <NotificationBell user={user} />
                  </div>
                  
                  {/* User Avatar & Dropdown */}
                  <div style={{position:'relative'}} ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="hdr-avatar-btn"
                    >
                      <div className="hdr-avatar-ring">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={getUserName()}
                            style={{width:'100%', height:'100%', objectFit:'cover'}}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span style="font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:600; color:#8B7355">${getUserInitial()}</span>`;
                            }}
                          />
                        ) : (
                          <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:'0.85rem', fontWeight:600, color:'#8B7355'}}>
                            {getUserInitial()}
                          </span>
                        )}
                      </div>

                      <span className="hdr-sans" style={{fontSize:'0.82rem', color:'#2C2A26', fontWeight:500}}>
                        {getUserFirstName()}
                      </span>

                      <HiOutlineChevronDown
                        size={14}
                        className={`hdr-chevron ${isDropdownOpen ? 'open' : ''}`}
                      />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                      <div className="hdr-dropdown">
                        {/* User info */}
                        <div style={{padding:'20px', borderBottom:'1px solid rgba(139,115,85,0.15)'}}>
                          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                            <div style={{width:42, height:42, borderRadius:'50%', border:'1px solid rgba(139,115,85,0.3)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#2C2A26', flexShrink:0}}>
                              {profilePic ? (
                                <img src={profilePic} alt={getUserName()} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                              ) : (
                                <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:'1rem', fontWeight:600, color:'#C4A97A'}}>{getUserInitial()}</span>
                              )}
                            </div>
                            <div style={{overflow:'hidden'}}>
                              <p className="hdr-sans" style={{color:'#F5F0E8', fontWeight:500, fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{getUserName()}</p>
                              <p className="hdr-sans" style={{color:'#6B6355', fontSize:'0.72rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{user.email || "No email"}</p>
                            </div>
                          </div>
                          <span
                            className="hdr-sans"
                            style={{...getRoleStyle(user.role), display:'inline-block', padding:'3px 10px', borderRadius:'2px', fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:600}}
                          >
                            {formatRole(user.role)}
                          </span>
                        </div>

                        {/* Menu items */}
                        <div style={{padding:'6px 0'}}>
                          <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="hdr-drop-item">
                            <HiOutlineUser size={16} />
                            Profile
                          </Link>
                          <Link to="/settings" onClick={handleSettingsClick} className="hdr-drop-item">
                            <HiOutlineCog size={16} />
                            Settings
                          </Link>

                          <Link 
                            to={user?.role === "buyer" ? "/buyer?tab=chats" : user?.role === "seller" ? "/seller?tab=chats" : "/chats"} 
                            onClick={() => setIsDropdownOpen(false)} 
                            className="hdr-drop-item"
                            style={{ position: 'relative' }}
                          >
                            <HiOutlineChat size={16} />
                            Chat
                            {unreadCount > 0 && (
                              <span style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#C4503C',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                minWidth: 18,
                                height: 18,
                                borderRadius: 9,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 5px'
                              }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link to={getDashboardLink()} onClick={() => setIsDropdownOpen(false)} className="hdr-drop-item">
                            <HiOutlineViewGrid size={16} />
                            Dashboard
                          </Link>
                        </div>

                        {/* Logout */}
                        <div style={{borderTop:'1px solid rgba(139,115,85,0.15)', padding:'6px 0'}}>
                          <button onClick={handleLogout} className="hdr-drop-item danger">
                            <HiOutlineLogout size={16} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/purpose?type=register" className="hdr-cta">
                  Get Started
                </Link>
              )}
            </div>

          </div>
        </nav>
      </header>
    </>
  );
}

export default Header;