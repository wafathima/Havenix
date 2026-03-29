import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  HiOutlineOfficeBuilding,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineStatusOnline,
  HiOutlineChartBar,
  HiOutlineHome,
} from "react-icons/hi";
import { MdOutlineBed, MdOutlineBathroom } from 'react-icons/md';

function ManageProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const [filters, setFilters] = useState({
    status: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [pagination.page, filters.status, filters.search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      console.log('Fetching projects with params:', params.toString());
      
      const { data } = await API.get(`/admin/projects?${params.toString()}`);
      console.log('Projects response:', data);
      
      if (data.success) {
        setProjects(data.projects || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 1
        }));
      } else {
        toast.error(data.message || "Failed to load projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/admin/projects/${projectId}`);
  };

  // const handleDeleteProject = async (projectId) => {
  //   if (!window.confirm("⚠️ Are you sure you want to delete this project? This will also delete all associated expenses and data.")) {
  //     return;
  //   }

  //   try {
  //     const response = await API.delete(`/admin/projects/${projectId}`);
  //     toast.success(response.data.message || "Project deleted successfully");
  //     fetchProjects();
  //   } catch (error) {
  //     console.error("Error deleting project:", error);
  //     toast.error(error.response?.data?.message || "Failed to delete project");
  //   }
  // };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'planning': return { bg: "#F5F0E8", color: "#8B7355", border: "#D4C9B5" };
      case 'ongoing': return { bg: "#EDF2EE", color: "#4A7C59", border: "#B8D0BF" };
      case 'completed': return { bg: "#E8E3ED", color: "#5A3A7A", border: "#B8A0D4" };
      case 'onhold': return { bg: "#F5EDED", color: "#8B4040", border: "#D4AAAA" };
      case 'cancelled': return { bg: "#F5EDED", color: "#8B4040", border: "#D4AAAA" };
      default: return { bg: "#F5F0E8", color: "#8B7355", border: "#D4C9B5" };
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price?.toLocaleString()}`;
  };

  // Skeleton loader
  const TableRowSkeleton = () => (
    <tr>
      <td colSpan="7" style={{ padding: '15px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 60, height: 45, borderRadius: 6, background: '#EDE8DF', animation: 'pulse 1.5s ease infinite' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: '30%', background: '#EDE8DF', borderRadius: 4, marginBottom: 4, animation: 'pulse 1.5s ease infinite' }} />
            <div style={{ height: 12, width: '50%', background: '#EDE8DF', borderRadius: 4, animation: 'pulse 1.5s ease infinite' }} />
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

        .table-wrap {
          background: #FDFAF5;
          border: 1px solid #D4C9B5;
          border-radius: 14px;
          overflow: hidden;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th {
          text-align: left;
          padding: 13px 22px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #A89880;
          background: #F5F0E8;
          border-bottom: 1px solid #D4C9B5;
        }
        .table td {
          padding: 15px 22px;
          border-bottom: 1px solid #EDE8DF;
          vertical-align: middle;
        }
        .table tbody tr:last-child td { border-bottom: none; }
        .table tbody tr:hover { background: #FAF6EF; }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid;
        }

        .filter-input {
          padding: 8px 12px;
          border: 1px solid #D4C9B5;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
        }
        .filter-input:focus {
          outline: none;
          border-color: #8B7355;
        }

        .pbtn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid #D4C9B5; background: #FDFAF5; color: #8B7355;
          font-size: 13px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .pbtn:hover { background: #EDE8DF; border-color: #8B7355; color: #2C2A26; }
        .pbtn.active { background: #2C2A26; border-color: #2C2A26; color: #F5F0E8; }
        .pbtn.nav { width: auto; padding: 0 13px; gap: 4px; font-size: 12px; }

        .abtn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 8px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          border: 1px solid; background: transparent;
        }
        .abtn-view { color: #6B5840; border-color: #C9B89A; background: #F0EBE3; }
        .abtn-view:hover { background: #E8DFD1; }
        .abtn-delete { color: #8B4040; border-color: #D4AAAA; background: #F5EDED; }
        .abtn-delete:hover { background: #EDDCDC; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#A89880", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
          Project Management
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: "#2C2A26", fontWeight: 400, fontStyle: "italic" }}>
          Manage Projects
        </h1>
      </div>

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="abtn abtn-view"
            style={{ padding: "8px 14px" }}
          >
            <HiOutlineFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={fetchProjects}
            className="abtn abtn-view"
            style={{ padding: "8px 14px" }}
          >
            <HiOutlineRefresh /> Refresh
          </button>
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
            <HiOutlineOfficeBuilding />
            Total: {pagination.total} projects
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
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="filter-input"
            style={{ width: "150px" }}
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="onhold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div style={{ position: 'relative' }}>
            <HiOutlineSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A89880' }} />
            <input
              type="text"
              placeholder="Search by name, location..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="filter-input"
              style={{ paddingLeft: 32, width: 250 }}
            />
          </div>

          {(filters.status || filters.search) && (
            <button
              onClick={() => setFilters({ status: "", search: "" })}
              className="abtn abtn-view"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Projects Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Builder/Seller</th>
              <th>Price</th>
              <th>Location</th>
              <th>Units</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
            ) : projects.length > 0 ? (
              projects.map((project) => {
                const statusColors = getStatusColor(project.status);
                return (
                  <tr key={project._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {project.images && project.images.length > 0 ? (
                          <img 
                            src={project.images[0]} 
                            alt={project.name}
                            style={{ width: 60, height: 45, borderRadius: 6, objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: 60, height: 45, 
                            background: "#EDE8DF", 
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#8B7355"
                          }}>
                            <HiOutlineOfficeBuilding />
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#2C2A26" }}>{project.name}</p>
                          <p style={{ fontSize: 11, color: "#A89880" }}>ID: {project._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <HiOutlineUser style={{ color: "#8B7355" }} />
                          <span style={{ fontSize: 13, color: "#6B5840" }}>
                            {project.builder?.name || project.seller?.name || 'N/A'}
                          </span>
                        </div>
                        {project.builder?.email && (
                          <span style={{ fontSize: 11, color: "#A89880" }}>
                            {project.builder.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#2C2A26" }}>
                        {formatPrice(project.price)}
                      </p>
                      {project.stats && (
                        <p style={{ fontSize: 11, color: project.stats.remainingBudget < 0 ? "#8B4040" : "#4A7C59" }}>
                          Remaining: {formatPrice(project.stats.remainingBudget)}
                        </p>
                      )}
                    </td>
                    <td>
                      <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 4 }}>
                        <HiOutlineLocationMarker /> {project.city || project.location || 'N/A'}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MdOutlineBed style={{ color: "#8B7355" }} />
                          <span style={{ fontSize: 13, color: "#6B5840" }}>
                            {project.bedrooms || 0} BHK
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: "#A89880" }}>
                          Total: {project.totalUnits || 0} | Available: {project.availableUnits || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{
                        background: statusColors.bg,
                        color: statusColors.color,
                        borderColor: statusColors.border
                      }}>
                        {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button 
                          className="abtn abtn-view"
                          onClick={() => handleViewProject(project._id)}
                        >
                          <HiOutlineEye /> View
                        </button>
                        {/* <button 
                          className="abtn abtn-delete"
                          onClick={() => handleDeleteProject(project._id)}
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
                <td colSpan="7" style={{ textAlign: "center", padding: "60px", color: "#A89880" }}>
                  <HiOutlineOfficeBuilding style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }} />
                  <p>No projects found</p>
                  {(filters.status || filters.search) && (
                    <button
                      onClick={() => setFilters({ status: "", search: "" })}
                      className="abtn abtn-view"
                      style={{ marginTop: 10 }}
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
            display: "flex", justifyContent: "space-between",
            padding: "14px 22px", borderTop: "1px solid #D4C9B5", background: "#F5F0E8",
          }}>
            <p style={{ fontSize: 12, color: "#A89880" }}>
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button 
                className="pbtn nav"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
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
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="pbtn nav"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
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

export default ManageProjects;