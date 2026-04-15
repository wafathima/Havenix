import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../../api/axios";
import ChatInterface from "../../../components/Chat/ChatInterface";
import { FaBed, FaBath } from "react-icons/fa";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import {
  BookmarkIcon, PaperAirplaneIcon, EyeIcon,
  ChatBubbleLeftRightIcon, ViewColumnsIcon, InformationCircleIcon,
  ChevronRightIcon, HeartIcon as HeartOutline,
  HomeIcon, MapPinIcon, ClockIcon, EnvelopeIcon,
  ChartBarIcon, 
  // TrendingUpIcon,
  CurrencyRupeeIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function BuyerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedProperties, setSavedProperties] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState({ saved: false, viewed: false, enquiries: true, chats: false });
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchParams] = useSearchParams();
  
  // New state for dashboard stats
  const [stats, setStats] = useState({
    totalSavedValue: 0,
    activeEnquiries: 0,
    respondedEnquiries: 0,
    viewedThisWeek: 0,
    averagePropertyPrice: 0,
    mostViewedLocation: '',
    topPropertyType: ''
  });

  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");

  useEffect(() => { if (activeTab === "enquiries") fetchEnquiries(); }, [activeTab]);
  useEffect(() => { if (tabFromUrl) setActiveTab(tabFromUrl); }, [tabFromUrl]);
  useEffect(() => { 
    fetchSavedProperties(); 
    fetchRecentlyViewed(); 
    fetchEnquiries(); 
    calculateStats(); 
  }, []);

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
  const enquiryId = searchParams.get('enquiry');
  if (enquiryId && enquiries.length > 0) {
    setActiveTab('enquiries');
    const element = document.getElementById(`enquiry-${enquiryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}, [searchParams, enquiries]);

  const calculateStats = () => {
    const totalValue = savedProperties.reduce((sum, p) => sum + (p.price || 0), 0);
    
    const activeEnq = enquiries.filter(e => e.status === 'pending').length;
    
    const respondedEnq = enquiries.filter(e => e.status === 'accepted' || e.status === 'rejected').length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const viewedThisWeek = recentlyViewed.filter(item => new Date(item.viewedAt) > oneWeekAgo).length;
    
    const avgPrice = savedProperties.length > 0 ? totalValue / savedProperties.length : 0;
    
    const locationCount = {};
    recentlyViewed.forEach(item => {
      if (item.location) {
        locationCount[item.location] = (locationCount[item.location] || 0) + 1;
      }
    });
    const mostViewedLocation = Object.keys(locationCount).reduce((a, b) => 
      locationCount[a] > locationCount[b] ? a : b, 'N/A');
    
    const typeCount = {};
    recentlyViewed.forEach(item => {
      if (item.type) {
        typeCount[item.type] = (typeCount[item.type] || 0) + 1;
      }
    });
    const topPropertyType = Object.keys(typeCount).reduce((a, b) => 
      typeCount[a] > typeCount[b] ? a : b, 'N/A');
    
    setStats({
      totalSavedValue: totalValue,
      activeEnquiries: activeEnq,
      respondedEnquiries: respondedEnq,
      viewedThisWeek,
      averagePropertyPrice: avgPrice,
      mostViewedLocation,
      topPropertyType
    });
  };

  useEffect(() => {
    calculateStats();
  }, [savedProperties, enquiries, recentlyViewed]);

  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    }
  }, [searchParams, chats]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const { data } = await API.get('/chats');
      if (data.success) {
        setChats(data.chats || []);
        setUnreadCount(data.totalUnread || 0);
        
        const chatId = searchParams.get('chat');
        if (chatId) {
          const chat = data.chats.find(c => c._id === chatId);
          if (chat) {
            setSelectedChat(chat);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  };

  // Set up polling for new messages
  useEffect(() => {
    if (activeTab === 'chats') {
      const interval = setInterval(fetchChats, 350000); 
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Also refresh when coming back to the tab
  useEffect(() => {
    if (activeTab === 'chats') {
      fetchChats();
    }
  }, [activeTab]);

  const fetchEnquiries = async () => {
    try {
      setLoading(p => ({ ...p, enquiries: true }));
      const { data } = await API.get('/enquiries/buyer');
      if (data.success) setEnquiries(data.enquiries || []);
    } catch { toast.error("Failed to load enquiries"); }
    finally { setLoading(p => ({ ...p, enquiries: false })); }
  };

  const formatPrice = (price) => {
    if (!price) return "Price on Request";
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000)   return `₹ ${(price / 100000).toFixed(2)} Lac`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const handleDeleteChat = (deletedChatId) => {
    setChats(prevChats => prevChats.filter(chat => chat._id !== deletedChatId));
    setSelectedChat(null);
    toast.success("Chat removed from list");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const diff = Math.ceil(Math.abs(new Date() - new Date(dateString)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7)   return `${diff} days ago`;
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const fetchSavedProperties = () => {
    if (!user?._id) return;
    const key = `savedProperties_${user._id}`;
    setSavedProperties(JSON.parse(localStorage.getItem(key) || '[]'));
    setLoading(p => ({ ...p, saved: false }));
  };

  const fetchRecentlyViewed = () => {
    if (!user?._id) return;
    const key = `recentlyViewed_${user._id}`;
    setRecentlyViewed(JSON.parse(localStorage.getItem(key) || '[]'));
    setLoading(p => ({ ...p, viewed: false }));
  };

  useEffect(() => { 
    if (user) {
      fetchSavedProperties(); 
      fetchRecentlyViewed(); 
      fetchEnquiries(); 
    }
  }, [user]);

  const removeFromSaved = (id) => {
    if (!user?._id) return;
    const key = `savedProperties_${user._id}`;
    const updated = savedProperties.filter(p => p._id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setSavedProperties(updated);
    toast.success("Removed from saved");
  };

  const clearRecentlyViewed = () => {
    if (!user?._id) return;
    const key = `recentlyViewed_${user._id}`;
    localStorage.setItem(key, '[]');
    setRecentlyViewed([]);
    toast.success("Recently viewed cleared");
  };

  const markEnquiryAsRead = async (id) => {
    try {
      await API.patch(`/enquiries/${id}/read`);
      setEnquiries(p => p.map(e => e._id === id ? { ...e, readByBuyer: true } : e));
    } catch {}
  };

  const handleTabChange = (id) => { 
    setActiveTab(id); 
    navigate(`/buyer?tab=${id}`);
  };

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http')) return imagePath;
  
  if (imagePath.startsWith('/uploads')) {
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  }
  
  if (imagePath.startsWith('uploads/')) {
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  }
  
  return imagePath;
};

  const sidebarItems = [
    { id: "overview",   name: "Overview",           Icon: ChartBarIcon,          count: 0 },
    { id: "saved",      name: "Saved Properties",   Icon: BookmarkIcon,          count: savedProperties.length },
    { id: "enquiries",  name: "My Enquiries",       Icon: PaperAirplaneIcon,     count: enquiries.filter(e => !e.readByBuyer).length },
    { id: "viewed",     name: "Recently Viewed",    Icon: EyeIcon,               count: recentlyViewed.length },
    { id: "chats",      name: "Chat Box",           Icon: ChatBubbleLeftRightIcon, count: unreadCount },
  ];

  const statusConfig = {
    accepted: { color: '#8B7355', bg: 'rgba(139,115,85,0.1)', border: 'rgba(139,115,85,0.25)', label: '✓ Accepted' },
    rejected: { color: '#C4503C', bg: 'rgba(196,80,60,0.08)', border: 'rgba(196,80,60,0.2)',  label: '✗ Declined' },
    pending:  { color: '#A89880', bg: 'rgba(168,152,128,0.1)', border: 'rgba(168,152,128,0.2)', label: 'Pending'   },
  };

  const EmptyState = ({ Icon, message, linkTo, linkLabel }) => (
    <div style={{ background: 'white', borderRadius: 2, padding: '56px 32px', textAlign: 'center', border: '1px solid rgba(139,115,85,0.1)' }}>
      <div style={{ width: 56, height: 56, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Icon style={{ width: 22, height: 22, color: '#C4A97A', opacity: 0.6 }} />
      </div>
      <p className="bd-sans" style={{ color: '#8B7355', fontSize: '0.875rem', marginBottom: linkTo ? 20 : 0 }}>{message}</p>
      {linkTo && (
        <Link to={linkTo} className="bd-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>{linkLabel}</Link>
      )}
    </div>
  );

  // Overview Tab Component
  const OverviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 2, padding: '20px', border: '1px solid rgba(139,115,85,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(139,115,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookmarkIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
            </div>
            <CurrencyRupeeIcon style={{ width: 16, height: 16, color: '#8B7355' }} />
          </div>
          <h3 className="bd-serif" style={{ fontSize: '1.8rem', fontWeight: 500, color: '#1E1C18', marginBottom: 4 }}>{savedProperties.length}</h3>
          <p className="bd-sans" style={{ fontSize: '0.7rem', color: '#8B7355', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Saved Properties</p>
          <p className="bd-sans" style={{ fontSize: '0.65rem', color: '#A89880', marginTop: 8 }}>Total value: {formatPrice(stats.totalSavedValue)}</p>
        </div>

        <div style={{ background: 'white', borderRadius: 2, padding: '20px', border: '1px solid rgba(139,115,85,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(139,115,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PaperAirplaneIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
            </div>
          </div>
          <h3 className="bd-serif" style={{ fontSize: '1.8rem', fontWeight: 500, color: '#1E1C18', marginBottom: 4 }}>{enquiries.length}</h3>
          <p className="bd-sans" style={{ fontSize: '0.7rem', color: '#8B7355', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Enquiries</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: '0.65rem', color: '#8B7355' }}>Active: {stats.activeEnquiries}</span>
            <span style={{ fontSize: '0.65rem', color: '#8B7355' }}>Responded: {stats.respondedEnquiries}</span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 2, padding: '20px', border: '1px solid rgba(139,115,85,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(139,115,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EyeIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
            </div>
          </div>
          <h3 className="bd-serif" style={{ fontSize: '1.8rem', fontWeight: 500, color: '#1E1C18', marginBottom: 4 }}>{recentlyViewed.length}</h3>
          <p className="bd-sans" style={{ fontSize: '0.7rem', color: '#8B7355', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Properties Viewed</p>
          <p className="bd-sans" style={{ fontSize: '0.65rem', color: '#A89880', marginTop: 8 }}>{stats.viewedThisWeek} viewed this week</p>
        </div>

        <div style={{ background: 'white', borderRadius: 2, padding: '20px', border: '1px solid rgba(139,115,85,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(139,115,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChatBubbleLeftRightIcon style={{ width: 20, height: 20, color: '#8B7355' }} />
            </div>
          </div>
          <h3 className="bd-serif" style={{ fontSize: '1.8rem', fontWeight: 500, color: '#1E1C18', marginBottom: 4 }}>{chats.length}</h3>
          <p className="bd-sans" style={{ fontSize: '0.7rem', color: '#8B7355', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Chats</p>
          {unreadCount > 0 && (
            <p className="bd-sans" style={{ fontSize: '0.65rem', color: '#C4503C', marginTop: 8 }}>{unreadCount} unread messages</p>
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Property Insights */}
        <div style={{ background: 'white', borderRadius: 2, padding: '24px', border: '1px solid rgba(139,115,85,0.1)' }}>
          <h3 className="bd-sans" style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 16 }}>
            Property Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(139,115,85,0.08)' }}>
              <span className="bd-sans" style={{ fontSize: '0.75rem', color: '#6B6355' }}>Avg. Price (Saved)</span>
              <span className="bd-serif" style={{ fontSize: '1rem', fontWeight: 500, color: '#1E1C18' }}>{formatPrice(stats.averagePropertyPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(139,115,85,0.08)' }}>
              <span className="bd-sans" style={{ fontSize: '0.75rem', color: '#6B6355' }}>Most Viewed Location</span>
              <span className="bd-sans" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#8B7355' }}>{stats.mostViewedLocation}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="bd-sans" style={{ fontSize: '0.75rem', color: '#6B6355' }}>Top Property Type</span>
              <span className="bd-sans" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#8B7355' }}>{stats.topPropertyType}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div style={{ background: 'white', borderRadius: 2, padding: '24px', border: '1px solid rgba(139,115,85,0.1)' }}>
          <h3 className="bd-sans" style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 16 }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...enquiries, ...recentlyViewed.map(v => ({ ...v, type: 'viewed' }))]
              .sort((a, b) => new Date(b.createdAt || b.viewedAt || 0) - new Date(a.createdAt || a.viewedAt || 0))
              .slice(0, 4)
              .map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 2, background: 'rgba(139,115,85,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.property ? (
                      <PaperAirplaneIcon style={{ width: 14, height: 14, color: '#8B7355' }} />
                    ) : (
                      <EyeIcon style={{ width: 14, height: 14, color: '#8B7355' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="bd-sans" style={{ fontSize: '0.8rem', color: '#1E1C18', marginBottom: 2 }}>
                      {item.property?.title || item.title || 'Property Activity'}
                    </p>
                    <p className="bd-sans" style={{ fontSize: '0.65rem', color: '#A89880' }}>
                      {item.type === 'viewed' ? 'Viewed' : 'Enquired'} • {formatDate(item.createdAt || item.viewedAt)}
                    </p>
                  </div>
                  <ChevronRightIcon style={{ width: 14, height: 14, color: '#C4A97A' }} />
                </div>
              ))}
            {enquiries.length === 0 && recentlyViewed.length === 0 && (
              <p className="bd-sans" style={{ fontSize: '0.78rem', color: '#A89880', textAlign: 'center', padding: '20px 0' }}>
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'linear-gradient(135deg, #1E1C18 0%, #2C2A26 100%)', borderRadius: 2, padding: '28px 32px', marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 className="bd-serif" style={{ fontSize: '1.2rem', fontWeight: 400, color: '#F5F0E8', marginBottom: 6 }}>
              Ready to find your dream home?
            </h3>
            <p className="bd-sans" style={{ fontSize: '0.75rem', color: '#6B6355' }}>
              Explore new properties and connect with sellers
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/properties" className="bd-btn-primary" style={{ background: '#F5F0E8', color: '#1E1C18', textDecoration: 'none' }}>
              Explore Properties
            </Link>
            <button 
              onClick={() => handleTabChange('saved')}
              className="bd-btn-primary" 
              style={{ background: 'transparent', border: '1px solid rgba(196,169,122,0.3)', color: '#C4A97A' }}
            >
              View Saved
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .bd-sans  { font-family: 'DM Sans', sans-serif; }
        .bd-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .bd-nav-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border: none; background: transparent;
          border-radius: 2px; cursor: pointer; text-align: left;
          transition: background 0.2s ease;
        }
        .bd-nav-item:hover { background: rgba(139,115,85,0.06); }
        .bd-nav-item.active { background: #1E1C18; }

        .bd-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1E1C18; color: #F5F0E8;
          border: none; padding: 10px 22px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
          cursor: pointer; transition: background 0.25s ease, letter-spacing 0.25s ease;
          text-decoration: none;
        }
        .bd-btn-primary:hover { background: #2C2A26; letter-spacing: 0.16em; }

        .bd-btn-ghost {
          background: transparent; color: #C4503C;
          border: none; padding: 0;
          font-family: 'DM Sans', sans-serif; font-size: 0.68rem;
          letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500;
          cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
          transition: color 0.2s ease;
        }
        .bd-btn-ghost:hover { color: #A03020; }

        .bd-card {
          background: white; border: 1px solid rgba(139,115,85,0.12);
          border-radius: 2px; overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .bd-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.08); }
        .bd-card:hover .bd-card-img { transform: scale(1.05); }
        .bd-card-img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }

        .bd-enq-card {
          background: white; border: 1px solid rgba(139,115,85,0.12);
          border-radius: 2px; padding: 20px 24px; cursor: pointer;
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .bd-enq-card:hover { border-color: rgba(139,115,85,0.3); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .bd-stat-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 0; border-bottom: 1px solid rgba(139,115,85,0.08);
        }
        .bd-stat-row:last-child { border-bottom: none; padding-bottom: 0; }

        .bd-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.5rem; font-weight: 400; color: #1E1C18;
          letter-spacing: -0.02em;
        }

        @keyframes bd-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .bd-skeleton { background: #EDE8DC; border-radius: 2px; animation: bd-pulse 1.4s ease infinite; }
      `}</style>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 260, background: 'white', borderRight: '1px solid rgba(139,115,85,0.12)', display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0 }}>

          {/* Header */}
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(139,115,85,0.1)' }}>
            <div className="bd-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A89880', marginBottom: 4 }}>Dashboard</div>
            <h1 className="bd-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18', letterSpacing: '-0.02em' }}>
              Buyer <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Portal</em>
            </h1>
          </div>

          {/* Nav */}
          <nav style={{ padding: '12px 12px', flex: 1 }}>
            {sidebarItems.map(({ id, name, Icon, count }) => (
              <button key={id} className={`bd-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => handleTabChange(id)}>
                <div style={{ width: 30, height: 30, border: `1px solid ${activeTab === id ? 'rgba(196,169,122,0.3)' : 'rgba(139,115,85,0.2)'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 13, height: 13, color: activeTab === id ? '#C4A97A' : '#8B7355' }} />
                </div>
                <span className="bd-sans" style={{ fontSize: '0.82rem', fontWeight: 500, color: activeTab === id ? '#F5F0E8' : '#2C2A26', flex: 1 }}>{name}</span>
                {count > 0 && (
                  <span className="bd-sans" style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.08em', background: id === 'enquiries' ? 'rgba(196,80,60,0.15)' : 'rgba(139,115,85,0.15)', color: id === 'enquiries' ? '#C4503C' : (activeTab === id ? '#C4A97A' : '#8B7355'), padding: '2px 7px', borderRadius: 2 }}>
                    {count}
                  </span>
                )}
                <ChevronRightIcon style={{ width: 12, height: 12, color: activeTab === id ? '#C4A97A' : '#C4B9A8', flexShrink: 0 }} />
              </button>
            ))}
          </nav>

          {/* Saved value strip */}
          <div style={{ margin: '0 12px 16px', background: '#1E1C18', borderRadius: 2, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, border: '1px solid rgba(196,169,122,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div className="bd-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Total Saved Value</div>
            <div className="bd-serif" style={{ fontSize: '1.4rem', fontWeight: 500, color: '#C4A97A', lineHeight: 1 }}>
              {formatPrice(stats.totalSavedValue)}
            </div>
            <div className="bd-sans" style={{ fontSize: '0.68rem', color: '#6B6355', marginTop: 4, fontWeight: 300 }}>{savedProperties.length} properties</div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, padding: '36px 36px 60px', overflowY: 'auto' }}>

          {/* Welcome header */}
          <div style={{ marginBottom: 32 }}>
            <div className="bd-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Welcome back</div>
            <h2 className="bd-serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 300, color: '#1E1C18', letterSpacing: '-0.02em' }}>
              {user?.name || 'Buyer'}<em style={{ fontStyle: 'italic', color: '#8B7355' }}>.</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>

            {/* ── LEFT: Tab content ── */}
            <div>

              {/* Section header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                <h3 className="bd-section-title">
                  {activeTab === 'overview' && <>Dashboard <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Overview</em></>}
                  {activeTab === 'saved'     && <>Saved <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Properties</em> <span className="bd-sans" style={{ fontSize: '0.78rem', color: '#A89880', fontStyle: 'normal', letterSpacing: '0.04em' }}>({savedProperties.length})</span></>}
                  {activeTab === 'enquiries' && <>My <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Enquiries</em> <span className="bd-sans" style={{ fontSize: '0.78rem', color: '#A89880', fontStyle: 'normal', letterSpacing: '0.04em' }}>({enquiries.length})</span></>}
                  {activeTab === 'viewed'    && <>Recently <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Viewed</em> <span className="bd-sans" style={{ fontSize: '0.78rem', color: '#A89880', fontStyle: 'normal', letterSpacing: '0.04em' }}>({recentlyViewed.length})</span></>}
                  {activeTab === 'chats'     && <>Chat <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Messages</em></>}
                </h3>
                {activeTab === 'viewed' && recentlyViewed.length > 0 && (
                  <button className="bd-btn-ghost" onClick={clearRecentlyViewed}>Clear All</button>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && <OverviewTab />}
              
              {/* Existing tabs - Saved, Enquiries, Viewed, Chats remain the same */}
              {activeTab === 'saved' && (
                savedProperties.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {savedProperties.map(p => (
  <div key={p._id} className="bd-card">
    <div style={{ aspectRatio: '16/10', background: '#EDE8DC', overflow: 'hidden', position: 'relative' }}>
      {p.image ? (
        <img 
          src={getImageUrl(p.image)} 
          alt={p.title} 
          className="bd-card-img" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HomeIcon style={{ width: 32, height: 32, color: '#C4A97A', opacity: 0.4 }} />
        </div>
      )}
      <button 
        onClick={() => removeFromSaved(p._id)} 
        style={{ position: 'absolute', top: 10, right: 10, background: 'white', border: 'none', width: 30, height: 30, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <HeartSolid style={{ width: 14, height: 14, color: '#C4503C' }} />
      </button>
    </div>
    
    <div style={{ padding: '16px 18px' }}>
      <Link to={`/property/${p._id}`} style={{ textDecoration: 'none' }}>
        <h4 className="bd-sans" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1C18', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.title}
        </h4>
      </Link>
      
      <p className="bd-sans" style={{ fontSize: '0.72rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <MapPinIcon style={{ width: 10, height: 10 }} /> {p.location}
      </p>
      
      {/* Add description section */}
      {p.description && (
        <p className="bd-sans" style={{ 
          fontSize: '0.7rem', 
          color: '#6B6355', 
          lineHeight: 1.4, 
          marginBottom: 12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          height: '2.8em'
        }}>
          {p.description.length > 100 ? `${p.description.substring(0, 100)}...` : p.description}
        </p>
      )}
      
      {/* Optional: Add bedrooms/bathrooms/area info */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {p.bedrooms && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaBed style={{ fontSize: '0.6rem', color: '#8B7355' }} />
            <span className="bd-sans" style={{ fontSize: '0.65rem', color: '#8B7355' }}>{p.bedrooms} BHK</span>
          </div>
        )}
        {p.bathrooms && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaBath style={{ fontSize: '0.6rem', color: '#8B7355' }} />
            <span className="bd-sans" style={{ fontSize: '0.65rem', color: '#8B7355' }}>{p.bathrooms} Bath</span>
          </div>
        )}
        {p.area && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <BuildingOfficeIcon style={{ width: 10, height: 10, color: '#8B7355' }} />
            <span className="bd-sans" style={{ fontSize: '0.65rem', color: '#8B7355' }}>{p.area} sq.ft</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 12, borderTop: '1px solid rgba(139,115,85,0.08)' }}>
        <div>
          <div className="bd-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginBottom: 1 }}>
            Price
          </div>
          <div className="bd-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#1E1C18' }}>
            {formatPrice(p.price)}
          </div>
        </div>
        <Link 
          to={`/property/${p._id}`} 
          style={{ 
            width: 32, height: 32, 
            border: '1px solid rgba(139,115,85,0.3)', 
            borderRadius: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textDecoration: 'none', 
            transition: 'all 0.2s ease', 
            color: '#8B7355' 
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.background = '#1E1C18'; 
            e.currentTarget.style.borderColor = '#1E1C18'; 
            e.currentTarget.querySelector('svg').style.color = '#F5F0E8'; 
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.background = 'transparent'; 
            e.currentTarget.style.borderColor = 'rgba(139,115,85,0.3)'; 
            e.currentTarget.querySelector('svg').style.color = '#8B7355'; 
          }}
        >
          <ChevronRightIcon style={{ width: 14, height: 14, color: '#8B7355' }} />
        </Link>
      </div>
    </div>
  </div>
))}
                  </div>
                ) : <EmptyState Icon={HeartOutline} message="No saved properties yet" linkTo="/properties" linkLabel="Explore Properties" />
              )}

              {/* Enquiries tab remains the same */}
              {activeTab === 'enquiries' && (
                loading.enquiries ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ background: 'white', borderRadius: 2, padding: 24, border: '1px solid rgba(139,115,85,0.1)' }}>
                        <div className="bd-skeleton" style={{ height: 14, width: '40%', marginBottom: 10 }} />
                        <div className="bd-skeleton" style={{ height: 11, width: '60%' }} />
                      </div>
                    ))}
                  </div>
                ) : enquiries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {enquiries.map(enq => {
                      const s = statusConfig[enq.status] || statusConfig.pending;
                      return (
                        <div key={enq._id} className="bd-enq-card" onClick={() => !enq.readByBuyer && markEnquiryAsRead(enq._id)}>
                          <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: '#EDE8DC', border: '1px solid rgba(139,115,85,0.1)' }}>
                              {/* {enq.property?.image
                                ? <img src={enq.property.image} alt={enq.property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HomeIcon style={{ width: 24, height: 24, color: '#C4A97A', opacity: 0.5 }} /></div>
                              } */}

                              {enq.property?.image ? (
  <img 
    src={getImageUrl(enq.property.image)} 
    alt={enq.property.title} 
    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    onError={e => { 
      e.target.onerror = null;
      e.target.src = 'https://via.placeholder.com/72x72?text=No+Image';
    }} 
  />
) : (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <HomeIcon style={{ width: 24, height: 24, color: '#C4A97A', opacity: 0.5 }} />
  </div>
)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <h4 className="bd-sans" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1C18' }}>{enq.property?.title || 'General Enquiry'}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  {!enq.readByBuyer && (
                                    <span className="bd-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(139,115,85,0.12)', color: '#8B7355', padding: '3px 8px', borderRadius: 2 }}>New</span>
                                  )}
                                  <span className="bd-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 8px', borderRadius: 2 }}>{s.label}</span>
                                </div>
                              </div>
                              {enq.property?.location && (
                                <p className="bd-sans" style={{ fontSize: '0.72rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                                  <MapPinIcon style={{ width: 10, height: 10 }} /> {enq.property.location}
                                </p>
                              )}
                              <div className="bd-sans" style={{ fontSize: '0.8rem', color: '#6B6355', background: '#F5F0E8', padding: '10px 14px', borderRadius: 2, borderLeft: '2px solid rgba(139,115,85,0.2)', marginBottom: 10, fontWeight: 300 }}>
                                {enq.message}
                              </div>
                              {enq.sellerResponse && (
                                <div style={{ marginBottom: 10 }}>
                                  <div className="bd-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Seller Response</div>
                                  <div className="bd-sans" style={{ fontSize: '0.8rem', color: '#2C2A26', background: 'rgba(139,115,85,0.06)', padding: '10px 14px', borderRadius: 2, borderLeft: '2px solid rgba(139,115,85,0.35)', fontWeight: 300 }}>
                                    {enq.sellerResponse}
                                  </div>
                                </div>
                              )}
                              {enq.status === 'accepted' && enq.seller && (
                                <div style={{ background: 'rgba(139,115,85,0.06)', border: '1px solid rgba(139,115,85,0.18)', borderRadius: 2, padding: '12px 16px', marginBottom: 10 }}>
                                  <div className="bd-sans" style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Seller Contact</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {[['Name', enq.seller.name], ['Email', enq.seller.email], ['Phone', enq.seller.phone]].filter(([, v]) => v).map(([k, v]) => (
                                      <div key={k} className="bd-sans" style={{ fontSize: '0.78rem', color: '#2C2A26' }}>
                                        <span style={{ color: '#8B7355' }}>{k}:</span> {v}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="bd-sans" style={{ fontSize: '0.65rem', color: '#A89880', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <ClockIcon style={{ width: 10, height: 10 }} /> {enq.timeAgo}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <EmptyState Icon={PaperAirplaneIcon} message="No enquiries yet" linkTo="/properties" linkLabel="Browse Properties" />
              )}

              {/* Viewed tab remains the same */}
              {activeTab === 'viewed' && (
                recentlyViewed.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentlyViewed.map(item => (
  <Link key={item._id} to={`/property/${item._id}`} style={{ textDecoration: 'none', display: 'flex', gap: 14, background: 'white', border: '1px solid rgba(139,115,85,0.1)', borderRadius: 2, padding: '14px 18px', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,115,85,0.3)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,115,85,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: 64, height: 64, borderRadius: 2, overflow: 'hidden', background: '#EDE8DC', flexShrink: 0 }}>
      {item.image ? (
        <img 
          src={getImageUrl(item.image)} 
          alt={item.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HomeIcon style={{ width: 20, height: 20, color: '#C4A97A', opacity: 0.5 }} />
        </div>
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 className="bd-sans" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E1C18', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                          <p className="bd-sans" style={{ fontSize: '0.72rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><MapPinIcon style={{ width: 10, height: 10 }} />{item.location}</p>
                          <p className="bd-sans" style={{ fontSize: '0.68rem', color: '#A89880', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 300 }}><ClockIcon style={{ width: 10, height: 10 }} />Viewed {formatDate(item.viewedAt)}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="bd-sans" style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89880', marginBottom: 2 }}>Price</div>
                          <div className="bd-serif" style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1E1C18' }}>{formatPrice(item.price)}</div>
                        </div>
  </Link>
))}
                  </div>
                ) : <EmptyState Icon={EyeIcon} message="No recently viewed properties" />
              )}

              {/* Chats tab remains the same */}
              {activeTab === 'chats' && (
                selectedChat ? (
                  <ChatInterface
                    chatId={selectedChat._id}
                    property={selectedChat.property}
                    onClose={() => setSelectedChat(null)}
                    onDelete={handleDeleteChat}
                  />
                ) : (
                  loadingChats ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ background: 'white', borderRadius: 2, padding: 20, border: '1px solid rgba(139,115,85,0.1)' }}>
                          <div className="bd-skeleton" style={{ height: 14, width: '40%', marginBottom: 10 }} />
                          <div className="bd-skeleton" style={{ height: 11, width: '60%' }} />
                        </div>
                      ))}
                    </div>
                  ) : chats.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {chats.map(chat => {
                        const otherParticipant = chat.participants.find(p => p._id !== user?._id);
                        const lastMessage = chat.lastMessage;
                        
                        return (
                          <div
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            style={{
                              background: 'white',
                              border: '1px solid rgba(139,115,85,0.1)',
                              borderRadius: 2,
                              padding: 16,
                              cursor: 'pointer',
                              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'rgba(139,115,85,0.3)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(139,115,85,0.1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{ display: 'flex', gap: 12 }}>
                              <div style={{ width: 60, height: 60, borderRadius: 2, overflow: 'hidden', background: '#EDE8DC', flexShrink: 0 }}>
                                {chat.property?.images?.[0] ? (
  <img
    src={getImageUrl(chat.property.images[0])}
    alt={chat.property.title}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
    }}
  />
) : (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <HomeIcon style={{ width: 20, height: 20, color: '#C4A97A', opacity: 0.5 }} />
  </div>
)}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <h4 className="bd-sans" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E1C18', marginBottom: 2 }}>
                                      {chat.property?.title}
                                    </h4>
                                    <p className="bd-sans" style={{ fontSize: '0.72rem', color: '#8B7355' }}>
                                      Chat with {otherParticipant?.name}
                                    </p>
                                  </div>
                                  {chat.unreadCount > 0 && (
                                    <span style={{
                                      background: '#C4503C',
                                      color: 'white',
                                      fontSize: '0.65rem',
                                      padding: '2px 6px',
                                      borderRadius: 2,
                                      minWidth: 18,
                                      textAlign: 'center'
                                    }}>
                                      {chat.unreadCount}
                                    </span>
                                  )}
                                </div>

                                {lastMessage && (
                                  <div style={{ marginTop: 8 }}>
                                    <p className="bd-sans" style={{ fontSize: '0.78rem', color: '#6B6355', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {lastMessage.content}
                                    </p>
                                    <p className="bd-sans" style={{ fontSize: '0.6rem', color: '#A89880', marginTop: 2 }}>
                                      {new Date(lastMessage.createdAt).toLocaleString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      Icon={ChatBubbleLeftRightIcon}
                      message="No chats yet. Start a conversation by contacting a property owner!"
                      linkTo="/properties"
                      linkLabel="Browse Properties"
                    />
                  )
                )
              )}
            </div>


          </div>
        </main>
      </div>
    </div>
  );
}
