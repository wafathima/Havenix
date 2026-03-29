import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineTrendingUp,
  HiOutlineCube,
  HiOutlinePhone,
  HiOutlineViewGrid,
  HiOutlineHome,
  HiOutlineStar,
} from "react-icons/hi";
import { MdOutlineBed, MdOutlineBathroom, MdOutlineBalcony } from 'react-icons/md';

function AdminProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({ total: 0, byCategory: {} });
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);


const fetchProjectDetails = async () => {
  try {
    setLoading(true);
    const { data } = await API.get(`/admin/projects/${projectId}`);
    console.log('Project details:', data);
    console.log('Project images:', data.project?.images); // Add this line
    if (data.success) {
      setProject(data.project);
      setExpenses(data.expenses || []);
      setExpenseSummary(data.expenseSummary || { total: 0, byCategory: {} });
      setTimeline(data.timeline || []);
    } else {
      toast.error(data.message || "Failed to load project details");
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    toast.error(error.response?.data?.message || "Failed to load project details");
  } finally {
    setLoading(false);
  }
};

// Add this helper function
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Remove any leading slash if present and add the correct base URL
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `http://localhost:5050${cleanPath}`;
};

  const handleUpdateStatus = async (newStatus) => {
    try {
      const { data } = await API.patch(`/admin/projects/${projectId}/status`, { status: newStatus });
      if (data.success) {
        toast.success(data.message);
        setProject(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleUpdatePrice = async () => {
    const newPrice = prompt("Enter new price amount:", project?.price);
    if (!newPrice) return;
    
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price amount");
      return;
    }

    try {
      const { data } = await API.patch(`/admin/projects/${projectId}/budget`, { budget: priceNum });
      if (data.success) {
        toast.success(data.message);
        setProject(prev => ({ ...prev, price: priceNum }));
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error(error.response?.data?.message || "Failed to update price");
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
          <p style={{ color: "#8B7355" }}>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#F5F0E8",
        minHeight: "100vh",
        padding: "36px 40px"
      }}>
        <button
          onClick={() => navigate('/admin/projects')}
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
          <HiOutlineArrowLeft /> Back to Projects
        </button>
        <div style={{ textAlign: "center", padding: 60, color: "#A89880" }}>
          Project not found
        </div>
      </div>
    );
  }

  const remainingBudget = (project.price || 0) - expenseSummary.total;
  const spentPercentage = project.price ? ((expenseSummary.total / project.price) * 100).toFixed(1) : 0;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#F5F0E8",
      minHeight: "100vh",
      padding: "36px 40px",
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
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid;
        }
        .expense-item {
          padding: 12px;
          border-bottom: 1px solid #EDE8DF;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .expense-item:last-child {
          border-bottom: none;
        }
        .timeline-item {
          padding: 12px;
          border-left: 2px solid #D4C9B5;
          margin-left: 12px;
          position: relative;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -7px;
          top: 16px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #8B7355;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 16px;
        }
        .info-item {
          padding: 12px;
          background: #FAF6EF;
          border-radius: 8px;
          border: 1px solid #EDE8DF;
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/projects')}
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
        >
          <HiOutlineArrowLeft /> Back to Projects
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleUpdatePrice}
            className="abtn abtn-view"
            style={{ padding: "8px 16px" }}
          >
            <HiOutlineCurrencyDollar /> Update Price
          </button>

          <select
            value={project.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            style={{
              padding: "8px 16px",
              border: "1px solid #D4C9B5",
              borderRadius: 8,
              background: "#FDFAF5",
              color: "#2C2A26",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            <option value="planning">Planning</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="onhold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#A89880", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
          Project Details
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: "#2C2A26", fontWeight: 400, fontStyle: "italic" }}>
          {project.name}
        </h1>
        {project.tagline && (
          <p style={{ fontSize: 16, color: "#8B7355", marginTop: 4 }}>{project.tagline}</p>
        )}
      </div>

      {/* Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <div className="detail-card" style={{ padding: "16px" }}>
          <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Total Price</p>
          <p style={{ fontSize: 24, fontWeight: 600, color: "#2C2A26" }}>{formatPrice(project.price)}</p>
        </div>
        <div className="detail-card" style={{ padding: "16px" }}>
          <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Spent Amount</p>
          <p style={{ fontSize: 24, fontWeight: 600, color: "#8B4040" }}>{formatPrice(expenseSummary.total)}</p>
        </div>
        <div className="detail-card" style={{ padding: "16px" }}>
          <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Remaining</p>
          <p style={{ fontSize: 24, fontWeight: 600, color: remainingBudget < 0 ? "#8B4040" : "#4A7C59" }}>
            {formatPrice(remainingBudget)}
          </p>
        </div>
        <div className="detail-card" style={{ padding: "16px" }}>
          <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Budget Used</p>
          <p style={{ fontSize: 24, fontWeight: 600, color: "#2C2A26" }}>{spentPercentage}%</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Main Info */}
        <div className="detail-card">
          <h2 style={{ fontSize: 18, marginBottom: 20, color: "#2C2A26" }}>Project Information</h2>
          
    
{/* Image Gallery - Fixed with proper URL handling */}
{/* Enhanced Image Gallery with Lightbox */}
<div style={{ marginBottom: 30 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <h3 style={{ fontSize: 18, color: "#2C2A26", display: 'flex', alignItems: 'center', gap: 8 }}>
      <HiOutlinePhotograph /> Project Gallery
    </h3>
    {project.images && project.images.length > 0 && (
      <span style={{ 
        fontSize: 13, 
        color: "#8B7355", 
        background: "#EDE8DF", 
        padding: "4px 12px", 
        borderRadius: 20 
      }}>
        {project.images.length} image{project.images.length > 1 ? 's' : ''}
      </span>
    )}
  </div>
  
  {project.images && project.images.length > 0 ? (
    <>
      {/* Main Image with Navigation */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div 
          style={{ 
            width: '100%', 
            height: 400, 
            borderRadius: 16,
            overflow: 'hidden',
            background: '#EDE8DF',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}
          onClick={() => {
            setSelectedImage(project.images[0]);
            setCurrentImageIndex(0);
          }}
        >
          <img 
            src={getImageUrl(project.images[0])} 
            alt={project.name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
            }}
          />
        </div>
        
        {/* Image counter badge */}
        {project.images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '6px 14px',
            borderRadius: 30,
            fontSize: 13,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <HiOutlinePhotograph /> 1/{project.images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {project.images.length > 1 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${Math.min(project.images.length, 5)}, 1fr)`, 
          gap: 12,
          marginTop: 12
        }}>
          {project.images.slice(0, 5).map((img, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedImage(img);
                setCurrentImageIndex(index);
              }}
              style={{
                width: '100%',
                height: 80,
                borderRadius: 10,
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === 0 ? '3px solid #8B7355' : '2px solid transparent',
                boxShadow: index === 0 ? '0 4px 12px rgba(139,115,85,0.3)' : 'none',
                transition: 'all 0.2s ease',
                opacity: index === 0 ? 1 : 0.8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = index === 0 ? 1 : 0.8;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img 
                src={getImageUrl(img)} 
                alt={`${project.name} ${index + 1}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/100x80?text=No+Image';
                }}
              />
            </div>
          ))}
          
          {project.images.length > 5 && (
            <div
              onClick={() => setSelectedImage(project.images[4])}
              style={{
                width: '100%',
                height: 80,
                borderRadius: 10,
                background: '#EDE8DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid #D4C9B5',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#D4C9B5';
                e.currentTarget.style.color = '#2C2A26';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#EDE8DF';
                e.currentTarget.style.color = '#8B7355';
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14 }}>+{project.images.length - 5}</span>
            </div>
          )}
        </div>
      )}
    </>
  ) : (
    <div style={{ 
      width: '100%', 
      height: 300, 
      background: "#EDE8DF", 
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      color: "#8B7355",
      border: '2px dashed #D4C9B5'
    }}>
      <HiOutlineOfficeBuilding style={{ fontSize: 64, opacity: 0.5 }} />
      <p style={{ fontSize: 16 }}>No images uploaded for this project</p>
    </div>
  )}
