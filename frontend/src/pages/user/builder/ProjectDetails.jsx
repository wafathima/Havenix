import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../../api/axios";
import {
  BuildingOfficeIcon, CalendarIcon, CurrencyDollarIcon,
  MapPinIcon, WrenchScrewdriverIcon, CheckCircleIcon,
  ArrowLeftIcon, PencilIcon, TrashIcon, DocumentTextIcon,
  UserIcon, PhoneIcon, EnvelopeIcon, ClockIcon, HomeIcon,
  TagIcon, StarIcon, DocumentIcon, SparklesIcon,
  ScaleIcon, CubeIcon, ArrowTrendingUpIcon, UserGroupIcon,
  BoltIcon, FireIcon, WifiIcon, ShieldCheckIcon, CpuChipIcon,
  TruckIcon, PaintBrushIcon, Squares2X2Icon, ViewfinderCircleIcon,
  CursorArrowRaysIcon, RectangleGroupIcon, RectangleStackIcon
} from "@heroicons/react/24/outline";
import { 
  FaUserTie, FaUserCog, FaBed, FaBath, FaParking, 
  FaRulerCombined, FaSwimmingPool, FaDumbbell, FaLeaf,
  FaShieldAlt, FaFire, FaWifi, FaTools, FaCheckCircle,
  FaRegBuilding, FaCalendarCheck, FaClock, FaVideo
} from "react-icons/fa";
import { 
  MdBalcony, MdOutlineConstruction, MdOutlineDeveloperBoard,
  MdOutlineKitchen, MdOutlineSecurity, MdOutlinePool,
  MdOutlineSportsTennis, MdOutlineYard, MdOutlineElevator,
  MdOutlineAcUnit, MdOutlinePets
} from "react-icons/md";
import { BiWater, BiCctv } from "react-icons/bi";
import { GiElectric, GiGardeningShears } from "react-icons/gi";
import toast from "react-hot-toast";

