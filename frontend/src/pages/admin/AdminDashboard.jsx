import { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  HiOutlineTrash,
  HiOutlineBan,
  HiOutlineEye,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineDotsHorizontal,
  HiOutlineTrendingUp,
  HiOutlineArrowSmUp,
  HiOutlineRefresh,
} from "react-icons/hi";

function AdminDashboard() {
  const { user } = useContext(AdminContext);
  const navigate = useNavigate();

  // Stats state
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalProperties: 0,
    totalUsers: 0,
    buyers: 0,
    sellers: 0,
    builders: 0,
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    users: true
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1
  });

  // Filter state
  const [filters, setFilters] = useState({
    role: "",
    search: ""
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters.role, filters.search]);


const fetchDashboardStats = async () => {
  try {
    setLoading(prev => ({ ...prev, stats: true }));
    
    const { data } = await API.get('/admin/dashboard/stats');
    console.log('Dashboard stats response:', data); 
    
    if (data.success) {
      setStats({
        totalProjects: data.stats?.projects?.total || 0,
        totalProperties: data.stats?.properties?.total || 0,
        totalUsers: data.stats?.users?.total || 0,
        buyers: data.stats?.users?.buyers || 0,
        sellers: data.stats?.users?.sellers || 0,
        builders: data.stats?.users?.builders || 0,
      });
    } else {
      toast.error(data.message || "Failed to load dashboard stats");
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    console.error("Error response:", error.response?.data); 
    toast.error(error.response?.data?.message || "Failed to load dashboard stats");
  } finally {
    setLoading(prev => ({ ...prev, stats: false }));
  }
};

const fetchUsers = async () => {
  try {
    setLoading(prev => ({ ...prev, users: true }));
    
    const params = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.role && { role: filters.role }),
      ...(filters.search && { search: filters.search })
    });

    const { data } = await API.get(`/admin/users?${params.toString()}`);
    console.log('Users response:', data);
    
    if (data.success) {
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 1
      }));
    } else {
      toast.error(data.message || "Failed to load users");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    console.error("Error response:", error.response?.data);
    toast.error(error.response?.data?.message || "Failed to load users");
  } finally {
    setLoading(prev => ({ ...prev, users: false }));
  }
};

  const handleUserAction = async (userId, action) => {
    try {
      let response;
      
      switch (action) {
        case 'block':
          response = await API.patch(`/admin/users/${userId}/block`);
          toast.success(response.data.message || "User blocked successfully");
          break;
        case 'unblock':
          response = await API.patch(`/admin/users/${userId}/unblock`);
          toast.success(response.data.message || "User unblocked successfully");
          break;
        case 'delete':
          if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            response = await API.delete(`/admin/users/${userId}`);
            toast.success(response.data.message || "User deleted successfully");
          } else {
            return;
          }
          break;
        default:
          return;
      }
      
      fetchUsers();
      fetchDashboardStats();
      
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const roleConfig = {
    seller:  { bg: "#F5F0E8", text: "#8B7355", dot: "#8B7355",  border: "#D4C9B5" },
    buyer:   { bg: "#EDF2EE", text: "#4A7C59", dot: "#4A7C59",  border: "#B8D0BF" },
    builder: { bg: "#F0EBE3", text: "#7A5C3A", dot: "#A07850",  border: "#C9B89A" },
  };

  const avatarPalette = [
    { bg: "#EDE8DF", color: "#6B5840" },
    { bg: "#E8EDE9", color: "#3D6649" },
    { bg: "#EDE5DC", color: "#8B6040" },
    { bg: "#E5E8ED", color: "#3D5066" },
    { bg: "#EDE8E3", color: "#70543A" },
    { bg: "#E8EDE8", color: "#3D6040" },
  ];

  const statCards = [
    { icon: <HiOutlineBriefcase />,      label: "Total Projects",   value: stats.totalProjects,   change: `+${stats.totalProjects > 0 ? Math.floor(stats.totalProjects * 0.1) : 0}` },
    { icon: <HiOutlineOfficeBuilding />, label: "Total Properties", value: stats.totalProperties, change: `+${stats.totalProperties > 0 ? Math.floor(stats.totalProperties * 0.08) : 0}` },
    { icon: <HiOutlineUsers />,          label: "Total Users",      value: stats.totalUsers,      change: `+${stats.totalUsers > 0 ? Math.floor(stats.totalUsers * 0.05) : 0}` },
    { icon: <HiOutlineShoppingCart />,   label: "Buyers",           value: stats.buyers,          change: `+${stats.buyers > 0 ? Math.floor(stats.buyers * 0.07) : 0}` },
    { icon: <HiOutlineCurrencyDollar />, label: "Sellers",          value: stats.sellers,         change: `+${stats.sellers > 0 ? Math.floor(stats.sellers * 0.06) : 0}` },
    { icon: <HiOutlineCog />,            label: "Builders",         value: stats.builders,        change: `+${stats.builders > 0 ? Math.floor(stats.builders * 0.04) : 0}` },
  ];

  // Skeleton loader for stats
  const StatSkeleton = () => (
    <div className="stat-card" style={{ animation: 'pulse 1.5s ease infinite' }}>
      <div style={{ height: 42, width: 42, background: '#EDE8DF', borderRadius: 10, marginBottom: 18 }} />
      <div style={{ height: 36, width: '60%', background: '#EDE8DF', borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 12, width: '40%', background: '#EDE8DF', borderRadius: 4 }} />
    </div>
  );

  // Skeleton loader for table rows
  const TableRowSkeleton = () => (
    <tr>
      <td colSpan="4" style={{ padding: '15px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EDE8DF' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: '30%', background: '#EDE8DF', borderRadius: 4, marginBottom: 4 }} />
            <div style={{ height: 12, width: '50%', background: '#EDE8DF', borderRadius: 4 }} />
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#F5F0E8",
      minHeight: "100vh",
      padding: "36px 40px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hv-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .hv-sans  { font-family: 'DM Sans', sans-serif; }

        .stat-card {
          background: #FDFAF5;
          border: 1px solid #D4C9B5;
          border-radius: 14px;
          padding: 24px;
          transition: box-shadow 0.28s ease, transform 0.28s ease;
        }
        .stat-card:hover {
          box-shadow: 0 12px 36px rgba(44,42,38,0.09);
          transform: translateY(-3px);
        }

        .table-wrap {
          background: #FDFAF5;
          border: 1px solid #D4C9B5;
          border-radius: 14px;
          overflow: hidden;
        }
        .u-table { width: 100%; border-collapse: collapse; }
        .u-table th {
          text-align: left;
          padding: 13px 22px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #A89880;
          background: #F5F0E8;
          border-bottom: 1px solid #D4C9B5;
        }
        .u-table td {
          padding: 15px 22px;
          border-bottom: 1px solid #EDE8DF;
          vertical-align: middle;
        }
        .u-table tbody tr:last-child td { border-bottom: none; }
        .u-table tbody tr { transition: background 0.15s; }
        .u-table tbody tr:hover { background: #FAF6EF; }

        .avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; flex-shrink: 0;
          border: 1px solid #D4C9B5;
        }

        .role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 20px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.03em;
          border: 1px solid;
        }
        .badge-dot { width: 5px; height: 5px; border-radius: 50%; }

        .abtn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 8px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          border: 1px solid; background: transparent;
          transition: all 0.18s; font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
        }
        .abtn-view  { color: #6B5840; border-color: #C9B89A; background: #F0EBE3; }
        .abtn-view:hover  { background: #E8DFD1; }
        .abtn-block { color: #7A5C3A; border-color: #C9AA80; background: #F5EDE0; }
        .abtn-block:hover { background: #EDE0CC; }
        .abtn-unblock { color: #4A7C59; border-color: #B8D0BF; background: #EDF2EE; }
        .abtn-unblock:hover { background: #D8E5DB; }
        .abtn-delete { color: #8B4040; border-color: #D4AAAA; background: #F5EDED; }
        .abtn-delete:hover { background: #EDDCDC; }

        .pbtn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid #D4C9B5; background: #FDFAF5; color: #8B7355;
          font-size: 13px; cursor: pointer; transition: all 0.18s;
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }
        .pbtn:hover { background: #EDE8DF; border-color: #8B7355; color: #2C2A26; }
        .pbtn.active { background: #2C2A26; border-color: #2C2A26; color: #F5F0E8; }
        .pbtn.nav { width: auto; padding: 0 13px; gap: 4px; font-size: 12px; font-weight: 500; }

        .view-all-btn {
          padding: 8px 18px; border-radius: 8px;
          border: 1px solid #8B7355; background: transparent;
          color: #8B7355; font-size: 12px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .view-all-btn:hover { background: #8B7355; color: #F5F0E8; }

        .notif-btn {
          padding: 9px; border-radius: 10px;
          border: 1px solid #D4C9B5; background: #FDFAF5;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .notif-btn:hover { background: #EDE8DF; border-color: #8B7355; }
        .notif-pip {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; background: #C47A4A;
          border-radius: 50%; border: 1.5px solid #FDFAF5;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #D4C9B5, transparent);
          margin: 0 0 32px;
        }

        .filter-input {
          padding: 8px 12px;
          border: 1px solid #D4C9B5;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          width: 200px;
        }
        .filter-input:focus {
          outline: none;
          border-color: #8B7355;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#A89880", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
            Havenix Platform
          </p>
          <h1 className="hv-serif" style={{ fontSize: 34, color: "#2C2A26", fontWeight: 400, lineHeight: 1.15, fontStyle: "italic" }}>
            Admin Dashboard
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="notif-btn">
            <HiOutlineBell style={{ fontSize: 18, color: "#8B7355" }} />
            <span className="notif-pip" />
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 15px", borderRadius: 12,
            border: "1px solid #D4C9B5", background: "#FDFAF5",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "#2C2A26", border: "1px solid #D4C9B5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "#F5F0E8",
              letterSpacing: "0.05em",
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#2C2A26", lineHeight: 1.3 }}>
                {user?.name || 'Admin User'}
              </p>
              <p style={{ fontSize: 11, color: "#A89880" }}>
                {user?.email || 'admin@havenix.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider" style={{ marginTop: 28 }} />

      {/* ── Overview ── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="hv-serif" style={{ fontSize: 24, color: "#2C2A26", fontWeight: 400 }}>Overview</h2>
          <span style={{ fontSize: 11, color: "#A89880", display: "flex", alignItems: "center", gap: 4, letterSpacing: "0.04em" }}>
            <HiOutlineTrendingUp /> Last 30 days
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {loading.stats ? (
            Array(6).fill(0).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            statCards.map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: "#EDE8DF", border: "1px solid #D4C9B5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 19, color: "#8B7355",
                  }}>
                    {s.icon}
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    padding: "3px 9px", borderRadius: 20,
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
                    background: "#EDF2EE", color: "#4A7C59",
                    border: "1px solid #B8D0BF",
                  }}>
                    <HiOutlineArrowSmUp style={{ fontSize: 13 }} />{s.change}
                  </span>
                </div>
                <p className="hv-serif" style={{ fontSize: 36, fontWeight: 500, color: "#2C2A26", lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "#8B7355", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Table ── */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h2 className="hv-serif" style={{ fontSize: 24, color: "#2C2A26", fontWeight: 400 }}>User Management</h2>
            
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="view-all-btn"
              style={{ padding: "6px 12px", fontSize: "11px" }}
            >
              Filters
            </button>

            {/* Refresh button */}
            <button
              onClick={() => {
                fetchDashboardStats();
                fetchUsers();
              }}
              className="view-all-btn"
              style={{ padding: "6px 12px", fontSize: "11px" }}
            >
              <HiOutlineRefresh style={{ fontSize: 12 }} />
              Refresh
            </button>
          </div>
          
          <button className="view-all-btn">View All Users</button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{
            background: "#FDFAF5",
            border: "1px solid #D4C9B5",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="filter-input"
              style={{ width: "150px" }}
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="builder">Builders</option>
            </select>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="filter-input"
            />

            {(filters.role || filters.search) && (
              <button
                onClick={() => setFilters({ role: "", search: "" })}
                className="abtn abtn-view"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="table-wrap">
          <table className="u-table">
            <thead>
              <tr>
                {["User", "Joined", "Role", "Status"].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading.users ? (
                Array(3).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
              ) : users.length > 0 ? (
                users.map((user, idx) => {
                  const initials = user.name?.split(" ").map((n) => n[0]).join("") || "U";
                  const rc = roleConfig[user.role] || roleConfig.buyer;
                  const av = avatarPalette[idx % avatarPalette.length];
                  const isBlocked = user.isBlocked || user.status === 'blocked';
                  
                  return (
                    <tr key={user._id || idx}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="avatar" style={{ background: av.bg, color: av.color }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#2C2A26" }}>{user.name}</p>
                            <p style={{ fontSize: 12, color: "#A89880" }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#3E3A34" }}>
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <p style={{ fontSize: 11, color: "#A89880" }}>
                          {new Date(user.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>
                      <td>
                        <span className="role-badge" style={{ background: rc.bg, color: rc.text, borderColor: rc.border }}>
                          <span className="badge-dot" style={{ background: rc.dot }} />
                          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                        </span>
                      </td>
                      <td>
                        {isBlocked ? (
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 500,
                            background: "#F5EDED",
                            color: "#8B4040",
                            border: "1px solid #D4AAAA"
                          }}>
                            Blocked
                          </span>
                        ) : (
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 500,
                            background: "#EDF2EE",
                            color: "#4A7C59",
                            border: "1px solid #B8D0BF"
                          }}>
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#A89880" }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 22px", borderTop: "1px solid #D4C9B5", background: "#F5F0E8",
            }}>
              <p style={{ fontSize: 12, color: "#A89880" }}>
                Showing <b style={{ color: "#6B5840" }}>
                  {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}
                </b> of <b style={{ color: "#6B5840" }}>{pagination.total}</b> users
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button 
                  className="pbtn nav"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
                >
                  <HiOutlineChevronLeft style={{ fontSize: 13 }} /> Prev
                </button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pbtn ${pagination.page === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                  <>
                    <button className="pbtn"><HiOutlineDotsHorizontal style={{ fontSize: 13 }} /></button>
                    <button 
                      className="pbtn"
                      onClick={() => handlePageChange(pagination.pages)}
                    >
                      {pagination.pages}
                    </button>
                  </>
                )}
                
                <button 
                  className="pbtn nav"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  style={{ opacity: pagination.page === pagination.pages ? 0.5 : 1 }}
                >
                  Next <HiOutlineChevronRight style={{ fontSize: 13 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;