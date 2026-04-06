import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../../api/axios";
import ChatInterface from "../../../components/Chat/ChatInterface";
import toast from "react-hot-toast";

import {
  BriefcaseIcon, DocumentPlusIcon, DocumentTextIcon,
  EnvelopeIcon, ChatBubbleLeftRightIcon, ChevronRightIcon, MapPinIcon,
  ArrowUpRightIcon, EyeIcon, ClockIcon, PencilIcon, TrashIcon,
  PaperAirplaneIcon, HomeIcon, BuildingOfficeIcon, UserGroupIcon,
  XMarkIcon, CalendarIcon, CheckCircleIcon, PhoneIcon,
  ExclamationTriangleIcon, ViewColumnsIcon, ChartBarIcon
} from "@heroicons/react/24/outline";
import { FaBed, FaUserTie, FaBath } from "react-icons/fa";

export default function SellerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State declarations
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState({ properties: true, enquiries: true, chats: true });
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [responding, setResponding] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [responseText, setResponseText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [builderPropertiesList, setBuilderPropertiesList] = useState([]);
  const [loadingBuilderPropertiesList, setLoadingBuilderPropertiesList] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");


  // Builder Projects State
  const [builderProjects, setBuilderProjects] = useState([]);
  const [loadingBuilderProjects, setLoadingBuilderProjects] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [builders, setBuilders] = useState([]);
  const [loadingBuilders, setLoadingBuilders] = useState(false);

  const filteredBuilders = builders.filter(builder =>
    builder.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    builder.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    builder.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch functions
  const fetchBuilderProjects = async () => {
    try {
      setLoadingBuilderProjects(true);
      let projectsData = [];
      let success = false;
      
      const endpoints = ['/builder/all', '/builder/projects/all', '/projects/all', '/builder/public'];
      
      for (const endpoint of endpoints) {
        try {
          const { data } = await API.get(endpoint);
          if (data.success && data.projects) {
            projectsData = data.projects;
            success = true;
            break;
          } else if (Array.isArray(data)) {
            projectsData = data;
            success = true;
            break;
          } else if (data.projects) {
            projectsData = data.projects;
            success = true;
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
        }
      }
      
      if (!success) throw new Error("No working endpoint found");
      
      setBuilderProjects(projectsData);
      const uniqueBuilders = {};
      projectsData.forEach(project => {
        if (project.builder && project.builder._id) {
          uniqueBuilders[project.builder._id] = project.builder;
        }
      });
      setBuilders(Object.values(uniqueBuilders));
      
    } catch (error) {
      console.error("Error fetching builder projects:", error);
      toast.error("Failed to load builder projects");
      setBuilderProjects([]);
      setBuilders([]);
    } finally {
      setLoadingBuilderProjects(false);
    }
  };

  


const fetchBuilderPropertiesList = async () => {
  try {
    setLoadingBuilderPropertiesList(true);
    const { data } = await API.get('/seller/builder/properties');
    setBuilderPropertiesList(data);
  } catch (error) {
    console.error("Error fetching builder properties:", error);
    toast.error("Failed to load builder properties");
    setBuilderPropertiesList([]);
  } finally {
    setLoadingBuilderPropertiesList(false);
  }
};


  const handlePurchaseRequest = async (propertyId, propertyTitle) => {
    if (!user) {
      toast.error("Please login");
      return;
    }
    
    setSendingRequest(true);
    try {
      const response = await API.post('/purchase-requests', {
        propertyId,
        message: `I'm interested in purchasing "${propertyTitle}". Please consider my request.`
      });
      
      if (response.data.success) {
        toast.success("Purchase request sent to builder! You'll be notified when they respond.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  const fetchBuilders = async () => {
    setLoadingBuilders(true);
    try {
      const { data } = await API.get('/users/builders');
      if (data.success) {
        setBuilders(data.builders || []);
      } else if (Array.isArray(data)) {
        setBuilders(data);
      } else {
        setBuilders([]);
      }
    } catch (error) {
      console.error("Error fetching builders:", error);
      toast.error("Failed to load builders");
      setBuilders([]);
    } finally {
      setLoadingBuilders(false);
    }
  };

  const handleStartChatWithBuilder = async (builderId, builderName, project = null) => {
    if (!builderId) {
      toast.error("Builder information not available");
      return;
    }
    
    try {
      setLoadingBuilderProjects(true);
      const payload = { otherUserId: builderId };
      if (project && project._id) payload.projectId = project._id;
      
      const response = await API.post('/chats', payload);
      if (response.data.success) {
        toast.success(`Chat started with ${builderName}${project ? ` about ${project.name}` : ''}`);
        setShowBuilderModal(false);
        await fetchChats();
        setSelectedChat(response.data.chat);
        setActiveTab('chats');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to start chat. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoadingBuilderProjects(false);
    }
  };

  const handleOpenBuilderModal = () => {
    fetchBuilders();
    setShowBuilderModal(true);
    setSearchTerm("");
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(p => ({ ...p, enquiries: true }));
      const { data } = await API.get('/enquiries/seller');
      setEnquiries(data.success ? data.enquiries : (data || []));
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(p => ({ ...p, enquiries: false }));
    }
  };

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

  const fetchPurchasedProperties = async () => {
    try {
      setLoading(p => ({ ...p, properties: true }));
      const response = await API.get('/seller/properties/purchased/my-purchased');
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching purchased properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(p => ({ ...p, properties: false }));
    }
  };

  // Effects
  useEffect(() => {
    fetchPurchasedProperties();
    fetchEnquiries();
    fetchChats();
    fetchBuilderProjects();
    fetchBuilderPropertiesList();
  }, []);

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
    return () => { if (interval) clearInterval(interval); };
  }, [activeTab, selectedChat]);

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

  // Helper functions
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:5050${imagePath}`;
    return imagePath;
  };

  const formatPrice = (n) => {
    if (!n) return "Price on Request";
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

  const formatArea = (area) => {
    if (!area) return "N/A";
    if (area >= 10000) return `${(area / 10000).toFixed(2)} Acres`;
    return `${area.toLocaleString()} sq.ft`;
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    try {
      await API.delete(`/seller/properties/${propertyToDelete}`);
      setProperties(p => p.filter(x => x._id !== propertyToDelete));
      toast.success("Property deleted");
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch {
      toast.error("Failed to delete property");
    }
  };

  const handleDeleteChat = (deletedChatId) => {
    setChats(prevChats => prevChats.filter(chat => chat._id !== deletedChatId));
    setSelectedChat(null);
    toast.success("Chat removed from list");
  };

  const handleRespondToEnquiry = async (enquiryId, status) => {
    setResponding(true);
    try {
      const res = await API.patch(`/enquiries/${enquiryId}/respond`, {
        status,
        response: responseText
      });

      if (res.data.success) {
        setEnquiries(prevEnquiries =>
          prevEnquiries.map(enq =>
            enq._id === enquiryId
              ? {
                  ...enq,
                  status: res.data.enquiry.status,
                  sellerResponse: res.data.enquiry.sellerResponse,
                  responseDate: res.data.enquiry.responseDate
                }
              : enq
          )
        );
        toast.success(`Enquiry ${status} successfully`);
        setShowResponseModal(false);
        setSelectedEnquiry(null);
        setResponseText("");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to respond");
    } finally {
      setResponding(false);
    }
  };

  const openResponseModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setResponseText("");
    setShowResponseModal(true);
  };


  const filteredProperties = properties.filter(p => {
  if (statusFilter === "all") return true;
  return p.status === statusFilter;
});



  // Computed values
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === "available" && !p.isDeleted).length;
  const soldProperties = properties.filter(p => p.status === "sold" && !p.isDeleted).length;
  const deletedProperties = properties.filter(p => p.isDeleted === true).length;
  const totalViews = properties.reduce((s, p) => s + (p.views || 0), 0);
  const unreadEnquiries = enquiries.filter(e => !e.readBySeller).length;
  const totalPortfolioValue = properties.reduce((s, p) => s + (p.price || 0), 0);
  const recentEnquiries = enquiries.slice(0, 3);
  const recentProperties = properties.slice(0, 3);

  const menuItems = [
    { id: "overview", name: "Overview", Icon: ViewColumnsIcon, count: null },
    { id: "properties", name: "My Properties", Icon: BriefcaseIcon, count: totalProperties },
    { id: "builder-projects", name: "Builder Projects", Icon: BuildingOfficeIcon, count: builderProjects.length },
    { id: "builder-properties", name: "Builder Properties", Icon: DocumentPlusIcon, count: builderPropertiesList.length },
    { id: "enquiries", name: "Enquiries", Icon: EnvelopeIcon, count: unreadEnquiries, total: enquiries.length },
    { id: "chats", name: "Chat Box", Icon: ChatBubbleLeftRightIcon, count: unreadCount },
  ];

  const propStatusCfg = {
    available: { label: 'Available', color: '#8B7355', bg: 'rgba(139,115,85,0.12)', border: 'rgba(139,115,85,0.3)' },
    sold: { label: 'Sold', color: '#6B6355', bg: 'rgba(107,99,85,0.1)', border: 'rgba(107,99,85,0.25)' },
    under_contract: { label: 'Under Contract', color: '#C4A97A', bg: 'rgba(196,169,122,0.12)', border: 'rgba(196,169,122,0.35)' },
    deleted_by_builder: { label: 'Unavailable', color: '#C4503C', bg: 'rgba(196,80,60,0.12)', border: 'rgba(196,80,60,0.3)' }
  };

  const enqStatusCfg = {
    accepted: { label: '✓ Accepted', color: '#8B7355', bg: 'rgba(139,115,85,0.1)', border: 'rgba(139,115,85,0.25)' },
    rejected: { label: '✗ Declined', color: '#C4503C', bg: 'rgba(196,80,60,0.08)', border: 'rgba(196,80,60,0.2)' },
    pending: { label: 'Pending', color: '#A89880', bg: 'rgba(168,152,128,0.1)', border: 'rgba(168,152,128,0.2)' },
  };

  const Skeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: '#F5F0E8', borderRadius: 2, padding: 18, display: 'flex', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: '#EDE8DC', borderRadius: 2, animation: 'sl-pulse 1.4s ease infinite' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 12, background: '#EDE8DC', borderRadius: 2, width: '40%', animation: 'sl-pulse 1.4s ease infinite' }} />
            <div style={{ height: 10, background: '#EDE8DC', borderRadius: 2, width: '60%', animation: 'sl-pulse 1.4s ease infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const Modal = ({ children }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 2, padding: '32px 36px', maxWidth: 460, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .sl-sans  { font-family: 'DM Sans', sans-serif; }
        .sl-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .sl-nav-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border: none; background: transparent;
          border-radius: 2px; cursor: pointer; text-align: left;
          transition: background 0.2s ease;
        }
        .sl-nav-item:hover { background: rgba(139,115,85,0.06); }
        .sl-nav-item.active, .sl-nav-item.highlight { background: #1E1C18; }
        .sl-nav-item.highlight:hover { background: #2C2A26; }

        .sl-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1E1C18; color: #F5F0E8; border: none;
          padding: 10px 22px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
          cursor: pointer; transition: background 0.25s ease, letter-spacing 0.25s ease;
        }
        .sl-btn-primary:hover:not(:disabled) { background: #2C2A26; letter-spacing: 0.16em; }
        .sl-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .sl-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: #8B7355;
          border: 1px solid rgba(139,115,85,0.3); padding: 7px 14px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.65rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease;
        }
        .sl-btn-ghost:hover { background: rgba(139,115,85,0.08); border-color: #8B7355; }

        .sl-btn-danger {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: #C4503C;
          border: 1px solid rgba(196,80,60,0.25); padding: 7px 14px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.65rem;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease;
        }
        .sl-btn-danger:hover { background: rgba(196,80,60,0.07); border-color: #C4503C; }
        .sl-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

        .sl-property-card {
          background: white; border: 1px solid rgba(139,115,85,0.12); border-radius: 2px;
          padding: 18px 20px; display: flex; gap: 18px; align-items: flex-start;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .sl-property-card:hover { border-color: rgba(139,115,85,0.35); box-shadow: 0 6px 24px rgba(0,0,0,0.07); }
        .sl-property-card:hover .sl-card-img { transform: scale(1.05); }
        .sl-card-img { transition: transform 0.6s ease; }

        .sl-enq-card {
          background: white; border: 1px solid rgba(139,115,85,0.1); border-radius: 2px;
          padding: 18px 20px; transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .sl-enq-card:hover { border-color: rgba(139,115,85,0.3); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .sl-metric-box {
          text-align: center; padding: 10px 16px;
          border-right: 1px solid rgba(139,115,85,0.1);
        }
        .sl-metric-box:last-child { border-right: none; }

        .sl-modal-overlay {
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

        .sl-modal {
          background: white;
          border-radius: 2px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease;
        }

        .sl-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(139,115,85,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sl-modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          max-height: calc(80vh - 120px);
        }

        .sl-builder-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid rgba(139,115,85,0.1);
          border-radius: 2px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .sl-builder-item:hover {
          border-color: rgba(139,115,85,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .sl-search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .sl-search-input:focus {
          outline: none;
          border-color: #8B7355;
        }

        .sl-ghost-link {
          background: none;
          border: none;
          cursor: pointer;
          color: #8B7355;
          text-decoration: underline;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes sl-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: 256, background: 'white', borderRight: '1px solid rgba(139,115,85,0.12)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(139,115,85,0.1)' }}>
            <div className="sl-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>Inventory</div>
            <h1 className="sl-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em' }}>
              Seller <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Central</em>
            </h1>
          </div>

          <nav style={{ padding: '12px 12px', flex: 1 }}>
            {menuItems.map(({ id, name, Icon, count, total, highlight }) => (
              <button key={id}
                className={`sl-nav-item ${highlight ? 'highlight' : activeTab === id ? 'active' : ''}`}
                onClick={() => {
                  if (id === 'add') { navigate("/seller/add-property"); return; }
                  if (id === 'edit') {
                    if (properties.length > 0) navigate(`/seller/edit-property/${properties[0]._id}`);
                    else toast.error("No properties to edit");
                    return;
                  }
                  setActiveTab(id);
                }}
              >
                <div style={{ width: 30, height: 30, border: `1px solid ${(activeTab === id || highlight) ? 'rgba(196,169,122,0.3)' : 'rgba(139,115,85,0.2)'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 13, height: 13, color: (activeTab === id || highlight) ? '#C4A97A' : '#8B7355' }} />
                </div>
                <span className="sl-sans" style={{ fontSize: '0.82rem', fontWeight: 500, color: (activeTab === id || highlight) ? '#F5F0E8' : '#2C2A26', flex: 1 }}>{name}</span>
                {count > 0 && !highlight && (
                  <span className="sl-sans" style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.08em', background: id === 'enquiries' ? 'rgba(196,80,60,0.15)' : 'rgba(139,115,85,0.15)', color: id === 'enquiries' ? '#C4503C' : (activeTab === id ? '#C4A97A' : '#8B7355'), padding: '2px 7px', borderRadius: 2 }}>
                    {count}{total && total > count ? `/${total}` : ''}
                  </span>
                )}
                <ChevronRightIcon style={{ width: 12, height: 12, color: (activeTab === id || highlight) ? '#C4A97A' : '#C4B9A8', flexShrink: 0 }} />
              </button>
            ))}
          </nav>

          <div style={{ margin: '0 12px 16px', background: '#1E1C18', borderRadius: 2, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, border: '1px solid rgba(196,169,122,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div className="sl-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Portfolio Value</div>
            <div className="sl-serif" style={{ fontSize: '1.4rem', fontWeight: 500, color: '#C4A97A', lineHeight: 1 }}>
              {formatPrice(totalPortfolioValue)}
            </div>
            <div className="sl-sans" style={{ fontSize: '0.68rem', color: '#6B6355', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 300 }}>
              <EyeIcon style={{ width: 10, height: 10 }} /> {totalViews} total views
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '36px 40px 80px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Welcome back</div>
                <h2 className="sl-serif" style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 300, color: '#1E1C18', letterSpacing: '-0.02em' }}>
                  {user?.name || 'Seller'}<em style={{ fontStyle: 'italic', color: '#8B7355' }}>.</em>
                </h2>
              </div>

              <div style={{ display: 'flex', background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                {[
                  { label: 'Total', value: totalProperties, color: '#1E1C18' },
                  { label: 'Active', value: activeProperties, color: '#8B7355' },
                  { label: 'Sold', value: soldProperties, color: '#A89880' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="sl-metric-box">
                    <div className="sl-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#A89880', marginBottom: 3 }}>{label}</div>
                    <div className="sl-serif" style={{ fontSize: '1.4rem', fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Welcome Section */}
                <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '28px 32px' }}>
                  <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
                    Dashboard Overview
                  </div>
                  <h2 className="sl-serif" style={{ fontSize: '1.8rem', fontWeight: 300, color: '#1E1C18', marginBottom: 16 }}>
                    Welcome back, <em style={{ fontStyle: 'italic', color: '#8B7355' }}>{user?.name?.split(' ')[0] || 'Seller'}</em>
                  </h2>
                  <p className="sl-sans" style={{ color: '#6B6355', fontSize: '0.9rem', maxWidth: '80%' }}>
                    Manage your purchased properties, track enquiries, and connect with builders all in one place.
                  </p>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  <div className="sl-stat-card" style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>Properties</div>
                      <BriefcaseIcon style={{ width: 18, height: 18, color: '#8B7355' }} />
                    </div>
                    <div className="sl-serif" style={{ fontSize: '2rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1, marginBottom: 4 }}>{totalProperties}</div>
                    <div className="sl-sans" style={{ fontSize: '0.68rem', color: '#8B7355' }}>Total properties in portfolio</div>
                  </div>

                  <div className="sl-stat-card" style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>Enquiries</div>
                      <EnvelopeIcon style={{ width: 18, height: 18, color: '#8B7355' }} />
                    </div>
                    <div className="sl-serif" style={{ fontSize: '2rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1, marginBottom: 4 }}>{enquiries.length}</div>
                    <div className="sl-sans" style={{ fontSize: '0.68rem', color: '#8B7355' }}>{unreadEnquiries} unread enquiries</div>
                  </div>

                  <div className="sl-stat-card" style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>Messages</div>
                      <ChatBubbleLeftRightIcon style={{ width: 18, height: 18, color: '#8B7355' }} />
                    </div>
                    <div className="sl-serif" style={{ fontSize: '2rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1, marginBottom: 4 }}>{chats.length}</div>
                    <div className="sl-sans" style={{ fontSize: '0.68rem', color: '#8B7355' }}>{unreadCount} unread messages</div>
                  </div>

                  <div className="sl-stat-card" style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>Views</div>
                      <EyeIcon style={{ width: 18, height: 18, color: '#8B7355' }} />
                    </div>
                    <div className="sl-serif" style={{ fontSize: '2rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1, marginBottom: 4 }}>{totalViews}</div>
                    <div className="sl-sans" style={{ fontSize: '0.68rem', color: '#8B7355' }}>Total property views</div>
                  </div>
                </div>

                {/* Recent Properties */}
                <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div>
                      <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>Recent Properties</div>
                      <h3 className="sl-serif" style={{ fontSize: '1.2rem', fontWeight: 400, color: '#1E1C18' }}>Latest <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Acquisitions</em></h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('properties')}
                      className="sl-ghost-link"
                    >
                      View All →
                    </button>
                  </div>

                  {loading.properties ? <Skeleton /> : recentProperties.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {recentProperties.map(p => {
                        const isDeleted = p.isDeleted === true;
                        const statusKey = isDeleted ? 'deleted_by_builder' : (p.status || 'available');
                        const sc = propStatusCfg[statusKey] || propStatusCfg.available;
                        
                        return (
                          <div key={p._id} className="sl-property-card" style={{ padding: '16px 18px', opacity: isDeleted ? 0.85 : 1 }}>
                            <div style={{ width: 80, height: 70, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: '#EDE8DC', position: 'relative' }}>
                              {p.images && p.images.length > 0 ? (
                                <img src={getImageUrl(p.images[0])} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isDeleted ? 'grayscale(0.3)' : 'none' }} />
                              ) : (
                                <BuildingOfficeIcon style={{ width: 30, height: 30, color: '#C4A97A', margin: '20px auto' }} />
                              )}
                              {isDeleted && (
                                <div style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(0,0,0,0.4)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: 2, fontSize: '0.5rem', color: 'white' }}>Removed</div>
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h4 className="sl-sans" style={{ fontSize: '0.9rem', fontWeight: 600, color: isDeleted ? '#A89880' : '#1E1C18' }}>{p.title}</h4>
                                <div className="sl-serif" style={{ fontSize: '1rem', fontWeight: 500, color: isDeleted ? '#A89880' : '#1E1C18', textDecoration: isDeleted ? 'line-through' : 'none' }}>{formatPrice(p.price)}</div>
                              </div>
                              <div className="sl-sans" style={{ fontSize: '0.65rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <MapPinIcon style={{ width: 10, height: 10 }} /> {p.location}
                              </div>
                              <div className="sl-sans" style={{ fontSize: '0.6rem', color: '#A89880', marginTop: 4 }}>Purchased • {formatDate(p.purchasedAt || p.createdAt)}</div>
                            </div>
                            <Link to={`/property/${p._id}`} style={{ pointerEvents: isDeleted ? 'none' : 'auto', opacity: isDeleted ? 0.5 : 1 }}>
                              <ArrowUpRightIcon style={{ width: 16, height: 16, color: '#8B7355' }} />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="sl-sans" style={{ textAlign: 'center', padding: '40px 0', color: '#A89880' }}>
                      No properties yet. Browse properties from builders to start your portfolio.
                    </div>
                  )}
                </div>

                {/* Recent Enquiries */}
                <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div>
                      <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880' }}>Recent Enquiries</div>
                      <h3 className="sl-serif" style={{ fontSize: '1.2rem', fontWeight: 400, color: '#1E1C18' }}>Latest <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Messages</em></h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('enquiries')}
                      className="sl-ghost-link"
                    >
                      View All →
                    </button>
                  </div>

                  {loading.enquiries ? <Skeleton /> : recentEnquiries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {recentEnquiries.map(enq => {
                        const es = enqStatusCfg[enq.status] || enqStatusCfg.pending;
                        return (
                          <div key={enq._id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(139,115,85,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <div>
                                <span className="sl-sans" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1E1C18' }}>{enq.buyer?.name || 'Buyer'}</span>
                                <span className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginLeft: 8 }}>about {enq.property?.title}</span>
                              </div>
                              <span className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.08em', background: es.bg, color: es.color, border: `1px solid ${es.border}`, padding: '2px 6px', borderRadius: 2 }}>{es.label}</span>
                            </div>
                            <p className="sl-sans" style={{ fontSize: '0.75rem', color: '#6B6355', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {enq.message}
                            </p>
                            <div className="sl-sans" style={{ fontSize: '0.6rem', color: '#A89880', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ClockIcon style={{ width: 10, height: 10 }} /> {enq.timeAgo}
                              {enq.status === 'pending' && (
                                <button 
                                  onClick={() => openResponseModal(enq)}
                                  className="sl-ghost-link"
                                  style={{ fontSize: '0.6rem' }}
                                >
                                  Respond
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="sl-sans" style={{ textAlign: 'center', padding: '40px 0', color: '#A89880' }}>
                      No enquiries yet. When buyers contact you, they'll appear here.
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '22px 24px' }}>
                  <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880', marginBottom: 16 }}>
                    Quick Actions
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setActiveTab('builder-properties')}
                      className="sl-btn-primary"
                      style={{ padding: '10px 20px' }}
                    >
                      Browse Builder Properties
                    </button>
                    <button 
                      onClick={handleOpenBuilderModal}
                      className="sl-btn-ghost"
                      style={{ padding: '10px 20px' }}
                    >
                      <UserGroupIcon style={{ width: 14, height: 14 }} />
                      Contact Builders
                    </button>
                    <button 
                      onClick={() => setActiveTab('chats')}
                      className="sl-btn-ghost"
                      style={{ padding: '10px 20px' }}
                    >
                      <ChatBubbleLeftRightIcon style={{ width: 14, height: 14 }} />
                      View Messages
                    </button>
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
                        <div className="sl-sans" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1C18' }}>
                          {unreadCount} Unread Message{unreadCount !== 1 ? 's' : ''}
                        </div>
                        <div className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>
                          You have new messages from builders or buyers
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('chats')}
                        className="sl-ghost-link"
                        style={{ fontSize: '0.7rem' }}
                      >
                        View Messages →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Properties Tab - Purchased Properties */}
            {activeTab === 'properties' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading.properties ? <Skeleton /> : properties.length > 0 ? (
                  properties.map(p => {
                    const isDeleted = p.isDeleted === true;
                    const statusKey = isDeleted ? 'deleted_by_builder' : (p.status || 'available');
                    const sc = propStatusCfg[statusKey] || propStatusCfg.available;
                    
                    return (
                      <div key={p._id} className="sl-property-card" style={{
                        opacity: isDeleted ? 0.85 : 1,
                        background: isDeleted ? '#FAFAF8' : 'white'
                      }}>
                        <div style={{ width: 140, height: 130, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: '#EDE8DC', border: '1px solid rgba(139,115,85,0.1)', position: 'relative' }}>
                          {p.images && p.images.length > 0 ? (
                            <img src={getImageUrl(p.images[0])} alt={p.title} className="sl-card-img" style={{ 
                              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                              filter: isDeleted ? 'grayscale(0.3)' : 'none'
                            }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <BriefcaseIcon style={{ width: 24, height: 24, color: '#C4A97A', opacity: 0.4 }} />
                              <span className="sl-sans" style={{ fontSize: '0.5rem', color: '#C4A97A', opacity: 0.4 }}>NO IMAGE</span>
                            </div>
                          )}
                          <div style={{ position: 'absolute', top: 8, left: 8, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 2, padding: '2px 8px' }}>
                            <span className="sl-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: sc.color, fontWeight: 600 }}>{sc.label}</span>
                          </div>
                          
                          {isDeleted && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{
                                background: 'rgba(0,0,0,0.8)',
                                padding: '4px 8px',
                                borderRadius: 2,
                                fontSize: '0.6rem',
                                color: 'white',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                              }}>
                                Removed
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <div style={{ flex: 1 }}>
                                <h3 className="sl-sans" style={{ fontSize: '1rem', fontWeight: 600, color: isDeleted ? '#A89880' : '#1E1C18' }}>
                                  {p.title}
                                </h3>
                                {isDeleted && (
                                  <div style={{
                                    background: 'rgba(196,80,60,0.1)',
                                    borderLeft: '3px solid #C4503C',
                                    padding: '8px 12px',
                                    marginTop: 8,
                                    borderRadius: 2
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <ExclamationTriangleIcon style={{ width: 14, height: 14, color: '#C4503C' }} />
                                      <span className="sl-sans" style={{ fontSize: '0.7rem', color: '#C4503C', fontWeight: 500 }}>
                                        This property has been removed by the builder and is no longer available for sale. It remains in your portfolio as a record of purchase.
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="sl-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: isDeleted ? '#A89880' : '#1E1C18', flexShrink: 0, marginLeft: 12, textDecoration: isDeleted ? 'line-through' : 'none' }}>
                                {formatPrice(p.price)}
                              </div>
                            </div>
                            <div className="sl-sans" style={{ fontSize: '0.75rem', color: isDeleted ? '#A89880' : '#8B7355', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
                              <MapPinIcon style={{ width: 11, height: 11 }} /> {p.location}
                            </div>
                            <div style={{ display: 'flex', gap: 20 }}>
                              {[
                                { label: 'Views', value: p.views || 0 },
                                { label: 'Enquiries', value: enquiries.filter(e => e.property?._id === p._id).length },
                                { label: 'Listed', value: formatDate(p.createdAt) },
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <div className="sl-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginBottom: 2 }}>{label}</div>
                                  <div className="sl-sans" style={{ fontSize: '0.82rem', color: isDeleted ? '#A89880' : '#1E1C18', fontWeight: 500 }}>{value}</div>
                                </div>
                              ))}
                            </div>
                            {p.purchasedAt && !isDeleted && (
                              <div className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginTop: 8 }}>
                                Purchased on {new Date(p.purchasedAt).toLocaleDateString('en-IN')}
                              </div>
                            )}
                            {isDeleted && p.deletedAt && (
                              <div className="sl-sans" style={{ fontSize: '0.7rem', color: '#C4503C', marginTop: 8 }}>
                                Removed by builder on {new Date(p.deletedAt).toLocaleDateString('en-IN')}
                              </div>
                            )}
                          </div>
                        </div>

              
<div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
  {/* Edit Button */}
  {!isDeleted && (
    <Link 
      to={`/seller/edit-purchased-property/${p._id}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{ 
        width: 32, height: 32, 
        border: '1px solid rgba(139,115,85,0.25)', 
        borderRadius: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#8B7355', 
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#1E1C18';
        e.currentTarget.style.borderColor = '#1E1C18';
        e.currentTarget.querySelector('svg').style.color = '#F5F0E8';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'rgba(139,115,85,0.25)';
        e.currentTarget.querySelector('svg').style.color = '#8B7355';
      }}
    >
      <PencilIcon style={{ width: 14, height: 14 }} />
    </div>
    </Link>
  )}
  
  {/* View Button */}
  <Link 
    to={`/property/${p._id}`} 
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      textDecoration: 'none', 
      pointerEvents: isDeleted ? 'none' : 'auto',
      opacity: isDeleted ? 0.5 : 1
    }}
  >
    <div style={{ 
      width: 32, height: 32, 
      border: `1px solid ${isDeleted ? 'rgba(139,115,85,0.15)' : 'rgba(139,115,85,0.25)'}`, 
      borderRadius: 2, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: isDeleted ? '#A89880' : '#8B7355', 
      transition: 'all 0.2s ease',
      cursor: isDeleted ? 'not-allowed' : 'pointer'
    }}
    onMouseEnter={e => {
      if (!isDeleted) {
        e.currentTarget.style.background = '#1E1C18';
        e.currentTarget.style.borderColor = '#1E1C18';
        e.currentTarget.querySelector('svg').style.color = '#F5F0E8';
      }
    }}
    onMouseLeave={e => {
      if (!isDeleted) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'rgba(139,115,85,0.25)';
        e.currentTarget.querySelector('svg').style.color = '#8B7355';
      }
    }}
  >
    <ArrowUpRightIcon style={{ width: 14, height: 14, color: isDeleted ? '#A89880' : '#8B7355' }} />
  </div>
  </Link>
</div>

                    </div>
                  );
                })
                ) : (
                  <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.1)', borderRadius: 2, padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <BriefcaseIcon style={{ width: 20, height: 20, color: '#C4A97A', opacity: 0.6 }} />
                    </div>
                    <p className="sl-sans" style={{ color: '#8B7355', fontSize: '0.875rem', marginBottom: 6 }}>No properties listed yet</p>
                    <p className="sl-sans" style={{ color: '#A89880', fontSize: '0.78rem', fontWeight: 300, marginBottom: 20 }}>Start by adding your first property</p>
                  </div>
                )}
              </div>
            )}

            {/* Enquiries Tab */}
            {activeTab === 'enquiries' && (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <div className="sl-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>Inbox</div>
                  <h3 className="sl-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18' }}>
                    Property <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Enquiries</em>
                    <span className="sl-sans" style={{ fontSize: '0.78rem', color: '#A89880', fontStyle: 'normal', marginLeft: 8 }}>({enquiries.length})</span>
                  </h3>
                </div>

                {loading.enquiries ? <Skeleton /> : enquiries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {enquiries.map(enq => {
                      const es = enqStatusCfg[enq.status] || enqStatusCfg.pending;
                      return (
                        <div key={enq._id} className="sl-enq-card">
                          <div style={{ display: 'flex', gap: 14 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: '#EDE8DC', border: '1px solid rgba(139,115,85,0.1)' }}>
                              {enq.property?.image ? (
                                <img src= {getImageUrl(enq.property.images[0])}alt={enq.property?.title || 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <HomeIcon style={{ width: 20, height: 20, color: '#C4A97A', opacity: 0.5 }} />
                                </div>
                              )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <div>
                                  <div className="sl-sans" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1C18' }}>{enq.buyer?.name || 'Buyer'}</div>
                                  <div className="sl-sans" style={{ fontSize: '0.72rem', color: '#8B7355', marginTop: 1 }}>{enq.property?.title}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  {!enq.readBySeller && (
                                    <span className="sl-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(196,80,60,0.1)', color: '#C4503C', padding: '2px 7px', borderRadius: 2 }}>New</span>
                                  )}
                                  <span className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.08em', background: es.bg, color: es.color, border: `1px solid ${es.border}`, padding: '2px 8px', borderRadius: 2 }}>{es.label}</span>
                                </div>
                              </div>

                              <div className="sl-sans" style={{ fontSize: '0.8rem', color: '#6B6355', background: '#F5F0E8', padding: '10px 14px', borderRadius: 2, borderLeft: '2px solid rgba(139,115,85,0.25)', marginBottom: 10, fontWeight: 300 }}>
                                "{enq.message}"
                              </div>

                              {enq.sellerResponse && (
                                <div style={{ marginBottom: 10 }}>
                                  <div className="sl-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 5 }}>Your Response</div>
                                  <div className="sl-sans" style={{ fontSize: '0.8rem', color: '#2C2A26', background: 'rgba(139,115,85,0.06)', padding: '10px 14px', borderRadius: 2, borderLeft: '2px solid rgba(139,115,85,0.35)', fontWeight: 300 }}>
                                    {enq.sellerResponse}
                                  </div>
                                </div>
                              )}

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <div className="sl-sans" style={{ fontSize: '0.65rem', color: '#A89880', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 300 }}>
                                  <ClockIcon style={{ width: 10, height: 10 }} /> {enq.timeAgo}
                                  {enq.responseDate && <><span style={{ margin: '0 4px' }}>·</span>Responded {enq.responseTimeAgo}</>}
                                </div>
                                {enq.status === 'pending' && (
                                  <button className="sl-btn-primary" style={{ padding: '7px 16px' }} onClick={() => openResponseModal(enq)}>
                                    Respond
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.1)', borderRadius: 2, padding: '56px 32px', textAlign: 'center' }}>
                    <div style={{ width: 50, height: 50, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <PaperAirplaneIcon style={{ width: 20, height: 20, color: '#C4A97A', opacity: 0.6 }} />
                    </div>
                    <p className="sl-sans" style={{ color: '#8B7355', fontSize: '0.875rem' }}>No enquiries yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Builder Projects Tab - Construction Projects */}
            {activeTab === 'builder-projects' && (
              <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>
                      Builder Properties
                    </div>
                    <h3 className="sl-serif" style={{ fontSize: '1.2rem', fontWeight: 400, color: '#1E1C18' }}>
                      Available <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Properties from Builders</em>
                    </h3>
                    <p className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginTop: 4 }}>
                      Request to purchase properties listed by builders
                    </p>
                  </div>
                  <button
                    onClick={handleOpenBuilderModal}
                    className="sl-btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.7rem' }}
                  >
                    <UserGroupIcon style={{ width: 14, height: 14 }} />
                    Browse All Builders
                  </button>
                </div>

                {loadingBuilderProjects ? (
                  <Skeleton />
                ) : builderProjects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {builderProjects.map(project => (
                      <div key={project._id} className="sl-property-card" style={{ flexDirection: 'column', padding: '20px' }}>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                          <div style={{ width: 120, height: 100, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: '#EDE8DC', border: '1px solid rgba(139,115,85,0.1)', position: 'relative' }}>
                            {project.images && project.images.length > 0 ? (
                              <img
                                src={getImageUrl(project.images[0])}
                                alt={project.name}
                                className="sl-card-img"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BuildingOfficeIcon style={{ width: 40, height: 40, color: '#C4A97A', opacity: 0.4 }} />
                              </div>
                            )}
                            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(30,28,24,0.8)', backdropFilter: 'blur(4px)', borderRadius: 2, padding: '2px 8px' }}>
                              <span className="sl-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4A97A', fontWeight: 600 }}>
                                {project.status || 'Available'}
                              </span>
                            </div>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                              <div>
                                <h3 className="sl-sans" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1E1C18' }}>{project.name}</h3>
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                  <MapPinIcon style={{ width: 11, height: 11 }} />
                                  {project.location || 'Location not specified'}
                                </div>
                              </div>
                              <div className="sl-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#1E1C18' }}>
                                {formatPrice(project.price)}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
                              {project.area && (
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <BuildingOfficeIcon style={{ width: 11, height: 11 }} />
                                  {formatArea(project.area)}
                                </div>
                              )}
                              {project.bedrooms && (
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FaBed style={{ fontSize: '0.7rem' }} />
                                  {project.bedrooms} BHK
                                </div>
                              )}
                              {project.bathrooms && (
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FaBath style={{ fontSize: '0.7rem' }} />
                                  {project.bathrooms} Bath
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                              {[
                                { label: 'Completion', value: project.completionDate ? formatDate(project.completionDate) : '—', icon: CalendarIcon },
                                { label: 'Total Units', value: project.totalUnits || '—', icon: BuildingOfficeIcon },
                                { label: 'RERA', value: project.reraNumber ? '✓ Approved' : '—', icon: CheckCircleIcon },
                              ].map(({ label, value, icon: Icon }) => (
                                <div key={label}>
                                  <div className="sl-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Icon style={{ width: 10, height: 10 }} /> {label}
                                  </div>
                                  <div className="sl-sans" style={{ fontSize: '0.82rem', color: '#1E1C18', fontWeight: 500 }}>{value}</div>
                                </div>
                              ))}
                            </div>

                            {project.description && (
                              <p className="sl-sans" style={{ fontSize: '0.75rem', color: '#6B6355', lineHeight: 1.4, marginBottom: 12 }}>
                                {project.description.length > 150 ? `${project.description.substring(0, 150)}...` : project.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {project.builder && (
                          <div style={{ 
                            borderTop: '1px solid rgba(139,115,85,0.1)', 
                            paddingTop: 16,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 16
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                                {project.builder.profilePic ? (
                                  <img
                                    src={getImageUrl(project.builder.profilePic)}
                                    alt={project.builder.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <FaUserTie style={{ color: '#8B7355', fontSize: '1.2rem' }} />
                                )}
                              </div>
                              
                              <div>
                                <div className="sl-sans" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1C18', marginBottom: 2 }}>
                                  {project.builder.name || 'Builder'}
                                </div>
                                {project.builder.companyName && (
                                  <div className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>
                                    {project.builder.companyName}
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                  {project.builder.city && (
                                    <div className="sl-sans" style={{ fontSize: '0.65rem', color: '#A89880', display: 'flex', alignItems: 'center', gap: 3 }}>
                                      <MapPinIcon style={{ width: 10, height: 10 }} />
                                      {project.builder.city}
                                    </div>
                                  )}
                                  {project.builder.email && (
                                    <div className="sl-sans" style={{ fontSize: '0.65rem', color: '#A89880', display: 'flex', alignItems: 'center', gap: 3 }}>
                                      <EnvelopeIcon style={{ width: 10, height: 10 }} />
                                      {project.builder.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                              <button
                                onClick={() => handleStartChatWithBuilder(project.builder._id, project.builder.name, project)}
                                className="sl-btn-ghost"
                                style={{ padding: '8px 16px' }}
                              >
                                <ChatBubbleLeftRightIcon style={{ width: 14, height: 14 }} />
                                Message Builder
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <BuildingOfficeIcon style={{ width: 64, height: 64, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
                    <p className="sl-sans" style={{ color: '#8B7355', fontSize: '1rem', marginBottom: 8 }}>
                      No builder properties available
                    </p>
                    <p className="sl-sans" style={{ color: '#A89880', fontSize: '0.875rem' }}>
                      Check back later for new properties from builders
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Builder Properties Tab - Properties for Purchase */}
            {activeTab === 'builder-properties' && (
              <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>
                      Builder Properties
                    </div>
                    <h3 className="sl-serif" style={{ fontSize: '1.2rem', fontWeight: 400, color: '#1E1C18' }}>
                      Available <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Properties from Builders</em>
                    </h3>
                    <p className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginTop: 4 }}>
                      {builderPropertiesList.length} properties available for purchase
                    </p>
                  </div>
                  <button onClick={handleOpenBuilderModal} className="sl-btn-primary" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>
                    <UserGroupIcon style={{ width: 14, height: 14 }} />
                    Browse All Builders
                  </button>
                </div>

                {loadingBuilderPropertiesList ? (
                  <Skeleton />
                ) : builderPropertiesList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {builderPropertiesList.map(property => (
                      <div key={property._id} className="sl-property-card" style={{ flexDirection: 'column', padding: '20px' }}>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                          <div style={{ width: 120, height: 100, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: '#EDE8DC', border: '1px solid rgba(139,115,85,0.1)' }}>
                            {property.images?.[0] ? (
                              <img src={getImageUrl(property.images[0])} alt={property.title} className="sl-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <BuildingOfficeIcon style={{ width: 40, height: 40, color: '#C4A97A', opacity: 0.4 }} />
                            )}
                            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(139,115,85,0.12)', border: '1px solid rgba(139,115,85,0.3)', borderRadius: 2, padding: '2px 8px' }}>
                              <span className="sl-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', fontWeight: 600 }}>Available</span>
                            </div>
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <div>
                                <h3 className="sl-sans" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{property.title}</h3>
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                  <MapPinIcon style={{ width: 11, height: 11 }} /> {property.location}
                                </div>
                              </div>
                              <div className="sl-serif" style={{ fontSize: '1.2rem', fontWeight: 500 }}>{formatPrice(property.price)}</div>
                            </div>

                            <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
                              {property.bedrooms && (
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FaBed style={{ fontSize: '0.7rem' }} /> {property.bedrooms} BHK
                                </div>
                              )}
                              {property.bathrooms && (
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FaBath style={{ fontSize: '0.7rem' }} /> {property.bathrooms} Bath
                                </div>
                              )}
                              {property.area && (
                                <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <BuildingOfficeIcon style={{ width: 11, height: 11 }} /> {formatArea(property.area)}
                                </div>
                              )}
                            </div>

                            {property.description && (
                              <p className="sl-sans" style={{ fontSize: '0.75rem', color: '#6B6355', lineHeight: 1.4, marginBottom: 12 }}>
                                {property.description.length > 150 ? `${property.description.substring(0, 150)}...` : property.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {property.builder && (
                          <div style={{ borderTop: '1px solid rgba(139,115,85,0.1)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 48, height: 48, borderRadius: 2, background: '#F5F0E8', border: '1px solid rgba(139,115,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {property.builder.profilePic ? (
                                  <img src={getImageUrl(property.builder.profilePic)} alt={property.builder.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <FaUserTie style={{ color: '#8B7355', fontSize: '1.2rem' }} />
                                )}
                              </div>
                              <div>
                                <div className="sl-sans" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{property.builder.name || 'Builder'}</div>
                                {property.builder.companyName && (
                                  <div className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>{property.builder.companyName}</div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                              <Link to={`/property/${property._id}`} className="sl-btn-ghost" style={{ padding: '8px 16px' }}>
                                <EyeIcon style={{ width: 14, height: 14 }} /> View Details
                              </Link>
                              <button onClick={() => handleStartChatWithBuilder(property.builder._id, property.builder.name, property)} className="sl-btn-ghost" style={{ padding: '8px 16px' }}>
                                <ChatBubbleLeftRightIcon style={{ width: 14, height: 14 }} /> Message
                              </button>
                              <button onClick={() => handlePurchaseRequest(property._id, property.title)} className="sl-btn-primary" disabled={sendingRequest} style={{ background: '#C4A97A', padding: '8px 20px' }}>
                                {sendingRequest ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span> Sending...
                                  </span>
                                ) : (
                                  <> <DocumentPlusIcon style={{ width: 14, height: 14 }} /> Request to Purchase </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <BuildingOfficeIcon style={{ width: 64, height: 64, color: '#C4A97A', opacity: 0.3, margin: '0 auto 16px' }} />
                    <p className="sl-sans" style={{ color: '#8B7355', fontSize: '1rem', marginBottom: 8 }}>No builder properties available</p>
                    <p className="sl-sans" style={{ color: '#A89880', fontSize: '0.875rem' }}>Check back later for new properties from builders</p>
                  </div>
                )}
              </div>
            )}

            {/* Chats Tab */}
            {activeTab === 'chats' && (
              selectedChat ? (
                <ChatInterface chatId={selectedChat._id} property={selectedChat.property} onClose={() => setSelectedChat(null)} onDelete={handleDeleteChat} />
              ) : (
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <div className="sl-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>Conversations</div>
                    <h3 className="sl-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18' }}>Chat <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Messages</em></h3>
                  </div>

                  {loading.chats ? (
                    <Skeleton />
                  ) : chats.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {chats.map(chat => {
                        const otherParticipant = chat.participants?.find(p => p._id !== user?._id);
                        const lastMessage = chat.lastMessage;
                        const unreadCountChat = chat.unreadCount?.seller || 0;
                        return (
                          <div key={chat._id} onClick={() => setSelectedChat(chat)} style={{ cursor: 'pointer', display: 'flex', gap: 16, padding: 16, background: 'white', border: '1px solid rgba(139,115,85,0.1)', borderRadius: 2 }}>
                            <div style={{ width: 60, height: 60, borderRadius: 2, overflow: 'hidden', background: '#EDE8DC', flexShrink: 0 }}>
                              {chat.property?.images?.[0] ? (
                                <img src={getImageUrl(chat.property.images[0])} alt={chat.property?.title || 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <HomeIcon style={{ width: 24, height: 24, color: '#C4A97A', opacity: 0.5 }} />
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                                <div>
                                  <h4 className="sl-sans" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E1C18', marginBottom: 2 }}>{chat.property?.title || 'Property Chat'}</h4>
                                  <p className="sl-sans" style={{ fontSize: '0.72rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4 }}>Chat with {otherParticipant?.name || 'User'}</p>
                                </div>
                                {unreadCountChat > 0 && (
                                  <span style={{ background: '#C4503C', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 2, minWidth: 18, textAlign: 'center', marginLeft: 8 }}>{unreadCountChat}</span>
                                )}
                              </div>
                              {lastMessage && (
                                <div style={{ marginTop: 8 }}>
                                  <p className="sl-sans" style={{ fontSize: '0.78rem', color: '#6B6355', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: lastMessage.sender !== user?._id && unreadCountChat > 0 ? 500 : 300 }}>
                                    {lastMessage.sender === user?._id && <span style={{ color: '#8B7355', marginRight: 4 }}>You:</span>}
                                    {lastMessage.content}
                                  </p>
                                  <p className="sl-sans" style={{ fontSize: '0.6rem', color: '#A89880', marginTop: 2 }}>
                                    {new Date(lastMessage.createdAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.1)', borderRadius: 2, padding: '56px 32px', textAlign: 'center' }}>
                      <div style={{ width: 50, height: 50, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <ChatBubbleLeftRightIcon style={{ width: 20, height: 20, color: '#C4A97A', opacity: 0.6 }} />
                      </div>
                      <p className="sl-sans" style={{ color: '#8B7355', fontSize: '0.875rem', marginBottom: 4 }}>No messages yet</p>
                      <p className="sl-sans" style={{ color: '#A89880', fontSize: '0.78rem', fontWeight: 300 }}>When buyers contact you about properties, conversations will appear here</p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* FAB */}
      <button className="sl-btn-primary" onClick={() => navigate("/properties")} style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.2)', padding: '13px 24px' }}>
        <BuildingOfficeIcon style={{ width: 14, height: 14 }} /> Browse Properties
      </button>

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal>
          <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C4503C', marginBottom: 6 }}>Danger Zone</div>
          <h3 className="sl-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18', marginBottom: 10 }}>Delete Property</h3>
          <p className="sl-sans" style={{ color: '#6B6355', fontSize: '0.875rem', fontWeight: 300, marginBottom: 28 }}>Are you sure you want to delete this property? This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="sl-btn-danger" style={{ flex: 1, justifyContent: 'center', padding: 11 }} onClick={handleDeleteProperty}>Delete</button>
            <button className="sl-btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: 11 }} onClick={() => { setShowDeleteModal(false); setPropertyToDelete(null); }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Builder Modal */}
      {showBuilderModal && (
        <div className="sl-modal-overlay" onClick={() => setShowBuilderModal(false)}>
          <div className="sl-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="sl-modal-header">
              <div>
                <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Connect with Builders</div>
                <h3 className="sl-serif" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#1E1C18' }}>Available <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Builders</em></h3>
              </div>
              <button onClick={() => setShowBuilderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <XMarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
              </button>
            </div>

            <div className="sl-modal-body">
              <input type="text" placeholder="Search builders by name, email, or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="sl-search-input" />

              {loadingBuilders ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355] mx-auto"></div>
                  <p className="sl-sans" style={{ color: '#8B7355', marginTop: 12 }}>Loading builders...</p>
                </div>
              ) : filteredBuilders.length > 0 ? (
                filteredBuilders.map(builder => (
                  <div key={builder._id} className="sl-builder-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 2, background: '#F5F0E8', border: '1px solid rgba(139,115,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {builder.profilePic ? (
                          <img src={getImageUrl(builder.profilePic)} alt={builder.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FaUserTie style={{ fontSize: '1.5rem', color: '#8B7355' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 className="sl-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 4 }}>{builder.name}</h4>
                        {builder.companyName && <div className="sl-sans" style={{ fontSize: '0.75rem', color: '#8B7355', marginBottom: 2 }}>{builder.companyName}</div>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                          {builder.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <EnvelopeIcon style={{ width: 10, height: 10, color: '#8B7355' }} />
                              <span className="sl-sans" style={{ fontSize: '0.7rem', color: '#6B6355' }}>{builder.email}</span>
                            </div>
                          )}
                          {builder.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <PhoneIcon style={{ width: 10, height: 10, color: '#8B7355' }} />
                              <span className="sl-sans" style={{ fontSize: '0.7rem', color: '#6B6355' }}>{builder.phone}</span>
                            </div>
                          )}
                          {builder.city && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPinIcon style={{ width: 10, height: 10, color: '#8B7355' }} />
                              <span className="sl-sans" style={{ fontSize: '0.7rem', color: '#6B6355' }}>{builder.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleStartChatWithBuilder(builder._id, builder.name)} className="sl-btn-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                        <ChatBubbleLeftRightIcon style={{ width: 12, height: 12 }} /> Message
                      </button>
                    </div>

                    {builderProjects.filter(p => p.builder?._id === builder._id).length > 0 && (
                      <div style={{ marginTop: 8, paddingLeft: 68 }}>
                        <div className="sl-sans" style={{ fontSize: '0.65rem', color: '#A89880', marginBottom: 6 }}>Projects by {builder.name}:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {builderProjects.filter(p => p.builder?._id === builder._id).slice(0, 3).map(project => (
                            <button key={project._id} onClick={() => handleStartChatWithBuilder(builder._id, builder.name, project)} style={{ background: '#F5F0E8', border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, padding: '4px 10px', fontSize: '0.7rem', color: '#8B7355', cursor: 'pointer' }}>
                              {project.name}
                            </button>
                          ))}
                          {builderProjects.filter(p => p.builder?._id === builder._id).length > 3 && (
                            <span className="sl-sans" style={{ fontSize: '0.7rem', color: '#A89880' }}>+{builderProjects.filter(p => p.builder?._id === builder._id).length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <UserGroupIcon style={{ width: 40, height: 40, color: '#C4A97A', opacity: 0.4, margin: '0 auto 12px' }} />
                  <p className="sl-sans" style={{ color: '#8B7355' }}>{searchTerm ? 'No builders match your search' : 'No builders registered yet'}</p>
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="sl-ghost-link" style={{ marginTop: 12 }}>Clear Search</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedEnquiry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowResponseModal(false); setSelectedEnquiry(null); setResponseText(""); } }}>
          <div style={{ background: 'white', borderRadius: 2, padding: '32px 36px', maxWidth: 520, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Enquiry Response</div>
            <h3 className="sl-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18', marginBottom: 4 }}>Respond to Enquiry</h3>
            <p className="sl-sans" style={{ fontSize: '0.78rem', color: '#8B7355', fontWeight: 300, marginBottom: 20 }}>{selectedEnquiry.property?.title || 'Property Enquiry'}</p>

            <div style={{ marginBottom: 24, background: '#F5F0E8', borderLeft: '3px solid #8B7355', borderRadius: 2, padding: '16px 20px' }}>
              <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Buyer Message</div>
              <p className="sl-sans" style={{ fontSize: '0.9rem', color: '#1E1C18', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>"{selectedEnquiry.message}"</p>
              <div className="sl-sans" style={{ fontSize: '0.7rem', color: '#8B7355', marginTop: 8, fontStyle: 'italic' }}>— {selectedEnquiry.buyer?.name || 'Buyer'}</div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div className="sl-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Your Response <span style={{ color: '#A89880', fontWeight: 300 }}>(optional)</span></div>
              <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Write your response to the buyer here... (optional)" rows={5} style={{ width: '100%', background: '#FFFFFF', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, padding: '14px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#1E1C18', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button className="sl-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px 20px' }} disabled={responding} onClick={() => handleRespondToEnquiry(selectedEnquiry._id, 'accepted')}>
                {responding ? 'Processing...' : '✓ Accept Enquiry'}
              </button>
              <button className="sl-btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '14px 20px' }} disabled={responding} onClick={() => handleRespondToEnquiry(selectedEnquiry._id, 'rejected')}>
                ✗ Decline
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="sl-sans" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89880', fontSize: '0.75rem', textDecoration: 'underline', textUnderlineOffset: 3, padding: '8px 16px' }}
                onClick={() => { setShowResponseModal(false); setSelectedEnquiry(null); setResponseText(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
