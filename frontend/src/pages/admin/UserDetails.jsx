import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineChat,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineCurrencyDollar,
  HiOutlineHeart,
  HiOutlineX,
} from "react-icons/hi";

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleData, setRoleData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      const { data } = await API.get(`/admin/users/${userId}`);
      console.log('User details response:', data);
      
      if (data.success) {
        setUser(data.user);
        setRoleData(data.roleData || {});
        setRecentActivity(data.recentActivity || []);
      } else {
        toast.error(data.message || "Failed to load user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user) return;
    
    if (!blockReason.trim()) {
      toast.error("Please provide a reason for blocking");
      return;
    }

    try {
      setActionLoading(true);
      console.log('Blocking user:', user._id, 'with reason:', blockReason);
      
      const response = await API.patch(`/admin/users/${user._id}/block`, { 
        reason: blockReason 
      });
      
      console.log('Block response:', response.data);
      toast.success(response.data.message || "User blocked successfully");
      
      setShowBlockModal(false);
      setBlockReason("");
      fetchUserDetails(); // Refresh user data
    } catch (error) {
      console.error("Error blocking user:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to block user";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      const response = await API.patch(`/admin/users/${user._id}/unblock`);
      console.log('Unblock response:', response.data);
      toast.success(response.data.message || "User unblocked successfully");
      fetchUserDetails(); // Refresh user data
    } catch (error) {
      console.error("Error unblocking user:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to unblock user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    if (!window.confirm(`⚠️ Are you sure you want to delete ${user.name}? This action cannot be undone and will remove all associated data.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await API.delete(`/admin/users/${user._id}`);
      console.log('Delete response:', response.data);
      toast.success(response.data.message || "User deleted successfully");
      navigate('/admin/users'); // Go back to users list
    } catch (error) {
      console.error("Error deleting user:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!user) return;

    const newRole = prompt(`Change role for ${user.name}\nCurrent role: ${user.role}\n\nEnter new role (buyer/seller/builder/admin):`, user.role);
    if (!newRole) return;

    if (!['buyer', 'seller', 'builder', 'admin'].includes(newRole)) {
      toast.error("Invalid role. Please enter buyer, seller, builder, or admin");
      return;
    }

    try {
      setActionLoading(true);
      const response = await API.patch(`/admin/users/${user._id}/role`, { role: newRole });
      console.log('Role change response:', response.data);
      toast.success(response.data.message || "User role updated successfully");
      fetchUserDetails(); // Refresh user data
    } catch (error) {
      console.error("Error updating role:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const roleConfig = {
    seller: { bg: "#F5F0E8", text: "#8B7355", border: "#D4C9B5", label: "Seller" },
    buyer: { bg: "#EDF2EE", text: "#4A7C59", border: "#B8D0BF", label: "Buyer" },
    builder: { bg: "#F0EBE3", text: "#7A5C3A", border: "#C9B89A", label: "Builder" },
    admin: { bg: "#E8E3ED", text: "#5A3A7A", border: "#B8A0D4", label: "Admin" },
  };

  // Helper function to get role-specific stats display
  const getRoleSpecificStats = () => {
    if (!user || !roleData) return null;

    switch (user.role) {
      case 'buyer':
        return (
          <div className="stats-grid" style={statsGridStyle}>
            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineChat style={{ fontSize: 24, color: "#4A7C59" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Enquiries Sent</p>
                <p style={statValueStyle}>{roleData.enquiries?.length || 0}</p>
              </div>
            </div>
            
            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineHeart style={{ fontSize: 24, color: "#8B7355" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Saved Properties</p>
                <p style={statValueStyle}>{roleData.savedProperties?.length || 0}</p>
              </div>
            </div>
          </div>
        );

      case 'seller':
        return (
          <div className="stats-grid" style={statsGridStyle}>
            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineHome style={{ fontSize: 24, color: "#8B7355" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Total Properties</p>
                <p style={statValueStyle}>{roleData.stats?.totalProperties || 0}</p>
              </div>
            </div>
            
            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineCurrencyDollar style={{ fontSize: 24, color: "#8B7355" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Total Value</p>
                <p style={statValueStyle}>₹{(roleData.stats?.totalValue || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineClipboardList style={{ fontSize: 24, color: "#8B7355" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Sold Properties</p>
                <p style={statValueStyle}>{roleData.stats?.sold || 0}</p>
              </div>
            </div>
          </div>
        );

      case 'builder':
        return (
          <div className="stats-grid" style={statsGridStyle}>
            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineOfficeBuilding style={{ fontSize: 24, color: "#7A5C3A" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Total Projects</p>
                <p style={statValueStyle}>{roleData.stats?.totalProjects || 0}</p>
              </div>
            </div>
            
            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineCurrencyDollar style={{ fontSize: 24, color: "#7A5C3A" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Total Budget</p>
                <p style={statValueStyle}>₹{(roleData.stats?.totalBudget || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card" style={statCardStyle}>
              <div style={statIconStyle}>
                <HiOutlineClipboardList style={{ fontSize: 24, color: "#7A5C3A" }} />
              </div>
              <div>
                <p style={statLabelStyle}>Completed</p>
                <p style={statValueStyle}>{roleData.stats?.completed || 0}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Styles
  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginTop: "16px"
  };

  const statCardStyle = {
    background: "#FDFAF5",
    border: "1px solid #D4C9B5",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  };

  const statIconStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#F5F0E8",
    border: "1px solid #D4C9B5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const statLabelStyle = {
    fontSize: "12px",
    color: "#A89880",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.04em"
  };

  const statValueStyle = {
    fontSize: "28px",
    fontWeight: 500,
    color: "#2C2A26",
    lineHeight: 1
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#F5F0E8",
        minHeight: "100vh",
        padding: "36px 40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 50,
            height: 50,
            border: "3px solid #D4C9B5",
            borderTopColor: "#8B7355",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <p style={{ color: "#8B7355" }}>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#F5F0E8",
        minHeight: "100vh",
        padding: "36px 40px"
      }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            border: "1px solid #D4C9B5",
            borderRadius: 8,
            background: "#FDFAF5",
            color: "#8B7355",
            cursor: "pointer",
            marginBottom: 20
          }}
        >
          <HiOutlineArrowLeft /> Back to Users
        </button>
        <div style={{ textAlign: "center", padding: 60, color: "#A89880" }}>
          User not found
        </div>
      </div>
    );
  }

  const rc = roleConfig[user.role] || roleConfig.buyer;
  const isBlocked = user.isBlocked;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#F5F0E8",
      minHeight: "100vh",
      padding: "36px 40px",
      position: "relative"
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .detail-card {
          background: #FDFAF5;
          border: 1px solid #D4C9B5;
          border-radius: 14px;
          padding: 24px;
        }

        .action-button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
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
      `}</style>

      {/* Block User Modal */}
      {showBlockModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowBlockModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, color: "#2C2A26" }}>Block User</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}
                disabled={actionLoading}
              >
                <HiOutlineX />
              </button>
            </div>
            
            <p style={{ marginBottom: 16, color: "#6B5840" }}>
              Blocking <strong>{user.name}</strong>
            </p>
            
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter reason for blocking..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #D4C9B5',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                marginBottom: 20,
                resize: 'vertical'
              }}
              disabled={actionLoading}
            />
            
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBlockModal(false)}
                className="action-button"
                style={{
                  background: "#F0EBE3",
                  borderColor: "#C9B89A",
                  color: "#6B5840"
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="action-button"
                style={{
                  background: "#F5EDE0",
                  borderColor: "#C9AA80",
                  color: "#7A5C3A"
                }}
                disabled={!blockReason.trim() || actionLoading}
              >
                {actionLoading ? 'Blocking...' : 'Block User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            border: "1px solid #D4C9B5",
            borderRadius: 8,
            background: "#FDFAF5",
            color: "#8B7355",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13
          }}
          disabled={actionLoading}
        >
          <HiOutlineArrowLeft /> Back to Users
        </button>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleRoleChange}
            className="action-button"
            style={{
              background: "#E8E3ED",
              borderColor: "#B8A0D4",
              color: "#5A3A7A"
            }}
            disabled={actionLoading}
          >
            Change Role
          </button>
          
          {isBlocked ? (
            <button
              onClick={handleUnblockUser}
              className="action-button"
              style={{
                background: "#EDF2EE",
                borderColor: "#B8D0BF",
                color: "#4A7C59"
              }}
              disabled={actionLoading}
            >
              <HiOutlineShieldCheck /> Unblock User
            </button>
          ) : (
            <button
              onClick={() => setShowBlockModal(true)}
              className="action-button"
              style={{
                background: "#F5EDE0",
                borderColor: "#C9AA80",
                color: "#7A5C3A"
              }}
              disabled={actionLoading}
            >
              <HiOutlineShieldExclamation /> Block User
            </button>
          )}
          
          <button
            onClick={handleDeleteUser}
            className="action-button"
            style={{
              background: "#F5EDED",
              borderColor: "#D4AAAA",
              color: "#8B4040"
            }}
            disabled={actionLoading}
          >
            Delete User
          </button>
        </div>
      </div>

      {/* User Header with Role Badge */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 30 
      }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#A89880", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
            User Details
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: "#2C2A26", fontWeight: 400, fontStyle: "italic" }}>
              {user.name}
            </h1>
            <span style={{
              padding: "6px 14px",
              background: rc.bg,
              color: rc.text,
              border: `1px solid ${rc.border}`,
              borderRadius: 30,
              fontSize: 13,
              fontWeight: 500
            }}>
              {rc.label}
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        {isBlocked ? (
          <span style={{
            padding: "8px 16px",
            background: "#F5EDED",
            color: "#8B4040",
            border: "1px solid #D4AAAA",
            borderRadius: 30,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <HiOutlineShieldExclamation /> Blocked
            {user.blockedReason && <span title={user.blockedReason}>⚠️</span>}
          </span>
        ) : (
          <span style={{
            padding: "8px 16px",
            background: "#EDF2EE",
            color: "#4A7C59",
            border: "1px solid #B8D0BF",
            borderRadius: 30,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <HiOutlineShieldCheck /> Active
          </span>
        )}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* User Information */}
        <div className="detail-card">
          <h2 style={{ fontSize: 18, marginBottom: 20, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
            <HiOutlineUser /> Profile Information
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Full Name</p>
              <p style={{ fontSize: 15, color: "#2C2A26", fontWeight: 500 }}>{user.name}</p>
            </div>
            
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Email</p>
              <p style={{ fontSize: 15, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineMail style={{ color: "#8B7355" }} /> {user.email}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Phone</p>
              <p style={{ fontSize: 15, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlinePhone style={{ color: "#8B7355" }} /> {user.phone || 'Not provided'}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>User ID</p>
              <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineIdentification /> {user._id}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="detail-card">
          <h2 style={{ fontSize: 18, marginBottom: 20, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
            <HiOutlineCalendar /> Account Information
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Member Since</p>
              <p style={{ fontSize: 15, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineCalendar /> 
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Last Updated</p>
              <p style={{ fontSize: 15, color: "#2C2A26" }}>
                {new Date(user.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {isBlocked && user.blockedReason && (
              <div>
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Block Reason</p>
                <p style={{ 
                  fontSize: 14, 
                  color: "#8B4040", 
                  background: "#F5EDED",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #D4AAAA"
                }}>
                  {user.blockedReason}
                </p>
                {user.blockedAt && (
                  <p style={{ fontSize: 11, color: "#A89880", marginTop: 8 }}>
                    Blocked on: {new Date(user.blockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Role-Specific Statistics */}
        {getRoleSpecificStats() && (
          <div className="detail-card" style={{ gridColumn: "span 2" }}>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineBriefcase /> Activity Overview
            </h2>
            
            {getRoleSpecificStats()}
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="detail-card" style={{ gridColumn: "span 2" }}>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineChat /> Recent Activity
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "#FAF6EF",
                  borderRadius: "8px",
                  border: "1px solid #EDE8DF"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {activity.type === 'chat' && <HiOutlineChat style={{ color: "#8B7355" }} />}
                    {activity.type === 'project' && <HiOutlineOfficeBuilding style={{ color: "#7A5C3A" }} />}
                    {activity.type === 'property' && <HiOutlineHome style={{ color: "#8B7355" }} />}
                    {activity.type === 'enquiry' && <HiOutlineClipboardList style={{ color: "#4A7C59" }} />}
                    <span style={{ fontSize: 14, color: "#2C2A26" }}>{activity.description}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#A89880" }}>
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetails;

     