export default function ProjectDetails() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  
const fetchProjectDetails = async () => {
  try {
    setLoading(true);
    console.log("Fetching project details for ID:", id);
    
    // First try to get as builder's own project
    try {
      const { data } = await API.get(`/builder/my/${id}`);
      console.log("Project data from builder endpoint:", data);
      if (data.success) {
        setProject(data.project || data);
        return;
      }
    } catch (builderError) {
      console.log("Not builder's project, trying public endpoint");
    }
    
    // If that fails, try public endpoint
    const { data } = await API.get(`/builder/public/${id}`);
    console.log("Project data from public endpoint:", data);
    if (data.success) {
      setProject(data.project || data);
    }
  } catch (error) {
    console.error("Error fetching project details:", error);
    console.error("Error response:", error.response?.data);
    toast.error(error.response?.data?.message || "Failed to load project details");
    navigate('/builder/dashboard');
  } finally {
    setLoading(false);
  }
};

  // Add this helper function at the top of your component
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${import.meta.env.VITE_API_URL}${cleanPath}`;
};


  const handleDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/builder/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/builder/dashboard?tab=projects');
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (n) => {
    if (!n) return "₹0";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lac`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'ongoing': return { bg: '#FFF3E0', color: '#C4A97A', text: '#8B6B4D', dot: '#C4A97A' };
      case 'completed': return { bg: '#E8F5E9', color: '#2E7D32', text: '#1B5E20', dot: '#2E7D32' };
      case 'upcoming': return { bg: '#E3F2FD', color: '#1976D2', text: '#0D47A1', dot: '#1976D2' };
      case 'cancelled': return { bg: '#FFEBEE', color: '#C4503C', text: '#B71C1C', dot: '#C4503C' };
      default: return { bg: '#F5F5F5', color: '#8B7355', text: '#5D4A36', dot: '#8B7355' };
    }
  };

  const getFeatureIcon = (featureId) => {
    const iconMap = {
      swimmingPool: <MdOutlinePool />,
      parking: <FaParking />,
      security: <MdOutlineSecurity />,
      powerBackup: <BoltIcon />,
      modularKitchen: <MdOutlineKitchen />,
      gym: <FaDumbbell />,
      wifi: <WifiIcon />,
      cctv: <BiCctv />,
      petFriendly: <MdOutlinePets />,
      ac: <MdOutlineAcUnit />,
      balcony: <MdBalcony />,
      elevator: <MdOutlineElevator />,
      clubhouse: <FaRegBuilding />,
      garden: <MdOutlineYard />,
      childrenPlay: <GiGardeningShears />,
      sports: <MdOutlineSportsTennis />,
      rainwater: <BiWater />,
      solar: <GiElectric />,
      fireSafety: <FaFire />,
      vaastu: <FaCheckCircle />
    };
    return iconMap[featureId] || <SparklesIcon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', padding: '40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ animation: 'pulse 1.4s ease infinite' }}>
            <div style={{ height: 40, background: '#EDE8DC', width: '60%', marginBottom: 20, borderRadius: 8 }} />
            <div style={{ height: 200, background: '#EDE8DC', marginBottom: 20, borderRadius: 12 }} />
            <div style={{ height: 300, background: '#EDE8DC', borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  

  if (!project) return null;

  const statusStyle = getStatusColor(project.status);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        .bld-sans { font-family: 'DM Sans', sans-serif; }
        .bld-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .bld-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
          border: 1px solid rgba(139,115,85,0.1);
          overflow: hidden;
        }
        .bld-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }

        .bld-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(139,115,85,0.1);
          background: linear-gradient(to right, #F9F9F7, #FFFFFF);
        }

        .bld-card-body {
          padding: 24px;
        }

        .bld-stat-card {
          background: linear-gradient(135deg, #F9F9F7 0%, #F5F0E8 100%);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(139,115,85,0.15);
          transition: all 0.3s ease;
        }
        .bld-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(139,115,85,0.1);
        }

        .bld-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .bld-info-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: #F9F9F7;
          border-radius: 12px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .bld-info-item:hover {
          background: #F5F0E8;
          border-color: rgba(139,115,85,0.2);
          transform: translateX(4px);
        }

        .bld-info-icon {
          width: 44px;
          height: 44px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B7355;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }

        .bld-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: white;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 30px;
          font-size: 0.8rem;
          color: #5D4A36;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .bld-tag:hover {
          border-color: #8B7355;
          background: #F5F0E8;
        }

        .bld-image-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .bld-gallery-item {
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          position: relative;
        }
        .bld-gallery-item:hover {
          transform: scale(1.02);
          border-color: #8B7355;
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .bld-gallery-item::after {
          content: '🔍';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          background: rgba(0,0,0,0.5);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          opacity: 0;
        }
        .bld-gallery-item:hover::after {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }

        .bld-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .bld-gallery-item:hover img {
          transform: scale(1.1);
        }

        .bld-modal-image {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          cursor: pointer;
          animation: fadeIn 0.3s ease;
        }
        .bld-modal-image img {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .bld-tab-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(139,115,85,0.15);
          padding-bottom: 12px;
          flex-wrap: wrap;
        }

        .bld-tab {
          padding: 10px 24px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #8B7355;
          background: transparent;
          border: 1px solid transparent;
        }
        .bld-tab:hover {
          background: rgba(139,115,85,0.05);
          border-color: rgba(139,115,85,0.2);
        }
        .bld-tab.active {
          background: #8B7355;
          color: white;
          border-color: #8B7355;
        }

        .bld-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1E1C18; color: #F5F0E8;
          border: none; padding: 12px 28px; border-radius: 30px;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
          letter-spacing: 0.02em; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .bld-btn-primary:hover { 
          background: #2C2A26; 
          transform: translateY(-2px); 
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .bld-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: #1E1C18;
          border: 1px solid rgba(139,115,85,0.3); padding: 12px 28px; border-radius: 30px;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
          letter-spacing: 0.02em; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
          text-decoration: none;
        }
        .bld-btn-secondary:hover { 
          border-color: #8B7355; 
          background: #F5F0E8; 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .bld-btn-danger {
          background: #C4503C; color: white;
          border: none;
        }
        .bld-btn-danger:hover { background: #A33D2C; }

        .bld-section-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1E1C18;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bld-section-title svg {
          width: 24px;
          height: 24px;
          color: #8B7355;
        }

        .bld-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(139,115,85,0.2), transparent);
          margin: 24px 0;
        }

        .bld-feature-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #F9F9F7;
          border: 1px solid rgba(139,115,85,0.15);
          border-radius: 30px;
          font-size: 0.9rem;
          color: #1E1C18;
          transition: all 0.2s ease;
          cursor: default;
        }
        .bld-feature-chip:hover {
          background: #8B7355;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139,115,85,0.3);
        }
        .bld-feature-chip:hover svg {
          color: white;
        }

        .bld-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(139,115,85,0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .bld-progress-fill {
          height: 100%;
          background: #8B7355;
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1);
        }

        .bld-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .bld-modal {
          background: white;
          border-radius: 16px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%,100%{opacity:1}
          50%{opacity:0.4}
        }
      `}</style>

      {/* Image Modal */}
      {selectedImage && (
        <div className="bld-modal-image" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Project" />
        </div>
      )}

      {/* Header with Back Button */}
      <div style={{ padding: '30px 40px 0', maxWidth: 1400, margin: '0 auto' }}>
        <button
          onClick={() => navigate('/builder/dashboard?tab=projects')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}
        >
          <ArrowLeftIcon style={{ width: 16, height: 16, color: '#8B7355' }} />
          <span className="bld-sans" style={{ fontSize: '0.85rem', color: '#8B7355', fontWeight: 500 }}>
            Back to Dashboard
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 40px 60px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Hero Section */}
        <div className="bld-card" style={{ marginBottom: 24 }}>
          <div style={{ padding: '32px 36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div className="bld-sans" style={{ 
                  fontSize: '0.8rem', 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  color: '#8B7355', 
                  marginBottom: 12,
                  fontWeight: 600
                }}>
                  {project.projectType || 'Residential Project'}
                </div>
                
                <h1 className="bld-serif" style={{ 
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
                  fontWeight: 400, 
                  color: '#1E1C18', 
                  marginBottom: 16,
                  lineHeight: 1.2
                }}>
                  {project.name}
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ 
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    padding: '8px 20px',
                    borderRadius: 30,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusStyle.dot }} />
                    {project.status?.toUpperCase() || 'DRAFT'}
                  </span>
                  
                  <span className="bld-tag">
                    <CalendarIcon style={{ width: 14, height: 14 }} />
                    Created {formatDate(project.createdAt)}
                  </span>
                  
                  {project.reraNumber && (
                    <span className="bld-tag">
                      <DocumentTextIcon style={{ width: 14, height: 14 }} />
                      RERA: {project.reraNumber}
                    </span>
                  )}
                </div>

                {project.tagline && (
                  <p className="bld-sans" style={{ 
                    fontSize: '1.1rem', 
                    color: '#8B7355', 
                    fontStyle: 'italic',
                    marginTop: 8,
                    borderLeft: '3px solid #8B7355',
                    paddingLeft: 16
                  }}>
                    {project.tagline}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bld-btn-primary bld-btn-danger"
                >
                  <TrashIcon style={{ width: 16, height: 16 }} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bld-tab-bar">
          <button 
            className={`bld-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`bld-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details & Specs
          </button>
          <button 
            className={`bld-tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing
          </button>

          <button 
            className={`bld-tab ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: 20, 
              marginBottom: 24 
            }}>
              <div className="bld-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="bld-info-icon">
                    <CurrencyDollarIcon style={{ width: 20, height: 20 }} />
                  </div>
                  <div className="bld-sans" style={{ fontSize: '0.8rem', color: '#8B7355', fontWeight: 500 }}>Total Value</div>
                </div>
                <div className="bld-serif" style={{ fontSize: '2rem', fontWeight: 600, color: '#1E1C18', lineHeight: 1.2 }}>
                  {formatCurrency(project.price)}
                </div>
                {project.pricePerSqFt && (
                  <div className="bld-sans" style={{ fontSize: '0.85rem', color: '#6B6355', marginTop: 8 }}>
                    ₹{project.pricePerSqFt.toLocaleString()}/sq.ft
                  </div>
                )}
              </div>

              <div className="bld-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="bld-info-icon">
                    <Squares2X2Icon style={{ width: 20, height: 20 }} />
                  </div>
                  <div className="bld-sans" style={{ fontSize: '0.8rem', color: '#8B7355', fontWeight: 500 }}>Total Area</div>
                </div>
                <div className="bld-serif" style={{ fontSize: '2rem', fontWeight: 600, color: '#1E1C18' }}>
                  {project.area?.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>sq.ft</span>
                </div>
                {project.carpetArea && (
                  <div className="bld-sans" style={{ fontSize: '0.85rem', color: '#6B6355', marginTop: 8 }}>
                    Carpet: {project.carpetArea.toLocaleString()} sq.ft
                  </div>
                )}
              </div>

              <div className="bld-stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="bld-info-icon">
                    <HomeIcon style={{ width: 20, height: 20 }} />
                  </div>
                  <div className="bld-sans" style={{ fontSize: '0.8rem', color: '#8B7355', fontWeight: 500 }}>Configuration</div>
                </div>
                <div className="bld-serif" style={{ fontSize: '2rem', fontWeight: 600, color: '#1E1C18' }}>
                  {project.bedrooms || 0} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>BHK</span>
                </div>
                <div className="bld-sans" style={{ fontSize: '0.85rem', color: '#6B6355', marginTop: 8 }}>
                  {project.bathrooms || 0} Bath • {project.balconies || 0} Balcony
                </div>
              </div>

              {project.totalUnits > 0 && (
                <div className="bld-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div className="bld-info-icon">
                      <BuildingOfficeIcon style={{ width: 20, height: 20 }} />
                    </div>
                    <div className="bld-sans" style={{ fontSize: '0.8rem', color: '#8B7355', fontWeight: 500 }}>Units</div>
                  </div>
                  <div className="bld-serif" style={{ fontSize: '2rem', fontWeight: 600, color: '#1E1C18' }}>
                    {project.totalUnits}
                  </div>
                  {project.availableUnits > 0 && (
                    <div className="bld-sans" style={{ fontSize: '0.85rem', color: '#6B6355', marginTop: 8 }}>
                      {project.availableUnits} Available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Description */}
              <div className="bld-card">
                <div className="bld-card-header">
                  <h3 className="bld-section-title" style={{ margin: 0 }}>
                    <DocumentTextIcon />
                    About the Project
                  </h3>
                </div>
                <div className="bld-card-body">
                  <p className="bld-sans" style={{ 
                    fontSize: '1rem', 
                    color: '#2C2A26', 
                    lineHeight: 1.8,
                    marginBottom: 20
                  }}>
                    {project.description}
                  </p>
                  
                  {/* Location Details */}
                  <div style={{ background: '#F9F9F7', borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <MapPinIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
                      <span className="bld-sans" style={{ fontWeight: 600, color: '#1E1C18' }}>Location</span>
                    </div>
                    <p className="bld-sans" style={{ fontSize: '0.95rem', color: '#2C2A26', marginBottom: 8 }}>
                      {project.location}
                    </p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {project.city && <span className="bld-tag">{project.city}</span>}
                      {project.state && <span className="bld-tag">{project.state}</span>}
                      {project.pincode && <span className="bld-tag">{project.pincode}</span>}
                    </div>
                    {project.landmark && (
                      <p className="bld-sans" style={{ fontSize: '0.9rem', color: '#8B7355', marginTop: 12 }}>
                        Landmark: {project.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Team & Quick Info */}
              <div className="bld-card">
                <div className="bld-card-header">
                  <h3 className="bld-section-title" style={{ margin: 0 }}>
                    <UserGroupIcon />
                    Team & Info
                  </h3>
                </div>
                <div className="bld-card-body">
                  {/* Builder */}
                  <div className="bld-info-item" style={{ marginBottom: 16 }}>
                    <div className="bld-info-icon">
                      <FaUserCog />
                    </div>
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Builder</div>
                      <div className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18' }}>
                        {user?.name}
                      </div>
                    </div>
                  </div>

                  {/* Seller if assigned */}
                  {project.seller && (
                    <div className="bld-info-item" style={{ marginBottom: 16 }}>
                      <div className="bld-info-icon">
                        <FaUserTie />
                      </div>
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Assigned Seller</div>
                        <div className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18' }}>
                          {project.seller.name}
                        </div>
                        {project.seller.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <EnvelopeIcon style={{ width: 12, height: 12, color: '#8B7355' }} />
                            <span className="bld-sans" style={{ fontSize: '0.8rem', color: '#6B6355' }}>{project.seller.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bld-divider" />

                  {/* Quick Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {project.projectType && (
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Type</div>
                        <div className="bld-sans" style={{ fontSize: '0.95rem', fontWeight: 500 }}>{project.projectType}</div>
                      </div>
                    )}
                    {project.facing && (
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Facing</div>
                        <div className="bld-sans" style={{ fontSize: '0.95rem', fontWeight: 500 }}>{project.facing}</div>
                      </div>
                    )}
                    {project.totalTowers > 0 && (
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Towers</div>
                        <div className="bld-sans" style={{ fontSize: '0.95rem', fontWeight: 500 }}>{project.totalTowers}</div>
                      </div>
                    )}
                    {project.floorsPerTower > 0 && (
                      <div>
                        <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Floors</div>
                        <div className="bld-sans" style={{ fontSize: '0.95rem', fontWeight: 500 }}>{project.floorsPerTower}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="bld-card" style={{ marginBottom: 24 }}>
                <div className="bld-card-header">
                  <h3 className="bld-section-title" style={{ margin: 0 }}>
                    <SparklesIcon />
                    Features & Amenities
                  </h3>
                </div>
                <div className="bld-card-body">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {project.features.map((feature, index) => (
                      <span key={index} className="bld-feature-chip">
                        {getFeatureIcon(feature)}
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="bld-card">
            <div className="bld-card-header">
              <h3 className="bld-section-title" style={{ margin: 0 }}>
                <BuildingOfficeIcon />
                Detailed Specifications
              </h3>
            </div>
            <div className="bld-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                {/* Left Column */}
                <div>
                  <h4 className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#1E1C18' }}>
                    Unit Specifications
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="bld-info-item">
                      <FaBed className="bld-info-icon" />
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Bedrooms</span>
                        <span style={{ fontWeight: 600 }}>{project.bedrooms || 2}</span>
                      </div>
                    </div>
                    <div className="bld-info-item">
                      <FaBath className="bld-info-icon" />
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Bathrooms</span>
                        <span style={{ fontWeight: 600 }}>{project.bathrooms || 2}</span>
                      </div>
                    </div>
                    <div className="bld-info-item">
                      <MdBalcony className="bld-info-icon" />
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Balconies</span>
                        <span style={{ fontWeight: 600 }}>{project.balconies || 1}</span>
                      </div>
                    </div>
                    <div className="bld-info-item">
                      <FaRulerCombined className="bld-info-icon" />
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Area</span>
                        <span style={{ fontWeight: 600 }}>{project.area} sq.ft</span>
                      </div>
                    </div>
                    {project.carpetArea && (
                      <div className="bld-info-item">
                        <Squares2X2Icon className="bld-info-icon" />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Carpet Area</span>
                          <span style={{ fontWeight: 600 }}>{project.carpetArea} sq.ft</span>
                        </div>
                      </div>
                    )}
                    {project.superArea && (
                      <div className="bld-info-item">
                        <RectangleGroupIcon className="bld-info-icon" />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Super Area</span>
                          <span style={{ fontWeight: 600 }}>{project.superArea} sq.ft</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h4 className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#1E1C18' }}>
                    Dimensions & Construction
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {project.length && project.breadth && (
                      <div className="bld-info-item">
                        <ViewfinderCircleIcon className="bld-info-icon" />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Dimensions</span>
                          <span style={{ fontWeight: 600 }}>{project.length} x {project.breadth} ft</span>
                        </div>
                      </div>
                    )}
                    {project.ceilingHeight && (
                      <div className="bld-info-item">
                        <ArrowTrendingUpIcon className="bld-info-icon" />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Ceiling Height</span>
                          <span style={{ fontWeight: 600 }}>{project.ceilingHeight} ft</span>
                        </div>
                      </div>
                    )}
                    {project.constructionType && (
                      <div className="bld-info-item">
                        <MdOutlineConstruction className="bld-info-icon" />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Construction</span>
                          <span style={{ fontWeight: 600 }}>{project.constructionType}</span>
                        </div>
                      </div>
                    )}
                    {project.constructionQuality && (
                      <div className="bld-info-item">
                        <PaintBrushIcon className="bld-info-icon" />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Quality</span>
                          <span style={{ fontWeight: 600 }}>{project.constructionQuality}</span>
                        </div>
                      </div>
                    )}
                    {project.projectArchitect && (
                      <div className="bld-info-item">
                        <UserIcon className="bld-info-icon" />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Architect</span>
                          <span style={{ fontWeight: 600 }}>{project.projectArchitect}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {(project.launchDate || project.completionDate || project.handoverDate) && (
                <>
                  <div className="bld-divider" />
                  <h4 className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#1E1C18' }}>
                    Project Timeline
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {project.launchDate && (
                      <div className="bld-info-item">
                        <FaCalendarCheck className="bld-info-icon" />
                        <div>
                          <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Launch</div>
                          <div className="bld-sans" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{formatDate(project.launchDate)}</div>
                        </div>
                      </div>
                    )}
                    {project.completionDate && (
                      <div className="bld-info-item">
                        <FaClock className="bld-info-icon" />
                        <div>
                          <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Completion</div>
                          <div className="bld-sans" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{formatDate(project.completionDate)}</div>
                        </div>
                      </div>
                    )}
                    {project.handoverDate && (
                      <div className="bld-info-item">
                        <CheckCircleIcon className="bld-info-icon" />
                        <div>
                          <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Handover</div>
                          <div className="bld-sans" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{formatDate(project.handoverDate)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="bld-card">
            <div className="bld-card-header">
              <h3 className="bld-section-title" style={{ margin: 0 }}>
                <CurrencyDollarIcon />
                Pricing Breakdown
              </h3>
            </div>
            <div className="bld-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {project.basePrice && (
                  <div className="bld-info-item">
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Base Price</div>
                      <div className="bld-serif" style={{ fontSize: '1.3rem', fontWeight: 600 }}>{formatCurrency(project.basePrice)}</div>
                    </div>
                  </div>
                )}
                {project.parkingPrice && (
                  <div className="bld-info-item">
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Parking</div>
                      <div className="bld-serif" style={{ fontSize: '1.3rem', fontWeight: 600 }}>{formatCurrency(project.parkingPrice)}</div>
                    </div>
                  </div>
                )}
                {project.maintenance && (
                  <div className="bld-info-item">
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Maintenance</div>
                      <div className="bld-serif" style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                        {formatCurrency(project.maintenance)}<span style={{ fontSize: '0.8rem' }}>/{project.maintenanceFrequency}</span>
                      </div>
                    </div>
                  </div>
                )}
                {project.stampDuty && (
                  <div className="bld-info-item">
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Stamp Duty</div>
                      <div className="bld-serif" style={{ fontSize: '1.3rem', fontWeight: 600 }}>{formatCurrency(project.stampDuty)}</div>
                    </div>
                  </div>
                )}
                {project.registration && (
                  <div className="bld-info-item">
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Registration</div>
                      <div className="bld-serif" style={{ fontSize: '1.3rem', fontWeight: 600 }}>{formatCurrency(project.registration)}</div>
                    </div>
                  </div>
                )}
                {project.gst && (
                  <div className="bld-info-item">
                    <div>
                      <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>GST</div>
                      <div className="bld-serif" style={{ fontSize: '1.3rem', fontWeight: 600 }}>{project.gst}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="bld-divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="bld-sans" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total Price</span>
                <span className="bld-serif" style={{ fontSize: '2rem', fontWeight: 600, color: '#8B7355' }}>
                  {formatCurrency(project.price)}
                </span>
              </div>
            </div>
          </div>
        )}

      
        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="bld-card">
            <div className="bld-card-header">
              <h3 className="bld-section-title" style={{ margin: 0 }}>
                <DocumentIcon />
                Project Gallery
              </h3>
            </div>
            <div className="bld-card-body">


{project.images && project.images.length > 0 ? (
  <div className="bld-image-gallery">
    {project.images.map((img, index) => {
      const imageUrl = typeof img === 'string' ? img : img.url;
      const fullImageUrl = getImageUrl(imageUrl);
      
      // Optional: Log only once for debugging
      if (index === 0) {
        console.log("✅ Image URLs are working:", fullImageUrl);
      }

      return (
        <div 
          key={index} 
          className="bld-gallery-item"
          onClick={() => setSelectedImage(fullImageUrl)}
        >
          <img 
            src={fullImageUrl} 
            alt={`Project ${index + 1}`}
            onError={(e) => {
              e.target.onerror = null;
              // Simple fallback without error logging
              const svg = `
                <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="200" fill="#F5F0E8" stroke="#8B7355" stroke-width="2"/>
                  <text x="150" y="100" font-family="DM Sans, sans-serif" font-size="48" text-anchor="middle" fill="#8B7355">🏗️</text>
                  <text x="150" y="140" font-family="DM Sans, sans-serif" font-size="14" text-anchor="middle" fill="#5D4A36">Image not available</text>
                </svg>
              `;
              e.target.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
            }}
          />
        </div>
      );
    })}
  </div>
) : (
  <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B7355' }}>
    <DocumentIcon style={{ width: 60, height: 60, margin: '0 auto 16px', opacity: 0.3 }} />
    <p>No images uploaded yet</p>
  </div>
)}

              {/* Additional Media Links */}
              {(project.videoUrl || project.brochureUrl || project.virtualTourUrl) && (
                <>
                  <div className="bld-divider" />
                  <h4 className="bld-sans" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Media Links</h4>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {project.videoUrl && (
                      <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="bld-tag">
                        <FaVideo /> Video Tour
                      </a>
                    )}
                    {project.brochureUrl && (
                      <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer" className="bld-tag">
                        <DocumentTextIcon /> Brochure
                      </a>
                    )}
                    {project.virtualTourUrl && (
                      <a href={project.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="bld-tag">
                        <CursorArrowRaysIcon /> Virtual Tour
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="bld-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="bld-modal" onClick={e => e.stopPropagation()} style={{ borderRadius: 16 }}>
            <div style={{ padding: 24 }}>
              <h3 className="bld-serif" style={{ fontSize: '1.8rem', fontWeight: 400, color: '#1E1C18', marginBottom: 12 }}>
                Delete <em style={{ fontStyle: 'italic', color: '#C4503C' }}>Project</em>
              </h3>
              <p className="bld-sans" style={{ color: '#1E1C18', marginBottom: 16 }}>
                Are you sure you want to delete <strong>{project.name}</strong>?
              </p>
              <p className="bld-sans" style={{ color: '#C4503C', fontSize: '0.85rem', marginBottom: 24 }}>
                This action cannot be undone. All project data will be permanently removed.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bld-btn-secondary"
                  style={{ padding: '10px 24px' }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bld-btn-primary bld-btn-danger"
                  style={{ padding: '10px 24px', opacity: deleting ? 0.7 : 1 }}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
