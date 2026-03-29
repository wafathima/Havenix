import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  HiOutlineTrash,
  HiOutlineBan,
  HiOutlineEye,
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
} from "react-icons/hi";

function ManageUsers() {
  const navigate = useNavigate();

  // Users state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Filter state
  const [filters, setFilters] = useState({
    role: "",
    search: ""
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters.role, filters.search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
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
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };


  const handleBlockUser = async () => {
  if (!selectedUser || !blockReason.trim()) {
    toast.error("Please provide a reason for blocking");
    return;
  }

  try {
    setActionLoading(true);
    console.log('Blocking user:', selectedUser._id, 'with reason:', blockReason);
    
    const response = await API.patch(`/admin/users/${selectedUser._id}/block`, { 
      reason: blockReason 
    });
    
    console.log('Block response:', response.data);
    toast.success(response.data.message || "User blocked successfully");
    setShowBlockModal(false);
    setSelectedUser(null);
    setBlockReason("");
    fetchUsers(); // Refresh the list
  } catch (error) {
    console.error("Error blocking user:", error);
    console.error("Error config:", error.config);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    
    let errorMessage = "Failed to block user";
    
    if (error.response) {
      
      errorMessage = error.response.data?.message || 
                     error.response.data?.error || 
                     `Server error: ${error.response.status}`;
      
      if (error.response.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      } else if (error.response.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (error.response.status === 404) {
        errorMessage = "User not found.";
      }
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection.";
    } else {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  } finally {
    setActionLoading(false);
  }
};

  const handleUnblockUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;

    try {
      setActionLoading(true);
      const response = await API.patch(`/admin/users/${userId}/unblock`);
      toast.success(response.data.message || "User unblocked successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error(error.response?.data?.message || "Failed to unblock user");
    } finally {
      setActionLoading(false);
    }
  };

  // const handleDeleteUser = async (userId) => {
  //   if (!window.confirm("⚠️ Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.")) {
  //     return;
  //   }

  //   try {
  //     setActionLoading(true);
  //     const response = await API.delete(`/admin/users/${userId}`);
  //     toast.success(response.data.message || "User deleted successfully");
  //     fetchUsers();
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //     toast.error(error.response?.data?.message || "Failed to delete user");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      setActionLoading(true);
      const response = await API.patch(`/admin/users/${selectedUser._id}/role`, { 
        role: newRole 
      });
      toast.success(response.data.message || "User role updated successfully");
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.message || "Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = (userId) => {
    console.log('Navigating to user:', userId);
    navigate(`/admin/users/${userId}`);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const roleConfig = {
    seller: { bg: "#F5F0E8", text: "#8B7355", dot: "#8B7355", border: "#D4C9B5" },
    buyer: { bg: "#EDF2EE", text: "#4A7C59", dot: "#4A7C59", border: "#B8D0BF" },
    builder: { bg: "#F0EBE3", text: "#7A5C3A", dot: "#A07850", border: "#C9B89A" },
  };

  const avatarPalette = [
    { bg: "#EDE8DF", color: "#6B5840" },
    { bg: "#E8EDE9", color: "#3D6649" },
    { bg: "#EDE5DC", color: "#8B6040" },
    { bg: "#E5E8ED", color: "#3D5066" },
    { bg: "#EDE8E3", color: "#70543A" },
    { bg: "#E8EDE8", color: "#3D6040" },
  ];

  // Skeleton loader for table rows
  const TableRowSkeleton = () => (
    <tr>
      <td colSpan="7" style={{ padding: '15px 22px' }}>
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
        .abtn-role { color: #5A3A7A; border-color: #B8A0D4; background: #E8E3ED; }
        .abtn-role:hover { background: #D8CCE5; }

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

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #FDFAF5;
          border: 1px solid #D4C9B5;
          border-radius: 14px;
          padding: 24px;
          width: 400px;
          max-width: 90%;
        }

        .contact-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6B5840;
          margin-top: 4px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26" }}>Block User</h3>
            <p style={{ marginBottom: 16, color: "#6B5840" }}>
              Blocking <strong>{selectedUser.name}</strong>
            </p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter reason for blocking..."
              className="filter-input"
              style={{ width: '100%', minHeight: '100px', marginBottom: 20, resize: 'vertical' }}
              disabled={actionLoading}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="abtn abtn-view"
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUser(null);
                  setBlockReason("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="abtn abtn-block"
                onClick={handleBlockUser}
                disabled={!blockReason.trim() || actionLoading}
              >
                {actionLoading ? 'Blocking...' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26" }}>Change User Role</h3>
            <p style={{ marginBottom: 16, color: "#6B5840" }}>
              Current role: <strong>{selectedUser.role}</strong>
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="filter-input"
              style={{ width: '100%', marginBottom: 20 }}
              disabled={actionLoading}
            >
              <option value="">Select new role</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="builder">Builder</option>
            </select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="abtn abtn-view"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="abtn abtn-role"
                onClick={handleRoleChange}
                disabled={!newRole || actionLoading}
              >
                {actionLoading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#A89880", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
          User Management
        </p>
        <h1 className="hv-serif" style={{ fontSize: 34, color: "#2C2A26", fontWeight: 400, lineHeight: 1.15, fontStyle: "italic" }}>
          Manage Users
        </h1>
      </div>

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="abtn abtn-view"
            style={{ padding: "8px 14px" }}
            disabled={actionLoading}
          >
            <HiOutlineFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchUsers}
            className="abtn abtn-view"
            style={{ padding: "8px 14px" }}
            disabled={actionLoading}
          >
            <HiOutlineRefresh /> Refresh
          </button>

          {/* Stats pill */}
          <span style={{
            padding: "6px 12px",
            background: "#EDE8DF",
            borderRadius: "20px",
            fontSize: "12px",
            color: "#6B5840",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <HiOutlineUsers />
            Total: {pagination.total} users
          </span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{
          background: "#FDFAF5",
          border: "1px solid #D4C9B5",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
            className="filter-input"
            style={{ width: "150px" }}
            disabled={actionLoading}
          >
            <option value="">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="builder">Builders</option>
          </select>

          <div style={{ position: 'relative' }}>
            <HiOutlineSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A89880', fontSize: 14 }} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="filter-input"
              style={{ paddingLeft: 32, width: 250 }}
              disabled={actionLoading}
            />
          </div>

          {(filters.role || filters.search) && (
            <button
              onClick={() => setFilters({ role: "", search: "" })}
              className="abtn abtn-view"
              disabled={actionLoading}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="table-wrap">
        <table className="u-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
            ) : users.length > 0 ? (
              users.map((user, idx) => {
                const initials = user.name?.split(" ").map((n) => n[0]).join("").substring(0, 2) || "U";
                const rc = roleConfig[user.role] || roleConfig.buyer;
                const av = avatarPalette[idx % avatarPalette.length];
                const isBlocked = user.isBlocked || user.status === 'blocked';
                
                return (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar" style={{ background: av.bg, color: av.color }}>
                          {initials.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#2C2A26" }}>{user.name}</p>
                          <p style={{ fontSize: 11, color: "#A89880" }}>ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <HiOutlineMail /> {user.email}
                      </div>
                      <div className="contact-info">
                        <HiOutlinePhone /> {user.phone || 'No phone'}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <HiOutlineCalendar />
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
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
                          border: "1px solid #D4AAAA",
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <HiOutlineShieldExclamation />
                          Blocked
                          {user.blockedReason && <span title={user.blockedReason}>⚠️</span>}
                        </span>
                      ) : (
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 500,
                          background: "#EDF2EE",
                          color: "#4A7C59",
                          border: "1px solid #B8D0BF",
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <HiOutlineShieldCheck />
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: 'wrap' }}>
                        <button 
                          className="abtn abtn-view"
                          onClick={() => handleViewUser(user._id)}
                          title="View user details"
                          disabled={actionLoading}
                        >
                          <HiOutlineEye /> View
                        </button>
                        
                        <button 
                          className="abtn abtn-role"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleModal(true);
                          }}
                          title="Change user role"
                          disabled={actionLoading}
                        >
                          Role
                        </button>
                        
                        {isBlocked ? (
                          <button 
                            className="abtn abtn-unblock"
                            onClick={() => handleUnblockUser(user._id)}
                            title="Unblock user"
                            disabled={actionLoading}
                          >
                            <HiOutlineBan /> Unblock
                          </button>
                        ) : (
                          <button 
                            className="abtn abtn-block"
                            onClick={() => {
                              setSelectedUser(user);
                              setBlockReason("");
                              setShowBlockModal(true);
                            }}
                            title="Block user"
                            disabled={actionLoading}
                          >
                            <HiOutlineBan /> Block
                          </button>
                        )}
                        
                        {/* <button 
                          className="abtn abtn-delete"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete user"
                          disabled={actionLoading}
                        >
                          <HiOutlineTrash /> Delete
                        </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "60px", color: "#A89880" }}>
                  <HiOutlineUsers style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }} />
                  <p>No users found</p>
                  {(filters.role || filters.search) && (
                    <button
                      onClick={() => setFilters({ role: "", search: "" })}
                      className="abtn abtn-view"
                      style={{ marginTop: 10 }}
                      disabled={actionLoading}
                    >
                      Clear Filters
                    </button>
                  )}
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
                disabled={pagination.page === 1 || actionLoading}
                style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
              >
                <HiOutlineChevronLeft /> Prev
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
                    disabled={actionLoading}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="pbtn nav"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || actionLoading}
                style={{ opacity: pagination.page === pagination.pages ? 0.5 : 1 }}
              >
                Next <HiOutlineChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;