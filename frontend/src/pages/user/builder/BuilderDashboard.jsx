import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../../api/axios";
import ChatInterface from "../../../components/Chat/ChatInterface";
import Expenses from "./Expenses";
import Tracking from "./Tracking";
import {
  ViewColumnsIcon, BriefcaseIcon, CurrencyDollarIcon, MapPinIcon,
  DocumentPlusIcon, ChatBubbleLeftRightIcon, ArrowUpIcon, ArrowDownIcon,
  ChevronRightIcon, CalendarIcon, ClockIcon, CheckCircleIcon,
  BuildingOfficeIcon, WrenchScrewdriverIcon, UserGroupIcon,
  XMarkIcon, PhoneIcon, EnvelopeIcon
} from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { FaUserTie } from "react-icons/fa";
import toast from "react-hot-toast";
import {  FaBed } from "react-icons/fa";

export default function BuilderDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [chats, setChats] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState({ projects: true, expenses: true, tracking: true, chats: true, sellers: false });
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:5050${imagePath}`;
    return `http://localhost:5050/${imagePath}`;
  };

  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
        setActiveTab('chats');
      }
    }
  }, [searchParams, chats]);

  useEffect(() => {




// In BuilderDashboard.jsx - Replace the fetchProjects function
const fetchProjects = async () => {
  try {
    setLoading(p => ({ ...p, projects: true }));
    // Use the correct endpoint for builder's own projects
    const { data } = await API.get('/builder/my');
    console.log("Projects response:", data);
    
    if (data.projects) {
      setProjects(data.projects);
    } else if (Array.isArray(data)) {
      setProjects(data);
    } else {
      setProjects([]);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    toast.error(error.response?.data?.message || "Failed to load projects");
    setProjects([]);
  } finally {
    setLoading(p => ({ ...p, projects: false }));
  }
};

    const fetchExpenses = async () => {
      setExpenses([]);
      setLoading(p => ({ ...p, expenses: false }));
    };

    const fetchTracking = async () => {
      setTracking([]);
      setLoading(p => ({ ...p, tracking: false }));
    };

    fetchProjects();
    fetchExpenses();
    fetchTracking();
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(p => ({ ...p, chats: true }));
      const { data } = await API.get('/chats');
      if (data.success) {
        setChats(data.chats || []);
        setUnreadCount(data.totalUnread || 0);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(p => ({ ...p, chats: false }));
    }
  };

  const fetchSellers = async () => {
    setLoading(p => ({ ...p, sellers: true }));
    try {
      const { data } = await API.get('/users/sellers');
      if (data.success) {
        setSellers(data.sellers || []);
      } else {
        setSellers([]);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to load sellers");
    } finally {
      setLoading(p => ({ ...p, sellers: false }));
    }
  };

  const handleOpenSellerModal = () => {
    fetchSellers();
    setShowSellerModal(true);
    setSearchTerm("");
  };



const handleDeleteProject = async () => {
  if (!projectToDelete) return;
  
  try {
    setDeletingProject(true);
    await API.delete(`/builder/${projectToDelete._id}`);
    
    setProjects(projects.filter(p => p._id !== projectToDelete._id));
    toast.success('Project deleted successfully');
    setShowDeleteModal(false);
    setProjectToDelete(null);
  } catch (error) {
    console.error("Error deleting project:", error);
    toast.error(error.response?.data?.message || "Failed to delete project");
  } finally {
    setDeletingProject(false);
  }
};

  const handleStartChatWithSeller = async (sellerId, sellerName) => {
    try {
      setLoading(p => ({ ...p, chats: true }));
      
      const response = await API.post('/chats', {
        otherUserId: sellerId
      });

      if (response.data.success) {
        toast.success(`Chat started with ${sellerName}`);
        setShowSellerModal(false);
        
        await fetchChats();
        const newChat = response.data.chat;
        setSelectedChat(newChat);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error(error.response?.data?.message || "Failed to start chat");
    } finally {
      setLoading(p => ({ ...p, chats: false }));
    }
  };

  const handleDeleteChat = (deletedChatId) => {
  setChats(prevChats => prevChats.filter(chat => chat._id !== deletedChatId));
  setSelectedChat(null);
  toast.success("Chat removed from list");
};

  useEffect(() => {
    let interval;
    
    const refreshChats = async () => {
      if (activeTab === 'chats' && !selectedChat) {
        try {
          const { data } = await API.get('/chats');
          if (data.success) {
            setChats(data.chats || []);
            setUnreadCount(data.totalUnread || 0);
          }
        } catch (error) {
          console.error("Error refreshing chats:", error);
        }
      }
    };

    if (activeTab === 'chats') {
      refreshChats();
      interval = setInterval(refreshChats, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, selectedChat]);

  const formatCurrency = (n) => {
    if (!n) return "₹0";
    if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} Lac`;
    return `₹ ${n.toLocaleString('en-IN')}`;
  };

  const formatDate = (s) => {
    if (!s) return "—";
    const d = Math.ceil(Math.abs(new Date() - new Date(s)) / 86400000);
    if (d === 0) return "Today";
    if (d === 1) return "Yesterday";
    if (d < 7) return `${d} days ago`;
    return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);



  const menuItems = [
  { id: "overview", name: "Overview", Icon: ViewColumnsIcon, count: null },
  { id: "projects", name: "Projects", Icon: BriefcaseIcon, count: projects.length },
  { id: "expenses", name: "Expenses", Icon: CurrencyDollarIcon, count: expenses.length },
  { id: "tracking", name: "Tracking", Icon: MapPinIcon, count: tracking.length },
  { id: "new", name: "New Project", Icon: DocumentPlusIcon, highlight: true },
  { id: "chats", name: "Chat Box", Icon: ChatBubbleLeftRightIcon, count: unreadCount },
];

  const statCards = [
    {
      label: "Total Projects",
      value: projects.length,
      Icon: BriefcaseIcon,
      trend: `+${projects.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month`
    },
    {
      label: "Ongoing Projects",
      value: projects.filter(p => p.status === "ongoing").length,
      Icon: WrenchScrewdriverIcon,
      trend: `${projects.filter(p => p.status === "ongoing").length} in progress`
    },
    {
      label: "Completed Projects",
      value: projects.filter(p => p.status === "completed").length,
      Icon: CheckCircleIcon,
      trend: "Ready for handover"
    },
  ];

  const Skeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: '#F5F0E8', borderRadius: 2, padding: 20, display: 'flex', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: '#EDE8DC', borderRadius: 2, flexShrink: 0, animation: 'bld-pulse 1.4s ease infinite' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 12, background: '#EDE8DC', borderRadius: 2, width: '40%', animation: 'bld-pulse 1.4s ease infinite' }} />
            <div style={{ height: 10, background: '#EDE8DC', borderRadius: 2, width: '60%', animation: 'bld-pulse 1.4s ease infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const filteredSellers = sellers.filter(seller =>
    seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .bld-sans  { font-family: 'DM Sans', sans-serif; }
        .bld-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .bld-nav-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border: none; background: transparent;
          border-radius: 2px; cursor: pointer; text-align: left;
          transition: background 0.2s ease;
        }
        .bld-nav-item:hover { background: rgba(139,115,85,0.06); }
        .bld-nav-item.active { background: #1E1C18; }
        .bld-nav-item.highlight { background: #1E1C18; }
        .bld-nav-item.highlight:hover { background: #2C2A26; }

        .bld-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1E1C18; color: #F5F0E8;
          border: none; padding: 10px 22px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
          cursor: pointer; transition: background 0.25s ease, letter-spacing 0.25s ease;
          text-decoration: none;
        }
        .bld-btn-primary:hover { background: #2C2A26; letter-spacing: 0.16em; }

        .bld-ghost-link {
          font-family: 'DM Sans', sans-serif; font-size: 0.68rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          color: #8B7355; background: none; border: none; cursor: pointer;
          text-decoration: underline; text-underline-offset: 3px; transition: color 0.2s ease;
        }
        .bld-ghost-link:hover { color: #1E1C18; }

        .bld-stat-card {
          background: white; border: 1px solid rgba(139,115,85,0.12);
          border-radius: 2px; padding: 22px 24px;
          transition: box-shadow 0.25s ease;
        }
        .bld-stat-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.07); }

        .bld-project-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border: 1px solid rgba(139,115,85,0.1);
          border-radius: 2px; text-decoration: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          background: white;
        }
        .bld-project-row:hover { border-color: rgba(139,115,85,0.35); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .bld-list-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border: 1px solid rgba(139,115,85,0.1);
          border-radius: 2px; background: white;
          transition: border-color 0.25s ease;
        }
        .bld-list-row:hover { border-color: rgba(139,115,85,0.3); }

        .bld-chat-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px; border: 1px solid rgba(139,115,85,0.1);
          border-radius: 2px; background: white; cursor: pointer;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .bld-chat-row:hover { border-color: rgba(139,115,85,0.35); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .bld-progress-bar {
          width: 100%; height: 3px; background: rgba(139,115,85,0.15);
          border-radius: 2px; overflow: hidden;
        }
        .bld-progress-fill {
          height: 100%; border-radius: 2px;
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
          border-radius: 2px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease;
        }

        .bld-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(139,115,85,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bld-modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          max-height: calc(80vh - 120px);
        }

        .bld-seller-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid rgba(139,115,85,0.1);
          border-radius: 2px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .bld-seller-item:hover {
          border-color: rgba(139,115,85,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .bld-search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .bld-search-input:focus {
          outline: none;
          border-color: #8B7355;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bld-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: 256, background: 'white', borderRight: '1px solid rgba(139,115,85,0.12)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(139,115,85,0.1)' }}>
            <div className="bld-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>Builder Panel</div>
            <h1 className="bld-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em' }}>
              Builder <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Hub</em>
            </h1>
          </div>

          <nav style={{ padding: '12px 12px', flex: 1 }}>
            {menuItems.map(({ id, name, Icon, count, highlight }) => (
              <button
                key={id}
                className={`bld-nav-item ${highlight ? 'highlight' : activeTab === id ? 'active' : ''}`}
                onClick={() => {
                  if (id === 'new') {
                    navigate("/builder/add-project");
                  } else {
                    setActiveTab(id);
                  }
                }}
              >
                <div style={{ width: 30, height: 30, border: `1px solid ${(activeTab === id || highlight) ? 'rgba(196,169,122,0.3)' : 'rgba(139,115,85,0.2)'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 13, height: 13, color: (activeTab === id || highlight) ? '#C4A97A' : '#8B7355' }} />
                </div>
                <span className="bld-sans" style={{ fontSize: '0.82rem', fontWeight: 500, color: (activeTab === id || highlight) ? '#F5F0E8' : '#2C2A26', flex: 1 }}>{name}</span>
                {count > 0 && !highlight && (
                  <span className="bld-sans" style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.08em', background: 'rgba(139,115,85,0.15)', color: activeTab === id ? '#C4A97A' : '#8B7355', padding: '2px 7px', borderRadius: 2 }}>
                    {count}
                  </span>
                )}
                <ChevronRightIcon style={{ width: 12, height: 12, color: (activeTab === id || highlight) ? '#C4A97A' : '#C4B9A8', flexShrink: 0 }} />
              </button>
            ))}
          </nav>

          {/* Portfolio strip */}
          <div style={{ margin: '0 12px 16px', background: '#1E1C18', borderRadius: 2, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, border: '1px solid rgba(196,169,122,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div className="bld-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Portfolio Value</div>
            <div className="bld-serif" style={{ fontSize: '1.4rem', fontWeight: 500, color: '#C4A97A', lineHeight: 1 }}>
              {formatCurrency(projects.reduce((sum, p) => sum + (p.price || 0), 0))}
            </div>
            <div className="bld-sans" style={{ fontSize: '0.68rem', color: '#6B6355', marginTop: 5, fontWeight: 300 }}>
              {projects.length} projects
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '36px 40px 60px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Welcome back</div>
                <h2 className="bld-serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 300, color: '#1E1C18', letterSpacing: '-0.02em' }}>
                  {user?.name || 'Builder'}<em style={{ fontStyle: 'italic', color: '#8B7355' }}>.</em>
                </h2>
              </div>
              <button className="bld-btn-primary" onClick={() => navigate("/builder/add-project")}>
                <DocumentPlusIcon style={{ width: 14, height: 14 }} /> New Project
              </button>
            </div>

            {/* Stat cards for projects tab */}
            {activeTab === 'projects' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                {statCards.map(({ label, value, Icon, trend }, i) => (
                  <div key={i} className="bld-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>{label}</div>
                      <div style={{ width: 30, height: 30, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 13, height: 13, color: '#8B7355' }} />
                      </div>
                    </div>
                    <div className="bld-serif" style={{ fontSize: '3rem', fontWeight: 400, color: '#1E1C18', lineHeight: 1, marginBottom: 8 }}>{value}</div>
                    <div className="bld-sans" style={{ fontSize: '0.68rem', color: '#8B7355', fontWeight: 300 }}>{trend}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>Recent Projects</div>
                  <button className="bld-ghost-link" onClick={() => {}}>View All</button>
                </div>

                {loading.projects ? <Skeleton /> : projects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          

{projects.slice(0, 5).map(p => (
  <div key={p._id} className="bld-project-row" style={{ position: 'relative' }}>
    <div 
      onClick={() => navigate(`/builder/project/${p._id}`)} 
      style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, cursor: 'pointer' }}
    >

      {/* Project Image with fallback */}
<div style={{ 
  width: 50, 
  height: 50, 
  borderRadius: 2,
  overflow: 'hidden',
  flexShrink: 0,
  border: '1px solid rgba(139,115,85,0.2)',
  background: '#F5F0E8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  {p.images && p.images.length > 0 ? (

<img 
  src={`${API.defaults.baseURL || 'http://localhost:5050'}${p.images[0]}`}
  alt={p.name}
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  onError={(e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    e.target.parentNode.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B7355" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5" fill="#8B7355"/><polyline points="21 15 16 10 5 21"></polyline></svg>';
  }}
/>
  ) : (
    <BuildingOfficeIcon style={{ width: 24, height: 24, color: '#8B7355' }} />
  )}
</div>

      {/* Project Info */}
      <div style={{ flex: 1 }}>
        <div className="bld-sans" style={{ 
          fontSize: '0.95rem', 
          fontWeight: 600, 
          color: '#1E1C18',
          marginBottom: 2
        }}>
          {p.name || 'Untitled Project'}
        </div>
        
        {/* Location & Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
          {p.location && (
            <div className="bld-sans" style={{ 
              fontSize: '0.7rem', 
              color: '#8B7355',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}>
              <MapPinIcon style={{ width: 10, height: 10 }} />
              {p.location}
            </div>
          )}
          {p.area && (
            <div className="bld-sans" style={{ 
              fontSize: '0.7rem', 
              color: '#8B7355',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}>
              <BuildingOfficeIcon style={{ width: 10, height: 10 }} />
              {p.area} sq.ft
            </div>
          )}
          {p.bedrooms && (
            <div className="bld-sans" style={{ 
              fontSize: '0.7rem', 
              color: '#8B7355',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}>
              <FaBed style={{ fontSize: '0.6rem' }} />
              {p.bedrooms} BHK
            </div>
          )}
        </div>

        {/* Date */}
        <div className="bld-sans" style={{ 
          fontSize: '0.65rem', 
          color: '#A89880', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4,
          fontWeight: 300 
        }}>
          <CalendarIcon style={{ width: 10, height: 10 }} /> 
          {p.createdAt ? formatDate(p.createdAt) : 'Recently added'}
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* Price & Status */}
      <div style={{ textAlign: 'right' }}>
        <div className="bld-serif" style={{ 
          fontSize: '1.1rem', 
          fontWeight: 500, 
          color: '#1E1C18' 
        }}>
          {formatCurrency(p.price)}
        </div>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6
        }}>
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: p.status === 'ongoing' ? '#C4A97A' : 
                           p.status === 'completed' ? '#2E7D32' : 
                           p.status === 'upcoming' ? '#4A90E2' : '#8B7355'
          }} />
          <span className="bld-sans" style={{ 
            fontSize: '0.6rem', 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase', 
            color: '#8B7355' 
          }}>
            {p.status || 'Draft'}
          </span>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setProjectToDelete(p);
          setShowDeleteModal(true);
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          borderRadius: '2px',
          color: '#C4503C',
          opacity: 0.6,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
        title="Delete project"
      >
        <TrashIcon style={{ width: 18, height: 18 }} />
      </button>
    </div>
  </div>
))}

{/* Add this Delete Confirmation Modal before the closing div of the component */}
{showDeleteModal && (
  <div className="bld-modal-overlay" onClick={() => setShowDeleteModal(false)}>
    <div className="bld-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
      <div className="bld-modal-header">
        <div>
          <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>
            Confirm Delete
          </div>
          <h3 className="bld-serif" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#1E1C18' }}>
            Delete <em style={{ fontStyle: 'italic', color: '#C4503C' }}>Project</em>
          </h3>
        </div>
        <button
          onClick={() => setShowDeleteModal(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
        </button>
      </div>

      <div className="bld-modal-body" style={{ padding: '24px' }}>
        <p className="bld-sans" style={{ color: '#1E1C18', marginBottom: 16 }}>
          Are you sure you want to delete <strong>{projectToDelete?.name || projectToDelete?.title}</strong>?
        </p>
        <p className="bld-sans" style={{ color: '#C4503C', fontSize: '0.8rem', marginBottom: 24 }}>
          This action cannot be undone. All project data will be permanently removed.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="bld-ghost-link"
            style={{ padding: '10px 20px', textDecoration: 'none' }}
            disabled={deletingProject}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteProject}
            className="bld-btn-primary"
            style={{ 
              background: '#C4503C',
              opacity: deletingProject ? 0.7 : 1,
              cursor: deletingProject ? 'not-allowed' : 'pointer'
            }}
            disabled={deletingProject}
          >
            {deletingProject ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p className="bld-sans" style={{ color: '#8B7355' }}>No projects yet</p>
                    <button className="bld-btn-primary" onClick={() => navigate("/builder/add-project")} style={{ marginTop: 16 }}>
                      Create Your First Project
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Overview Tab */}
{activeTab === 'overview' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    {/* Welcome Section */}
    <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '28px 32px' }}>
      <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
        Dashboard Overview
      </div>
      <h2 className="bld-serif" style={{ fontSize: '1.8rem', fontWeight: 300, color: '#1E1C18', marginBottom: 16 }}>
        Welcome back, <em style={{ fontStyle: 'italic', color: '#8B7355' }}>{user?.name?.split(' ')[0] || 'Builder'}</em>
      </h2>
      <p className="bld-sans" style={{ color: '#6B6355', fontSize: '0.9rem', maxWidth: '80%' }}>
        Track your construction projects, manage expenses, and connect with sellers all in one place.
      </p>
    </div>

    {/* Stats Row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {statCards.map(({ label, value, Icon, trend }, i) => (
        <div key={i} className="bld-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>{label}</div>
            <div style={{ width: 30, height: 30, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon style={{ width: 13, height: 13, color: '#8B7355' }} />
            </div>
          </div>
          <div className="bld-serif" style={{ fontSize: '3rem', fontWeight: 400, color: '#1E1C18', lineHeight: 1, marginBottom: 8 }}>{value}</div>
          <div className="bld-sans" style={{ fontSize: '0.68rem', color: '#8B7355', fontWeight: 300 }}>{trend}</div>
        </div>
      ))}
    </div>

    {/* Quick Actions */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '24px' }}>
        <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880', marginBottom: 16 }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            onClick={() => navigate("/builder/add-project")}
            className="bld-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <DocumentPlusIcon style={{ width: 14, height: 14 }} />
            Create New Project
          </button>
          <button 
            onClick={handleOpenSellerModal}
            className="bld-btn-primary"
            style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: '#1E1C18', border: '1px solid rgba(139,115,85,0.3)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F5F0E8'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <UserGroupIcon style={{ width: 14, height: 14 }} />
            Contact Sellers
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '24px' }}>
        <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880', marginBottom: 16 }}>
          Recent Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.slice(0, 3).map(p => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(139,115,85,0.05)' }}>
              <div style={{ width: 32, height: 32, background: '#F5F0E8', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BriefcaseIcon style={{ width: 14, height: 14, color: '#8B7355' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="bld-sans" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1E1C18' }}>
                  {p.name || 'Untitled Project'}
                </div>
                <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#A89880' }}>
                  {p.status === 'ongoing' ? '🟡 Ongoing' : p.status === 'completed' ? '✅ Completed' : '📋 Draft'}
                </div>
              </div>
              <div className="bld-sans" style={{ fontSize: '0.65rem', color: '#8B7355' }}>
                {formatCurrency(p.price)}
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="bld-sans" style={{ textAlign: 'center', padding: '20px', color: '#A89880' }}>
              No projects yet. Create your first project to get started!
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Unread Messages Preview */}
    {unreadCount > 0 && (
      <div style={{ background: '#F5F0E8', border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#C4503C', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChatBubbleLeftRightIcon style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="bld-sans" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1C18' }}>
              {unreadCount} Unread Message{unreadCount !== 1 ? 's' : ''}
            </div>
            <div className="bld-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>
              You have new messages from sellers
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('chats')}
            className="bld-ghost-link"
            style={{ fontSize: '0.7rem' }}
          >
            View Messages →
          </button>
        </div>
      </div>
    )}
  </div>
)}

            {/* Expenses Tab (Placeholder) */}
            {activeTab === 'expenses' && (
              <Expenses />
             )}

            {/* Tracking Tab (Placeholder) */}
           {activeTab === 'tracking' && (
            <Tracking />
             )}

            {/* Chats Tab with Contact Seller Button */}
            {activeTab === 'chats' && (
              selectedChat ? (
                <ChatInterface
                  chatId={selectedChat._id}
                  project={selectedChat.project}
                  onClose={() => {
                    setSelectedChat(null);
                    setTimeout(() => {
                      if (activeTab === 'chats') {
                        API.get('/chats').then(({ data }) => {
                          if (data.success) {
                            setChats(data.chats || []);
                            setUnreadCount(data.totalUnread || 0);
                          }
                        });
                      }
                    }, 500);
                  }}
                  onDelete={handleDeleteChat}

                />
              ) : (
                <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>
                      Conversations with Sellers
                    </div>
                    <button
                      onClick={handleOpenSellerModal}
                      className="bld-btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.7rem' }}
                    >
                      <UserGroupIcon style={{ width: 14, height: 14 }} />
                      Contact Seller
                    </button>
                  </div>

                  {loading.chats ? <Skeleton /> : chats.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {chats.map(chat => {
                        const seller = chat.participants?.find(p => p._id !== user?._id);
                        const lastMessage = chat.lastMessage;
                        const unreadCount = chat.unreadCount || 0;
                        const chatTopic = chat.project?.name || chat.property?.title || 'General Discussion';

                        return (
                          <div
                            key={chat._id}
                            className="bld-chat-row"
                            onClick={() => setSelectedChat(chat)}
                          >
                            {/* Seller Avatar - UPDATED */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                border: '1px solid rgba(139,115,85,0.2)',
                                background: '#F5F0E8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}>
                                {seller?.profilePic ? (
                                  <img 
                                    src={getImageUrl(seller.profilePic)} 
                                    alt={seller?.name || 'Seller'} 
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover' 
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      e.target.parentNode.innerHTML = '<span class="bld-serif" style="font-size: 1.2rem; font-weight: 500; color: #8B7355;">' + 
                                        (seller?.name?.charAt(0) || 'S') + '</span>';
                                    }}
                                  />
                                ) : (
                                  <span className="bld-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#8B7355' }}>
                                    {seller?.name?.charAt(0) || 'S'}
                                  </span>
                                )}
                              </div>
                              {unreadCount > 0 && (
                                <div style={{
                                  position: 'absolute',
                                  top: -4,
                                  right: -4,
                                  minWidth: 18,
                                  height: 18,
                                  borderRadius: 9,
                                  background: '#C4503C',
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 5px',
                                  border: '2px solid white'
                                }}>
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                              )}
                            </div>

                            {/* Chat Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                <span className="bld-sans" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1C18' }}>
                                  {seller?.name || 'Seller'}
                                </span>
                                <span className="bld-sans" style={{ fontSize: '0.65rem', color: '#A89880', fontWeight: 300 }}>
                                  {chat.lastMessageAt ? formatDate(chat.lastMessageAt) : ''}
                                </span>
                              </div>

                              {/* Chat Topic */}
                              <div className="bld-sans" style={{
                                fontSize: '0.75rem',
                                color: '#8B7355',
                                marginBottom: 4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <BuildingOfficeIcon style={{ width: 12, height: 12 }} />
                                {chatTopic}
                              </div>

                              {/* Last Message Preview */}
                              {lastMessage && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {lastMessage.sender === user?._id && (
                                    <span style={{ fontSize: '0.7rem', color: '#A89880' }}>You:</span>
                                  )}
                                  <div className="bld-sans" style={{
                                    fontSize: '0.78rem',
                                    color: '#6B6355',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 300,
                                    flex: 1
                                  }}>
                                    {lastMessage.content || 'No messages yet'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <ChatBubbleLeftRightIcon style={{ width: 40, height: 40, color: '#C4A97A', opacity: 0.4, margin: '0 auto 12px' }} />
                      <p className="bld-sans" style={{ color: '#8B7355', fontSize: '0.875rem', marginBottom: 8 }}>
                        No conversations yet
                      </p>
                      <p className="bld-sans" style={{ color: '#A89880', fontSize: '0.75rem', marginBottom: 16 }}>
                        Click "Contact Seller" to start a conversation
                      </p>
                      <button
                        onClick={handleOpenSellerModal}
                        className="bld-btn-primary"
                      >
                        <UserGroupIcon style={{ width: 14, height: 14 }} />
                        Find Sellers to Connect
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* Seller Modal */}
      {showSellerModal && (
        <div className="bld-modal-overlay" onClick={() => setShowSellerModal(false)}>
          <div className="bld-modal" onClick={e => e.stopPropagation()}>
            <div className="bld-modal-header">
              <div>
                <div className="bld-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>
                  Connect with Sellers
                </div>
                <h3 className="bld-serif" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#1E1C18' }}>
                  Available <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Sellers</em>
                </h3>
              </div>
              <button
                onClick={() => setShowSellerModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>

            <div className="bld-modal-body">
              {/* Search */}
              <input
                type="text"
                placeholder="Search sellers by name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bld-search-input"
              />

              {/* Sellers List */}
              {loading.sellers ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
                  <p className="bld-sans" style={{ color: '#8B7355', marginTop: 12 }}>Loading sellers...</p>
                </div>
              ) : filteredSellers.length > 0 ? (
                filteredSellers.map(seller => (
                  <div key={seller._id} className="bld-seller-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Avatar - UPDATED */}
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: '#F5F0E8',
                        border: '1px solid rgba(139,115,85,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {seller.profilePic ? (
                          <img 
                            src={getImageUrl(seller.profilePic)} 
                            alt={seller.name} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B7355" stroke-width="1.5"><circle cx="12" cy="8" r="4" stroke="currentColor"/><path d="M5 20v-2a7 7 0 0 1 14 0v2" stroke="currentColor"/></svg>';
                            }}
                          />
                        ) : (
                          <FaUserTie style={{ color: '#8B7355', fontSize: '1.2rem' }} />
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <h4 className="bld-sans" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E1C18', marginBottom: 2 }}>
                          {seller.name}
                        </h4>
                        {seller.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <EnvelopeIcon style={{ width: 10, height: 10, color: '#8B7355' }} />
                            <span className="bld-sans" style={{ fontSize: '0.7rem', color: '#6B6355' }}>{seller.email}</span>
                          </div>
                        )}
                        {seller.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPinIcon style={{ width: 10, height: 10, color: '#8B7355' }} />
                            <span className="bld-sans" style={{ fontSize: '0.7rem', color: '#6B6355' }}>{seller.city}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Button */}
                    <button
                      onClick={() => handleStartChatWithSeller(seller._id, seller.name)}
                      className="bld-btn-primary"
                      style={{ padding: '8px 16px' }}
                    >
                      <ChatBubbleLeftRightIcon style={{ width: 12, height: 12 }} />
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <UserGroupIcon style={{ width: 40, height: 40, color: '#C4A97A', opacity: 0.4, margin: '0 auto 12px' }} />
                  <p className="bld-sans" style={{ color: '#8B7355' }}>
                    {searchTerm ? 'No sellers match your search' : 'No sellers registered yet'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bld-ghost-link"
                      style={{ marginTop: 12 }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}