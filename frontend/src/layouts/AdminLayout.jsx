import { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineLogout,
} from "react-icons/hi";

function AdminLayout() {
  const { logout } = useContext(AdminContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === `/admin${path}`;

  const navItems = [
    { path: "/dashboard",  label: "Overview",   icon: <HiOutlineViewGrid /> },
    { path: "/users",      label: "Users",      icon: <HiOutlineUsers /> },
    { path: "/properties", label: "Properties", icon: <HiOutlineOfficeBuilding /> },
    { path: "/projects",   label: "Projects",   icon: <HiOutlineBriefcase /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hv-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .sidebar {
          width: 236px;
          min-height: 100vh;
          background: #2C2A26;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0;
          z-index: 50;
          border-right: 1px solid rgba(212,201,181,0.12);
        }

        .logo-area {
          padding: 28px 24px 24px;
          border-bottom: 1px solid rgba(212,201,181,0.12);
        }

        .nav-group-label {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: rgba(168,152,128,0.6);
          padding: 0 22px;
          margin: 22px 0 8px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          margin: 2px 10px;
          border-radius: 9px;
          color: rgba(212,201,181,0.65);
          font-size: 14px;
          font-weight: 400;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          position: relative;
          letter-spacing: 0.01em;
        }
        .nav-link:hover {
          color: #F5F0E8;
          background: rgba(212,201,181,0.08);
        }
        .nav-link.active {
          color: #F5F0E8;
          background: rgba(139,115,85,0.2);
          border-color: rgba(139,115,85,0.35);
          font-weight: 500;
        }
        .nav-link .nav-icon { font-size: 17px; flex-shrink: 0; }
        .nav-link.active .nav-icon { color: #D4C9B5; }
        .nav-link .active-bar {
          position: absolute;
          left: -10px; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 18px;
          background: #8B7355;
          border-radius: 0 3px 3px 0;
        }

        .sidebar-footer {
          padding: 14px 10px 20px;
          border-top: 1px solid rgba(212,201,181,0.1);
          margin-top: auto;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          border-radius: 9px;
          background: transparent;
          border: 1px solid rgba(180,80,80,0.25);
          color: rgba(220,120,100,0.8);
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
        }
        .logout-btn:hover {
          background: rgba(180,80,80,0.1);
          border-color: rgba(220,120,100,0.5);
          color: #E88870;
        }
        .logout-btn svg { font-size: 17px; }

        .version-tag {
          font-size: 10px;
          color: rgba(168,152,128,0.4);
          text-align: center;
          margin-top: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .main-wrap {
          margin-left: 236px;
          flex: 1;
          background: #F5F0E8;
          min-height: 100vh;
        }

        .divider-rule {
          height: 1px;
          background: rgba(212,201,181,0.15);
          margin: 4px 0 16px;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="logo-area">
          <p style={{ fontSize: 15, color: "rgba(232, 198, 149, 0.55)", marginTop: 7, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Admin Console
          </p>
        </div>

        <nav style={{ flex: 1, paddingTop: 4 }}>
          <p className="nav-group-label">Main Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={`/admin${item.path}`}
              className={`nav-link${isActive(item.path) ? " active" : ""}`}
            >
              {isActive(item.path) && <span className="active-bar" />}
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <HiOutlineLogout />
            Sign Out
          </button>
          <p className="version-tag">Havenix v2.4.1</p>
        </div>
      </aside>

      {/* ── Page Content ── */}
      <main className="main-wrap">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;