</div>

{/* Lightbox Modal */}
{selectedImage && (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    }}
    onClick={() => setSelectedImage(null)}
  >
    {/* Close button */}
    <button
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        fontSize: 24,
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease',
        zIndex: 1001
      }}
      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedImage(null);
      }}
    >
      ✕
    </button>

    {/* Previous button */}
    {project.images.length > 1 && (
      <button
        style={{
          position: 'absolute',
          left: 20,
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: 24,
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease',
          zIndex: 1001
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        onClick={(e) => {
          e.stopPropagation();
          const newIndex = (currentImageIndex - 1 + project.images.length) % project.images.length;
          setCurrentImageIndex(newIndex);
          setSelectedImage(project.images[newIndex]);
        }}
      >
        ‹
      </button>
    )}

    {/* Image */}
    <img 
      src={getImageUrl(selectedImage)} 
      alt="Project"
      style={{
        maxWidth: '90vw',
        maxHeight: '90vh',
        objectFit: 'contain',
        borderRadius: 8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}
      onClick={(e) => e.stopPropagation()}
    />

    {/* Next button */}
    {project.images.length > 1 && (
      <button
        style={{
          position: 'absolute',
          right: 20,
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: 24,
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease',
          zIndex: 1001
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        onClick={(e) => {
          e.stopPropagation();
          const newIndex = (currentImageIndex + 1) % project.images.length;
          setCurrentImageIndex(newIndex);
          setSelectedImage(project.images[newIndex]);
        }}
      >
        ›
      </button>
    )}

    {/* Image counter in lightbox */}
    {project.images.length > 1 && (
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: 30,
          fontSize: 14,
          backdropFilter: 'blur(4px)'
        }}
      >
        {currentImageIndex + 1} / {project.images.length}
      </div>
    )}
  </div>
)}


          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Builder</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineUser style={{ color: "#8B7355" }} />
                <span style={{ fontSize: 15, color: "#2C2A26" }}>{project.builder?.name || 'N/A'}</span>
              </div>
              {project.builder?.email && (
                <p style={{ fontSize: 13, color: "#8B7355", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <HiOutlinePhone /> {project.builder.email}
                </p>
              )}
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Status</p>
              <span className="status-badge" style={{
                background: project.status === 'ongoing' ? '#EDF2EE' : 
                           project.status === 'completed' ? '#E8E3ED' : 
                           project.status === 'planning' ? '#F5F0E8' : '#F5EDED',
                color: project.status === 'ongoing' ? '#4A7C59' : 
                       project.status === 'completed' ? '#5A3A7A' : 
                       project.status === 'planning' ? '#8B7355' : '#8B4040',
                borderColor: project.status === 'ongoing' ? '#B8D0BF' : 
                            project.status === 'completed' ? '#B8A0D4' : 
                            project.status === 'planning' ? '#D4C9B5' : '#D4AAAA'
              }}>
                {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Description</p>
            <p style={{ fontSize: 14, color: "#2C2A26", lineHeight: 1.6 }}>{project.description}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Location</p>
            <p style={{ fontSize: 15, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineLocationMarker style={{ color: "#8B7355" }} /> 
              {project.location || project.city || 'N/A'}, {project.state || ''} - {project.pincode || ''}
            </p>
            {project.landmark && (
              <p style={{ fontSize: 13, color: "#8B7355", marginTop: 4 }}>Landmark: {project.landmark}</p>
            )}
          </div>

          {/* Unit Details */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, color: "#2C2A26" }}>Unit Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Bedrooms</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                  <MdOutlineBed /> {project.bedrooms || 0} BHK
                </p>
              </div>
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Bathrooms</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                  <MdOutlineBathroom /> {project.bathrooms || 0}
                </p>
              </div>
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Balconies</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                  <MdOutlineBalcony /> {project.balconies || 0}
                </p>
              </div>
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Area</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                  <HiOutlineViewGrid /> {project.area || 0} sq.ft
                </p>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, color: "#2C2A26" }}>Project Stats</h3>
            <div className="info-grid">
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Total Units</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2C2A26" }}>{project.totalUnits || 0}</p>
              </div>
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Available Units</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#4A7C59" }}>{project.availableUnits || 0}</p>
              </div>
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Total Towers</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2C2A26" }}>{project.totalTowers || 0}</p>
              </div>
              <div className="info-item">
                <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Floors/Tower</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2C2A26" }}>{project.floorsPerTower || 0}</p>
              </div>
            </div>
          </div>

          {/* RERA Details */}
          {project.reraNumber && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>RERA Number</p>
              <p style={{ fontSize: 14, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineStar style={{ color: "#8B7355" }} /> {project.reraNumber}
                {project.reraApproved && (
                  <span style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    background: "#EDF2EE",
                    color: "#4A7C59",
                    borderRadius: 12,
                    marginLeft: 8
                  }}>
                    Approved
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, color: "#2C2A26" }}>Amenities</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.amenities.map((amenity, idx) => (
                  <span key={idx} style={{
                    padding: "4px 12px",
                    background: "#F0EBE3",
                    color: "#6B5840",
                    borderRadius: 20,
                    fontSize: 12,
                    border: "1px solid #D4C9B5"
                  }}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, color: "#2C2A26" }}>Features</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.features.map((feature, idx) => (
                  <span key={idx} style={{
                    padding: "4px 12px",
                    background: "#EDF2EE",
                    color: "#4A7C59",
                    borderRadius: 20,
                    fontSize: 12,
                    border: "1px solid #B8D0BF"
                  }}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Price Details */}
          <div className="detail-card">
            <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineCurrencyDollar /> Price Details
            </h2>
            
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#6B5840" }}>Base Price</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#2C2A26" }}>{formatPrice(project.basePrice)}</span>
              </div>
              {project.pricePerSqFt && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6B5840" }}>Price per sq.ft</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#2C2A26" }}>₹{project.pricePerSqFt}</span>
                </div>
              )}
              {project.maintenance && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6B5840" }}>Maintenance</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#2C2A26" }}>₹{project.maintenance}/{project.maintenanceFrequency || 'monthly'}</span>
                </div>
              )}
              {project.parkingPrice && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6B5840" }}>Parking</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#2C2A26" }}>₹{project.parkingPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="detail-card">
            <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineCalendar /> Important Dates
            </h2>
            
            <div style={{ display: "grid", gap: 12 }}>
              {project.launchDate && (
                <div>
                  <p style={{ fontSize: 11, color: "#A89880", marginBottom: 2 }}>Launch Date</p>
                  <p style={{ fontSize: 13, color: "#2C2A26" }}>{new Date(project.launchDate).toLocaleDateString()}</p>
                </div>
              )}
              {project.possessionDate && (
                <div>
                  <p style={{ fontSize: 11, color: "#A89880", marginBottom: 2 }}>Possession Date</p>
                  <p style={{ fontSize: 13, color: "#2C2A26" }}>{new Date(project.possessionDate).toLocaleDateString()}</p>
                </div>
              )}
              {project.completionDate && (
                <div>
                  <p style={{ fontSize: 11, color: "#A89880", marginBottom: 2 }}>Completion Date</p>
                  <p style={{ fontSize: 13, color: "#2C2A26" }}>{new Date(project.completionDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Expense Summary */}
          <div className="detail-card">
            <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineChartBar /> Expense Summary
            </h2>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#6B5840" }}>Budget Usage</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2A26" }}>{spentPercentage}%</span>
              </div>
              <div style={{
                width: '100%',
                height: 8,
                background: "#EDE8DF",
                borderRadius: 4,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${spentPercentage}%`,
                  height: '100%',
                  background: spentPercentage > 100 ? '#8B4040' : '#4A7C59',
                  borderRadius: 4
                }} />
              </div>
            </div>

            {Object.keys(expenseSummary.byCategory).length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {Object.entries(expenseSummary.byCategory).map(([category, amount]) => (
                  <div key={category} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "#6B5840", textTransform: "capitalize" }}>{category}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#2C2A26" }}>{formatPrice(amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#A89880", textAlign: "center", padding: "12px" }}>
                No expenses recorded yet
              </p>
            )}
          </div>

          {/* Recent Expenses */}
          {expenses.length > 0 && (
            <div className="detail-card">
              <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineClipboardList /> Recent Expenses
              </h2>
              
              <div>
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense._id} className="expense-item">
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#2C2A26" }}>
                        {expense.description || expense.category}
                      </p>
                      <p style={{ fontSize: 11, color: "#8B7355" }}>
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#2C2A26" }}>
                      {formatPrice(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="detail-card">
              <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineCalendar /> Timeline
              </h2>
              
              <div>
                {timeline.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <p style={{ fontSize: 13, color: "#2C2A26" }}>{item.description}</p>
                    <p style={{ fontSize: 11, color: "#8B7355", marginTop: 4 }}>
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProjectDetails;