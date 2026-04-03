import { useState, useEffect, useContext } from "react"; 
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; 
import API from "../../api/axios";
import ReviewModal from "../../components/ReviewModel";
import { 
  FaHome, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, 
  FaArrowLeft, FaHeart, FaShare, FaPhone, FaEnvelope,
  FaCheckCircle, FaCalendarAlt, FaUserTie,
  FaStar, FaStarHalfAlt, FaRegStar, FaWifi, FaCar, FaSwimmingPool,
  FaDumbbell, FaShieldAlt, FaBolt, FaTree, FaCamera, FaVideo,
  FaTshirt, FaFire, FaUserCircle, FaTimes, FaSpinner,FaArrowUp,FaTint,
  FaTrash,FaBuilding,FaChild, FaFutbol , FaBasketballBall ,FaCompass ,FaCloudRain, 
  FaRecycle , FaGlassCheers  
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdBalcony, MdSecurity, MdKitchen, MdPets, MdAcUnit } from "react-icons/md";
import toast from "react-hot-toast";
import PropertyMap from "../../components/PropertyMap";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('exterior');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);

  const [roomImages, setRoomImages] = useState({
    exterior: [],
    bedroom: [],
    bathroom: [],
    livingRoom: [],
    diningRoom: [],
    kitchen: []
  });
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [propertyReviews, setPropertyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [reviewsPagination, setReviewsPagination] = useState({
  page: 1,
  total: 0,
  pages: 0
});
const [ratingDistribution, setRatingDistribution] = useState({
  counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
});
const [showReviewModal, setShowReviewModal] = useState(false);

  const fallbackImages = {
    exterior: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    bedroom: "https://photos.zillowstatic.com/fp/7f44e4e347422aa58fc38f4203f87220-p_e.webp",
    bathroom: "https://photos.zillowstatic.com/fp/c7d8a14fd086237d365e08b2daa2c536-p_e.webp",
    livingRoom: "https://photos.zillowstatic.com/fp/e1a4e6de87b53a2079a3e9fd8fec9610-p_e.webp",
    diningRoom: "https://photos.zillowstatic.com/fp/05c92e3d13db08d80857de5e845e417a-p_e.webp",
    kitchen: "https://photos.zillowstatic.com/fp/ed1b949345f45b614fcee15f1d026db3-p_e.webp"
  };

  const getIconForType = (type) => {
    const iconMap = {
      'restaurant':'🍽️','cafe':'☕','hospital':'🏥','clinic':'🏥',
      'pharmacy':'💊','school':'🏫','college':'🎓','university':'🏛️',
      'mall':'🛍️','supermarket':'🛒','park':'🌳','bank':'🏦',
      'atm':'💳','transport':'🚂','gym':'💪','hotel':'🏨','place':'📍'
    };
    return iconMap[type] || '📍';
  };


const openLightbox = (image, index) => {
  setLightboxImage(image);
  setLightboxIndex(index);
  setLightboxOpen(true);
};

const navigateLightbox = (direction) => {
  const currentRoomImages = roomImages[selectedRoom] || [];
  const totalImages = currentRoomImages.length;
  
  if (direction === 'next') {
    const newIndex = (lightboxIndex + 1) % totalImages;
    setLightboxIndex(newIndex);
    setLightboxImage(currentRoomImages[newIndex]);
  } else {
    const newIndex = (lightboxIndex - 1 + totalImages) % totalImages;
    setLightboxIndex(newIndex);
    setLightboxImage(currentRoomImages[newIndex]);
  }
};

useEffect(() => {
  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') {
      setLightboxOpen(false);
    } else if (e.key === 'ArrowRight') {
      navigateLightbox('next');
    } else if (e.key === 'ArrowLeft') {
      navigateLightbox('prev');
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [lightboxOpen, lightboxIndex, selectedRoom, roomImages]);

  const fetchNearbyPlaces = async () => {
    if (!property) return;
    setNearbyLoading(true);
    try {
      const response = await API.get(`/properties/${id}/nearby`);
      if (response.data.success && response.data.places?.length > 0) {
        const formattedPlaces = response.data.places.map(place => ({
          ...place,
          coordinates: place.coordinates ? { lat: place.coordinates.lat, lng: place.coordinates.lng } : null,
          icon: place.icon || getIconForType(place.type)
        }));
        setNearbyPlaces(formattedPlaces);
      } else {
        setNearbyPlaces([]);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      setNearbyPlaces([]);
    } finally {
      setNearbyLoading(false);
    }
  };

useEffect(() => {
  if (property) {
    console.log("Property images:", property.images);
    console.log("Property roomImages:", property.roomImages);
    
    let organized = {
      exterior: [],
      bedroom: [],
      bathroom: [],
      livingRoom: [],
      diningRoom: [],
      kitchen: []
    };
    
    if (property.roomImages && Object.keys(property.roomImages).some(key => property.roomImages[key]?.length > 0)) {
      organized = {
        exterior: property.roomImages?.exterior || [],
        bedroom: property.roomImages?.bedroom || [],
        bathroom: property.roomImages?.bathroom || [],
        livingRoom: property.roomImages?.livingRoom || [],
        diningRoom: property.roomImages?.diningRoom || [],
        kitchen: property.roomImages?.kitchen || []
      };
      
      if (organized.exterior.length === 0 && property.images?.length > 0) {
        organized.exterior = property.images;
      }
    } 
    else if (property.images?.length > 0) {
      organized.exterior = property.images;
      
      if (property.images.length > 1) {
        const remainingImages = property.images.slice(1);
        const rooms = ['bedroom', 'bathroom', 'livingRoom', 'diningRoom', 'kitchen'];
        
        remainingImages.forEach((img, index) => {
          const roomIndex = index % rooms.length;
          organized[rooms[roomIndex]].push(img);
        });
      }
    }
    
    if (organized.exterior.length === 0) {
      organized.exterior = [fallbackImages.exterior];
    }
    
    ['bedroom', 'bathroom', 'livingRoom', 'diningRoom', 'kitchen'].forEach(room => {
      if (organized[room].length === 0) {
        organized[room] = [fallbackImages[room]];
      }
    });
    
    console.log("Organized room images:", organized);
    setRoomImages(organized);
    checkIfSaved();
    addToRecentlyViewed();
  }
}, [property]);


const checkIfSaved = () => {
  if (!user?._id || !property) return;
  const key = `savedProperties_${user._id}`;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  setIsSaved(saved.some(item => item._id === property._id));
};

const toggleSaved = () => {
  if (!property || !user?._id) return;
  const key = `savedProperties_${user._id}`;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  
  if (isSaved) {
    localStorage.setItem(key, JSON.stringify(saved.filter(item => item._id !== property._id)));
    setIsSaved(false);
    toast.success('Removed from saved properties');
  } else {
    saved.push({ 
      _id: property._id, 
      title: property.title, 
      price: property.price, 
      location: property.location, 
      image: property.images?.[0] || fallbackImages.exterior, 
      bedrooms: property.bedrooms, 
      bathrooms: property.bathrooms, 
      area: property.area 
    });
    localStorage.setItem(key, JSON.stringify(saved));
    setIsSaved(true);
    toast.success('Added to saved properties');
  }
};

const addToRecentlyViewed = () => {
  if (!property || !user?._id) return;
  const key = `recentlyViewed_${user._id}`;
  const viewed = JSON.parse(localStorage.getItem(key) || '[]');
  const filtered = viewed.filter(v => v._id !== property._id);
  filtered.unshift({ 
    _id: property._id, 
    title: property.title, 
    price: property.price, 
    location: property.location, 
    image: property.images?.[0] || fallbackImages.exterior, 
    viewedAt: new Date().toISOString() 
  });
  localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)));
};

useEffect(() => {
  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/properties/${id}`);
      setProperty(data);
      
      console.log("Property from API:", data);
      
      if (data) { 
        fetchSimilarProperties(data.type, data.location, data._id); 
        fetchPropertyReviews(data._id); 
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Failed to load property details");
      navigate("/properties");
    } finally {
      setLoading(false);
    }
  };
  fetchProperty();
}, [id, navigate]);


  useEffect(() => {
    if (property && activeTab === "nearby") fetchNearbyPlaces();
  }, [property, activeTab]);

  const fetchSimilarProperties = async (type, location, currentId) => {
    try {
      setSimilarLoading(true);
      const { data } = await API.get("/properties");
      setSimilarProperties(data.filter(p => p._id !== currentId).filter(p => p.type === type || p.location === location).slice(0, 3));
    } catch (error) {
      setSimilarProperties([]);
    } finally {
      setSimilarLoading(false);
    }
  };

  
  const fetchPropertyReviews = async (propertyId, page = 1) => {
  try {
    setReviewsLoading(true);
    const { data } = await API.get(`/reviews/property/${propertyId}?page=${page}&limit=5`);
    
    if (data.success) {
      setPropertyReviews(data.reviews);
      setReviewsPagination(data.pagination);
      setRatingDistribution({
        counts: data.ratingDistribution.counts,
        percentages: data.ratingDistribution.percentages
      });
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    setPropertyReviews([]);
    setRatingDistribution({
      counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
  } finally {
    setReviewsLoading(false);
  }
};

const handleReviewSubmitted = (newReview) => {
  setPropertyReviews(prev => [newReview, ...prev]);
  fetchPropertyReviews(property._id);
};

const loadMoreReviews = () => {
  if (reviewsPagination.page < reviewsPagination.pages) {
    fetchPropertyReviews(property._id, reviewsPagination.page + 1);
  }
};

const averageRating = property?.averageRating || 
  (propertyReviews.length > 0 
    ? (propertyReviews.reduce((acc, r) => acc + r.rating, 0) / propertyReviews.length).toFixed(1) 
    : 0);

const totalReviews = property?.totalReviews || propertyReviews.length;

// Add this function
const handlePurchaseProperty = async () => {
  if (!user) {
    toast.error("Please login to purchase");
    navigate("/purpose?type=register", { state: { from: `/property/${id}` } });
    return;
  }
  
  if (user.role !== 'seller') {
    toast.error("Only sellers can purchase properties");
    return;
  }

  if (!property?.builder) {
    toast.error("This property cannot be purchased");
    return;
  }

  if (property.status !== 'available') {
    toast.error("This property is not available for purchase");
    return;
  }

  setPurchasing(true);
  try {
    const response = await API.post(`/seller/properties/purchased/purchase/${id}`);
    
    if (response.data.success) {
      toast.success("Property purchased successfully!");
      // Refresh property details
      const { data } = await API.get(`/properties/${id}`);
      setProperty(data);
      
      setTimeout(() => {
        navigate('/seller?tab=properties');
      }, 2000);
    }
  } catch (error) {
    console.error("Error purchasing property:", error);
    toast.error(error.response?.data?.message || "Failed to purchase property");
  } finally {
    setPurchasing(false);
  }
};

  const handleContactOwner = () => {
    if (!user) { toast.error("Please login to contact the owner"); navigate("/purpose?type=register", { state: { from: `/property/${id}` } }); return; }
    if (user.role === "seller") { toast.error("Sellers cannot contact other sellers"); return; }
    setShowContactModal(true);
  };

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    if (!message.trim()) { toast.error("Please enter a message"); return; }
    setSending(true);
    try {
      const response = await API.post('/enquiries', { propertyId: id, message: message.trim() });
      if (response.data.success) {
        toast.success("Message sent to owner!");
        setShowContactModal(false);
        setMessage("");
        setTimeout(() => navigate("/buyer?tab=enquiries&enquiry=sent"), 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };


const handleStartChat = async () => {
  if (!user) {
    toast.error("Please login to chat with the owner");
    navigate("/purpose?type=register", { state: { from: `/property/${id}` } });
    return;
  }
  
  if (user.role === "seller") {
    if (property.seller?._id === user._id) {
      toast.error("You cannot chat with yourself");
      return;
    }
    toast.error("Sellers cannot chat with other sellers");
    return;
  }

  if (!property?.seller?._id) {
    toast.error("Seller information not available");
    return;
  }

  try {
    setSending(true);
    console.log("Creating chat with seller:", property.seller._id);

    const response = await API.post('/chats', {
      propertyId: id,
      otherUserId: property.seller._id
    });

    console.log("Chat response:", response.data);

    if (response.data.success) {
      toast.success("Chat started successfully!");
      
      if (user.role === 'buyer') {
         navigate('/buyer?tab=chats');
      } else if (user.role === 'builder') {
        navigate(`/builder?tab=chats&chat=${response.data.chat._id}`);
      }
    }
  } catch (error) {
    console.error("Error starting chat:", error);
    toast.error(error.response?.data?.message || "Failed to start chat");
  } finally {
    setSending(false);
  }
};

  const formatPrice = (price) => {
    if (!price) return "₹ On Request";
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lac`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const formatPricePerSqFt = (price, area) => {
    if (!price || !area) return "₹ --/sq.ft";
    return `₹ ${Math.round(price / area).toLocaleString('en-IN')}/sq.ft`;
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });

  const getFeatureIcon = (feature) => {
  if (!feature) return <FaCheckCircle />;
  
  const featureLower = feature.toLowerCase();
  
  const iconMap = {
    "swimming pool": <FaSwimmingPool />,
    "pool": <FaSwimmingPool />,
    "garden": <FaTree />,
    "parking": <FaCar />,
    "security": <MdSecurity />,
    "cctv": <FaVideo />,
    "power backup": <FaBolt />,
    "backup": <FaBolt />,
    "modular kitchen": <MdKitchen />,
    "kitchen": <MdKitchen />,
    "balcony": <MdBalcony />,
    "gym": <FaDumbbell />,
    "fitness": <FaDumbbell />,
    "wifi": <FaWifi />,
    "internet": <FaWifi />,
    "pet friendly": <MdPets />,
    "pets": <MdPets />,
    "fireplace": <FaFire />,
    "laundry": <FaTshirt />,
    "air conditioning": <MdAcUnit />,
    "ac": <MdAcUnit />,
    "lift": <FaArrowUp />,
    "elevator": <FaArrowUp />,
    "water supply": <FaTint />,
    "waste disposal": <FaTrash />,
    "club house": <FaBuilding />,
    "clubhouse": <FaBuilding />,
    "children's play area": <FaChild />,
    "play area": <FaChild />,
    "sports facility": <FaFutbol />,
    "tennis": <FaFutbol />,
    "basketball": <FaBasketballBall />,
    "intercom": <FaPhone />,
    "vaastu compliant": <FaCompass />,
    "vastu": <FaCompass />,
    "rain water harvesting": <FaCloudRain />,
    "sewage treatment": <FaRecycle />,
    "park": <FaTree />,
    "grape vineyard": <FaTree />,
    "well": <FaTint />,
    "wine cellar": <FaGlassCheers />,
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (featureLower.includes(key)) {
      return icon;
    }
  }
  
  return <FaCheckCircle />;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:5050${imagePath}`;
  }
  
  // Fallback
  return imagePath;
};

const getDisplayStatus = (status) => {
  if (status === 'sold') {
    return 'available';
  }
  return status || 'available';
};

  const currentRoomImages = roomImages[selectedRoom] || [];
  const currentImage = currentRoomImages[selectedImageIndex] || currentRoomImages[0] || fallbackImages[selectedRoom];

  const roomDisplayNames = {
    exterior: 'Exterior',
    bedroom: 'Bedroom',
    bathroom: 'Bathroom',
    livingRoom: 'Living Room',
    diningRoom: 'Dining Room',
    kitchen: 'Kitchen'
  };

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div style={{minHeight:'100vh', background:'#FAFAF8', padding:'64px 24px'}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
        <div style={{maxWidth:1200, margin:'0 auto'}}>
          <div style={{animation:'pulse 1.5s ease-in-out infinite'}}>
            <div style={{height:32, background:'#EDE8DC', borderRadius:2, width:'25%', marginBottom:32}} />
            <div style={{display:'grid', gridTemplateColumns:'3fr 1fr', gap:32}}>
              <div>
                <div style={{aspectRatio:'16/9', background:'#EDE8DC', borderRadius:2, marginBottom:16}} />
                <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8}}>
                  {[1,2,3,4,5].map(n => <div key={n} style={{height:80, background:'#EDE8DC', borderRadius:2}} />)}
                </div>
              </div>
              <div style={{height:500, background:'#EDE8DC', borderRadius:2}} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div style={{minHeight:'100vh', background:'#FAFAF8', fontFamily:"'DM Sans', sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pd-sans  { font-family: 'DM Sans', sans-serif; }
        .pd-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .pd-tab-btn {
          flex: 1;
          padding: 16px 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          border: none;
          background: none;
          cursor: pointer;
          position: relative;
          color: #8B7355;
          transition: color 0.25s ease;
        }
        .pd-tab-btn.active { color: #1E1C18; }
        .pd-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: #8B7355;
        }
        .pd-tab-btn:hover { color: #1E1C18; }

        .pd-stat-box {
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.15);
          border-radius: 2px;
          padding: 20px 16px;
          text-align: center;
        }

        .pd-btn-primary {
          width: 100%;
          background: #8B7355;
          color: #F5F0E8;
          border: none;
          padding: 14px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.25s ease;
          margin-bottom: 10px;
        }
        .pd-btn-primary:hover { background: #7A6445; }

        .pd-btn-ghost {
          width: 100%;
          background: transparent;
          color: #8B7355;
          border: 1px solid rgba(139,115,85,0.4);
          padding: 13px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.25s ease;
        }
        .pd-btn-ghost:hover { background: #F5F0E8; border-color: #8B7355; }

        .pd-img-thumb {
          aspect-ratio: 4/3;
          overflow: hidden;
          border: 1px solid transparent;
          border-radius: 2px;
          cursor: pointer;
          transition: border-color 0.2s ease;
          position: relative;
        }
        .pd-img-thumb.active { border-color: #8B7355; }
        .pd-img-thumb:hover { border-color: rgba(139,115,85,0.5); }

        .pd-nearby-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.12);
          border-radius: 2px;
          transition: box-shadow 0.25s ease;
        }
        .pd-nearby-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }

        .pd-amenity-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.12);
          border-radius: 2px;
        }

        .pd-similar-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .pd-similar-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .pd-similar-card:hover .pd-similar-img { transform: scale(1.06); }
        .pd-similar-img { transition: transform 0.6s ease; }

        .pd-save-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(139,115,85,0.35);
          background: transparent;
          color: #8B7355;
          transition: all 0.25s ease;
        }
        .pd-save-btn.saved { background: rgba(139,115,85,0.1); border-color: #8B7355; color: #C4855A; }
        .pd-save-btn:hover { background: rgba(139,115,85,0.08); }

        .pd-share-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(139,115,85,0.35);
          background: transparent;
          color: #8B7355;
          transition: all 0.25s ease;
        }
        .pd-share-btn:hover { background: rgba(139,115,85,0.08); }

        @keyframes pd-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* ── STICKY NAV BAR ── */}
      <div style={{
        background: 'rgba(245,240,232,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(139,115,85,0.15)',
        position: 'sticky', top: 0, zIndex: 30
      }}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:'0 24px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', height:56}}>
            <button
              onClick={() => navigate(-1)}
              style={{display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:'#8B7355', fontFamily:"'DM Sans',sans-serif", fontSize:'0.78rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500}}
            >
              <FaArrowLeft size={12} />
              Back
            </button>
            <div style={{display:'flex', gap:8}}>
              <button onClick={toggleSaved} className={`pd-save-btn ${isSaved ? 'saved' : ''}`}>
                <FaHeart size={12} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                className="pd-share-btn"
              >
                <FaShare size={12} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200, margin:'0 auto', padding:'48px 24px'}}>

        {/* ── TITLE & META ── */}
        <div style={{marginBottom:40}}>
          <div className="pd-sans" style={{fontSize:'0.65rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B7355', marginBottom:10}}>
            {property.type} &nbsp;·&nbsp; {property.location}
          </div>
          <h1 className="pd-serif" style={{fontSize:'clamp(2rem, 4vw, 3rem)', fontWeight:400, color:'#1E1C18', letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:14}}>
            {property.title}
          </h1>
          <div style={{display:'flex', flexWrap:'wrap', alignItems:'center', gap:20}}>
            <span className="pd-sans" style={{display:'flex', alignItems:'center', gap:6, color:'#8B7355', fontSize:'0.82rem'}}>
              <FaMapMarkerAlt size={12} />{property.location}
            </span>
            <span style={{width:1, height:14, background:'rgba(139,115,85,0.3)'}} />
            <span className="pd-sans" style={{display:'flex', alignItems:'center', gap:6, color:'#8B7355', fontSize:'0.82rem'}}>
              <FaCalendarAlt size={12} />Posted {property.createdAt ? formatDate(property.createdAt) : "Recently"}
            </span>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:32, alignItems:'start'}}>

          {/* LEFT */}
          <div>
            {/* Image Gallery with Room Thumbnails */}
            <div style={{marginBottom:32}}>

              {/* Main Image  */}
<div 
  style={{position:'relative', aspectRatio:'16/9', overflow:'hidden', borderRadius:2, marginBottom:8, cursor:'pointer'}}
  onClick={() => openLightbox(currentImage, selectedImageIndex)}
>
  <img
    src={getImageUrl(currentImage)}
    alt={`${roomDisplayNames[selectedRoom]} ${selectedImageIndex + 1}`}
    style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = fallbackImages[selectedRoom];
    }}
  />
  {/* Image counter - update to show click hint */}
  <div className="pd-sans" style={{
    position:'absolute', bottom:16, right:16,
    background:'rgba(30,28,24,0.75)', color:'#F5F0E8',
    fontSize:'0.7rem', padding:'4px 12px', letterSpacing:'0.1em',
    borderRadius:2, display:'flex', alignItems:'center', gap:4
  }}>
    <span>Click to expand</span> • {selectedImageIndex + 1} / {currentRoomImages.length}
  </div>
  {/* Nav arrows remain the same */}
  {currentRoomImages.length > 1 && (
    <>
      <button onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i => (i - 1 + currentRoomImages.length) % currentRoomImages.length); }}
        style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'rgba(245,240,232,0.9)', border:'none', width:36, height:36, borderRadius:2, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#1E1C18', zIndex:2}}>
        <FiChevronLeft size={18} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i => (i + 1) % currentRoomImages.length); }}
        style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'rgba(245,240,232,0.9)', border:'none', width:36, height:36, borderRadius:2, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#1E1C18', zIndex:2}}>
        <FiChevronRight size={18} />
      </button>
    </>
  )}
</div>

              {/* Room Thumbnails */}
<div style={{display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:6}}>

  {/* Exterior Thumbnail (already correct) */}
  <div 
    className={`pd-img-thumb ${selectedRoom === 'exterior' ? 'active' : ''}`} 
    onClick={() => { 
      setSelectedRoom('exterior'); 
      setSelectedImageIndex(0);
      openLightbox(roomImages.exterior?.[0] || fallbackImages.exterior, 0);
    }}
  >
    <img 
      src={getImageUrl(roomImages.exterior?.[0] || fallbackImages.exterior)} 
      alt="Exterior"
      style={{width:'100%', height:'100%', objectFit:'cover'}}
      onError={(e) => { e.target.src = fallbackImages.exterior; }}
    />
    <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', color:'white', fontSize:'0.55rem', padding:'2px', textAlign:'center'}}>
      Exterior
    </div>
  </div>
  
  {/* Bedroom Thumbnail - FIXED */}
  <div 
    className={`pd-img-thumb ${selectedRoom === 'bedroom' ? 'active' : ''}`} 
    onClick={() => { 
      setSelectedRoom('bedroom'); 
      setSelectedImageIndex(0);
      openLightbox(roomImages.bedroom?.[0] || fallbackImages.bedroom, 0);
    }}
  >
    <img 
      src={getImageUrl(roomImages.bedroom?.[0] || fallbackImages.bedroom)} 
      alt="Bedroom"
      style={{width:'100%', height:'100%', objectFit:'cover'}}
      onError={(e) => { e.target.src = fallbackImages.bedroom; }}
    />
    <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', color:'white', fontSize:'0.55rem', padding:'2px', textAlign:'center'}}>
      Bedroom
    </div>
  </div>
  
  {/* Bathroom Thumbnail - FIXED */}
  <div 
    className={`pd-img-thumb ${selectedRoom === 'bathroom' ? 'active' : ''}`} 
    onClick={() => { 
      setSelectedRoom('bathroom'); 
      setSelectedImageIndex(0);
      openLightbox(roomImages.bathroom?.[0] || fallbackImages.bathroom, 0);
    }}
  >
    <img 
      src={getImageUrl(roomImages.bathroom?.[0] || fallbackImages.bathroom)} 
      alt="Bathroom"
      style={{width:'100%', height:'100%', objectFit:'cover'}}
      onError={(e) => { e.target.src = fallbackImages.bathroom; }}
    />
    <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', color:'white', fontSize:'0.55rem', padding:'2px', textAlign:'center'}}>
      Bathroom
    </div>
  </div>
  
  {/* Living Room Thumbnail - FIXED */}
  <div 
    className={`pd-img-thumb ${selectedRoom === 'livingRoom' ? 'active' : ''}`} 
    onClick={() => { 
      setSelectedRoom('livingRoom'); 
      setSelectedImageIndex(0);
      openLightbox(roomImages.livingRoom?.[0] || fallbackImages.livingRoom, 0);
    }}
  >
    <img 
      src={getImageUrl(roomImages.livingRoom?.[0] || fallbackImages.livingRoom)} 
      alt="Living Room"
      style={{width:'100%', height:'100%', objectFit:'cover'}}
      onError={(e) => { e.target.src = fallbackImages.livingRoom; }}
    />
    <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', color:'white', fontSize:'0.55rem', padding:'2px', textAlign:'center'}}>
      Living
    </div>
  </div>
  
  {/* Dining Room Thumbnail - FIXED */}
  <div 
    className={`pd-img-thumb ${selectedRoom === 'diningRoom' ? 'active' : ''}`} 
    onClick={() => { 
      setSelectedRoom('diningRoom'); 
      setSelectedImageIndex(0);
      openLightbox(roomImages.diningRoom?.[0] || fallbackImages.diningRoom, 0);
    }}
  >
    <img 
      src={getImageUrl(roomImages.diningRoom?.[0] || fallbackImages.diningRoom)} 
      alt="Dining Room"
      style={{width:'100%', height:'100%', objectFit:'cover'}}
      onError={(e) => { e.target.src = fallbackImages.diningRoom; }}
    />
    <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', color:'white', fontSize:'0.55rem', padding:'2px', textAlign:'center'}}>
      Dining
    </div>
  </div>
  
  {/* Kitchen Thumbnail - FIXED */}
  <div 
    className={`pd-img-thumb ${selectedRoom === 'kitchen' ? 'active' : ''}`} 
    onClick={() => { 
      setSelectedRoom('kitchen'); 
      setSelectedImageIndex(0);
      openLightbox(roomImages.kitchen?.[0] || fallbackImages.kitchen, 0);
    }}
  >
    <img 
      src={getImageUrl(roomImages.kitchen?.[0] || fallbackImages.kitchen)} 
      alt="Kitchen"
      style={{width:'100%', height:'100%', objectFit:'cover'}}
      onError={(e) => { e.target.src = fallbackImages.kitchen; }}
    />
    <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', color:'white', fontSize:'0.55rem', padding:'2px', textAlign:'center'}}>
      Kitchen
    </div>
  </div>
</div>


            </div>

            {/* Tabs */}
            <div style={{background:'white', border:'1px solid rgba(139,115,85,0.12)', borderRadius:2, overflow:'hidden'}}>
              <div style={{display:'flex', borderBottom:'1px solid rgba(139,115,85,0.12)'}}>
                {["details","amenities","nearby","reviews"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pd-tab-btn ${activeTab === tab ? 'active' : ''}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{padding:32}}>
                {/* Details Tab */}
                {activeTab === "details" && (
                  <div>
                    <div className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B7355', marginBottom:8}}>Overview</div>
                    <h3 className="pd-serif" style={{fontSize:'1.6rem', fontWeight:400, color:'#1E1C18', marginBottom:24}}>Property Details</h3>

                    {/* Stats grid */}
                    <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28}}>
                      {[
                        { icon:<FaBed size={18} />, label:'Bedrooms', value: property.bedrooms || 'N/A' },
                        { icon:<FaBath size={18} />, label:'Bathrooms', value: property.bathrooms || 'N/A' },
                        { icon:<FaRulerCombined size={18} />, label:'Area', value: property.area ? `${property.area} sq.ft` : 'N/A' },
                        { icon:<FaHome size={18} />, label:'Floor', value: property.floor ? `${property.floor}/${property.totalFloors || property.floor}` : 'N/A' },
                      ].map(item => (
                        <div key={item.label} className="pd-stat-box">
                          <div style={{color:'#8B7355', marginBottom:8, display:'flex', justifyContent:'center'}}>{item.icon}</div>
                          <p className="pd-sans" style={{fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'#8B7355', marginBottom:4}}>{item.label}</p>
                          <p className="pd-serif" style={{fontSize:'1.3rem', fontWeight:500, color:'#1E1C18'}}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Price strip */}
                    <div style={{background:'#1E1C18', borderRadius:2, padding:'20px 24px', marginBottom:28, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div>
                        <p className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B7355', marginBottom:4}}>Asking Price</p>
                        <p className="pd-serif" style={{fontSize:'1.8rem', fontWeight:600, color:'#F5F0E8', lineHeight:1}}>{formatPrice(property.price)}</p>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <p className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B7355', marginBottom:4}}>Per sq.ft</p>
                        <p className="pd-sans" style={{fontSize:'1rem', fontWeight:500, color:'#C4A97A'}}>{formatPricePerSqFt(property.price, property.area)}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{marginBottom:28}}>
                      <h4 className="pd-sans" style={{fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B7355', marginBottom:12}}>Description</h4>
                      <p className="pd-sans" style={{color:'#6B6355', lineHeight:1.8, fontWeight:300, fontSize:'0.95rem'}}>{property.description}</p>
                    </div>

                  

                  {/* Features */}
{property.features && property.features.length > 0 && (
  <div>
    <h4 className="pd-sans" style={{fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B7355', marginBottom:12}}>Features</h4>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
      {property.features.map((f, i) => {
        const featureStr = typeof f === 'string' ? f : String(f);
        return (
          <div key={i} style={{display:'flex', alignItems:'center', gap:10}}>
            <FaCheckCircle size={12} style={{color:'#8B7355', flexShrink:0}} />
            <span className="pd-sans" style={{color:'#6B6355', fontSize:'0.875rem'}}>{featureStr}</span>
          </div>
        );
      })}
    </div>
  </div>
)}
                  </div>
                )}

                {/* Amenities Tab */}
{activeTab === "amenities" && (
  <div>
    <div className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B7355', marginBottom:8}}>Included</div>
    <h3 className="pd-serif" style={{fontSize:'1.6rem', fontWeight:400, color:'#1E1C18', marginBottom:24}}>Amenities</h3>
    <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10}}>
      {property.features && property.features.length > 0 ? (
        property.features.map((feature, i) => {
          // Make sure feature is a string
          const featureStr = typeof feature === 'string' ? feature : String(feature);
          return (
            <div key={i} className="pd-amenity-card">
              <div style={{color:'#8B7355', fontSize:'1.1rem'}}>{getFeatureIcon(featureStr)}</div>
              <div>
                <p className="pd-sans" style={{fontWeight:500, color:'#1E1C18', fontSize:'0.875rem'}}>{featureStr}</p>
                <p className="pd-sans" style={{fontSize:'0.65rem', color:'#8B7355', letterSpacing:'0.08em', textTransform:'uppercase'}}>Available</p>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{gridColumn:'span 2', textAlign:'center', padding:'40px 0', background:'#F5F0E8', borderRadius:2}}>
          <p className="pd-sans" style={{color:'#8B7355', fontSize:'0.875rem'}}>No amenities listed</p>
          <p className="pd-sans" style={{color:'#A89880', fontSize:'0.75rem', marginTop:4}}>Contact owner for more details</p>
        </div>
      )}
    </div>
  </div>
)}

                {/* Nearby Tab */}
                {activeTab === "nearby" && (
                  <div>
                    <div className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B7355', marginBottom:8}}>Location</div>
                    <h3 className="pd-serif" style={{fontSize:'1.6rem', fontWeight:400, color:'#1E1C18', marginBottom:24}}>Nearby Places</h3>

                    <div style={{marginBottom:24, borderRadius:2, overflow:'hidden'}}>
                      <PropertyMap property={property} nearbyPlaces={nearbyPlaces} />
                    </div>

                    {nearbyLoading ? (
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                        {[1,2,3,4].map(n => (
                          <div key={n} style={{height:72, background:'#EDE8DC', borderRadius:2, animation:'pulse 1.5s ease-in-out infinite', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <FaSpinner style={{color:'#8B7355', animation:'spin 0.8s linear infinite'}} />
                          </div>
                        ))}
                      </div>
                    ) : nearbyPlaces.length > 0 ? (
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                        {nearbyPlaces.map((place, i) => (
                          <div key={i} className="pd-nearby-card">
                            <div style={{display:'flex', alignItems:'center', gap:12}}>
                              <span style={{fontSize:'1.4rem'}}>{place.icon || '📍'}</span>
                              <div>
                                <p className="pd-sans" style={{fontWeight:500, color:'#1E1C18', fontSize:'0.875rem'}}>{place.name}</p>
                                <p className="pd-sans" style={{fontSize:'0.75rem', color:'#8B7355'}}>{place.distance}</p>
                                <p className="pd-sans" style={{fontSize:'0.65rem', color:'#A89880', textTransform:'capitalize', letterSpacing:'0.06em'}}>{place.type}</p>
                              </div>
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + property?.location)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="pd-sans"
                              style={{fontSize:'0.65rem', color:'#8B7355', textDecoration:'underline', textUnderlineOffset:3, letterSpacing:'0.08em', textTransform:'uppercase', flexShrink:0}}
                            >
                              Map →
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{textAlign:'center', padding:'40px 0', background:'#F5F0E8', borderRadius:2}}>
                        <FaMapMarkerAlt style={{fontSize:'2rem', color:'#D4C9B5', marginBottom:8}} />
                        <p className="pd-sans" style={{color:'#8B7355', fontSize:'0.875rem'}}>No nearby places found</p>
                        <p className="pd-sans" style={{color:'#A89880', fontSize:'0.75rem', marginTop:4}}>{property?.location}</p>
                      </div>
                    )}
                  </div>
                )}

    {activeTab === "reviews" && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
      <div>
        <div className="pd-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Client Feedback</div>
        <h3 className="pd-serif" style={{ fontSize: '1.6rem', fontWeight: 400, color: '#1E1C18' }}>Reviews</h3>
      </div>
      {user && (user.role === 'buyer' || user.role === 'builder') && (
        <button
          onClick={() => setShowReviewModal(true)}
          className="pd-sans"
          style={{
            background: 'none',
            border: '1px solid rgba(139,115,85,0.4)',
            color: '#8B7355',
            padding: '8px 18px',
            borderRadius: 2,
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(139,115,85,0.08)';
            e.target.style.borderColor = '#8B7355';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'none';
            e.target.style.borderColor = 'rgba(139,115,85,0.4)';
          }}
        >
          Write Review
        </button>
      )}
    </div>

    {/* Rating Summary */}
    {totalReviews > 0 && (
      <div style={{
        background: '#1E1C18',
        borderRadius: 2,
        padding: '24px',
        marginBottom: 28,
        display: 'flex',
        gap: 40,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <p className="pd-serif" style={{ fontSize: '3.5rem', fontWeight: 600, color: '#F5F0E8', lineHeight: 1 }}>
            {averageRating}
          </p>
          <div style={{ display: 'flex', gap: 3, justifyContent: 'center', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <FaStar
                key={s}
                size={12}
                style={{ color: s <= Math.round(averageRating) ? '#C4A97A' : 'rgba(196,169,122,0.25)' }}
              />
            ))}
          </div>
          <p className="pd-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        
        <div style={{ flex: 1, minWidth: 200 }}>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution.counts[rating] || 0;
            const percentage = ratingDistribution.percentages[rating] || 0;
            
            return (
              <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="pd-sans" style={{ fontSize: '0.72rem', color: '#8B7355', width: 28 }}>
                  {rating}★
                </span>
                <div style={{
                  flex: 1,
                  height: 2,
                  background: 'rgba(196,169,122,0.2)',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: '#C4A97A',
                    width: `${percentage}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <span className="pd-sans" style={{ fontSize: '0.72rem', color: '#6B6355', width: 30 }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Reviews List */}
    {reviewsLoading && propertyReviews.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <FaSpinner style={{ animation: 'spin 0.8s linear infinite', color: '#8B7355', fontSize: '2rem' }} />
      </div>
    ) : propertyReviews.length > 0 ? (
      <div>
        {propertyReviews.map(review => (
          <div
            key={review._id}
            style={{
              paddingBottom: 24,
              marginBottom: 24,
              borderBottom: '1px solid rgba(139,115,85,0.12)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name || 'User'}&background=2C2A26&color=C4A97A`}
                  alt={review.user?.name || 'User'}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid rgba(139,115,85,0.2)'
                  }}
                  onError={e => {
                    e.target.src = `https://ui-avatars.com/api/?name=${review.user?.name || 'User'}&background=2C2A26&color=C4A97A`;
                  }}
                />
                <div>
                  <p className="pd-sans" style={{ fontWeight: 500, color: '#1E1C18', fontSize: '0.875rem' }}>
                    {review.user?.name || 'Anonymous'}
                    {review.isVerifiedPurchase && (
                      <span style={{
                        marginLeft: 8,
                        fontSize: '0.6rem',
                        color: '#8B7355',
                        background: 'rgba(139,115,85,0.1)',
                        padding: '2px 6px',
                        borderRadius: 2,
                        letterSpacing: '0.1em'
                      }}>
                        Verified
                      </span>
                    )}
                  </p>
                  <p className="pd-sans" style={{ fontSize: '0.72rem', color: '#8B7355' }}>
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <FaStar
                    key={s}
                    size={11}
                    style={{ color: s <= review.rating ? '#C4A97A' : 'rgba(196,169,122,0.25)' }}
                  />
                ))}
              </div>
            </div>
            
            <p className="pd-sans" style={{
              color: '#6B6355',
              lineHeight: 1.7,
              fontWeight: 300,
              fontSize: '0.9rem',
              marginBottom: 10
            }}>
              {review.comment}
            </p>
            
            {review.response && review.response.comment && (
              <div style={{
                marginTop: 16,
                marginLeft: 40,
                padding: 12,
                background: '#F5F0E8',
                borderRadius: 2,
                borderLeft: '2px solid #8B7355'
              }}>
                <p className="pd-sans" style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#8B7355',
                  marginBottom: 4
                }}>
                  Owner Response
                </p>
                <p className="pd-sans" style={{
                  fontSize: '0.85rem',
                  color: '#2C2A26',
                  fontWeight: 300
                }}>
                  {review.response.comment}
                </p>
              </div>
            )}
            
            <button
              onClick={async () => {
                if (!user) {
                  toast.error("Please login to mark helpful");
                  return;
                }
                try {
                  const response = await API.post(`/reviews/${review._id}/helpful`);
                  if (response.data.success) {
                    // Update the review in state
                    setPropertyReviews(prev =>
                      prev.map(r =>
                        r._id === review._id
                          ? { ...r, helpful: response.data.helpfulCount }
                          : r
                      )
                    );
                  }
                } catch (error) {
                  console.error("Error marking helpful:", error);
                }
              }}
              className="pd-sans"
              style={{
                background: 'none',
                border: 'none',
                color: '#8B7355',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3
              }}
            >
              Helpful ({review.helpful?.length || 0})
            </button>
          </div>
        ))}

        {/* Load More */}
        {reviewsPagination.page < reviewsPagination.pages && (
          <button
            onClick={loadMoreReviews}
            className="pd-sans"
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              border: '1px solid rgba(139,115,85,0.3)',
              borderRadius: 2,
              color: '#8B7355',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginTop: 16
            }}
          >
            Load More Reviews
          </button>
        )}
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <FaStar style={{ fontSize: '2.5rem', color: '#D4C9B5', marginBottom: 8 }} />
        <p className="pd-sans" style={{ color: '#8B7355' }}>No reviews yet. Be the first to review!</p>
      </div>
    )}
    {/* Review Modal */}
<ReviewModal
  isOpen={showReviewModal}
  onClose={() => setShowReviewModal(false)}
  propertyId={property._id}
  propertyTitle={property.title}
  onReviewSubmitted={handleReviewSubmitted}
/>
  </div>
)}
              </div>
            </div>
          </div>

          {/* Right Column - Price & Contact */}
          <div style={{position:'sticky', top:80}}>
            <div style={{background:'white', border:'1px solid rgba(139,115,85,0.15)', borderRadius:2, overflow:'hidden'}}>

              {/* Price header */}
              <div style={{background:'#1E1C18', padding:'24px'}}>
                <p className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B7355', marginBottom:6}}>Asking Price</p>
                <p className="pd-serif" style={{fontSize:'2rem', fontWeight:600, color:'#F5F0E8', lineHeight:1, marginBottom:4}}>{formatPrice(property.price)}</p>
                <p className="pd-sans" style={{fontSize:'0.78rem', color:'#8B7355'}}>{formatPricePerSqFt(property.price, property.area)}</p>
              </div>

              <div style={{padding:'20px 24px'}}>
                {/* Financial details */}
                <div style={{marginBottom:20}}>
                  {[
                    { label:'Est. EMI', value:`₹ ${Math.round(property.price * 0.0074).toLocaleString('en-IN')}/mo*` },
                    { label:'Booking Amount', value:`₹ ${Math.round(property.price * 0.1).toLocaleString('en-IN')}` },
                    { label:'Status', value: getDisplayStatus(property.status), isStatus: true },
                  ].map(item => (
                    <div key={item.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(139,115,85,0.1)'}}>
                      <span className="pd-sans" style={{fontSize:'0.78rem', color:'#8B7355'}}>{item.label}</span>
                      {item.isStatus ? (
                        <span className="pd-sans" style={{
                          fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600,
                          padding:'3px 10px', borderRadius:2,
                          background: getDisplayStatus(property.status) === 'available' 
  ? 'rgba(139,115,85,0.1)' 
  : getDisplayStatus(property.status) === 'sold' 
    ? 'rgba(200,80,60,0.1)' 
    : 'rgba(196,169,122,0.15)',
color: getDisplayStatus(property.status) === 'available' 
  ? '#8B7355' 
  : getDisplayStatus(property.status) === 'sold' 
    ? '#C4503C' 
    : '#C4A97A',
border: `1px solid ${getDisplayStatus(property.status) === 'available' 
  ? 'rgba(139,115,85,0.3)' 
  : getDisplayStatus(property.status) === 'sold' 
    ? 'rgba(196,80,60,0.3)' 
    : 'rgba(196,169,122,0.3)'}`,
                        }}>{item.value}</span>
                      ) : (
                        <span className="pd-sans" style={{fontSize:'0.82rem', fontWeight:500, color:'#1E1C18'}}>{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <button onClick={handleContactOwner} className="pd-btn-primary">
                  <FaPhone size={13} /> Contact Owner
                </button>
                <button 
  onClick={handleStartChat} 
  className="pd-btn-ghost"
  disabled={sending}
>
  <FaEnvelope size={13} /> {sending ? 'Starting Chat...' : 'Send Message'}
</button>



{/* Owner/Builder/Seller Contact Info */}
<div style={{marginTop:20, paddingTop:20, borderTop:'1px solid rgba(139,115,85,0.12)'}}>
  <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
    <div style={{width:44, height:44, background:'#F5F0E8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(139,115,85,0.2)', flexShrink:0}}>
      {property.seller ? (
        property.seller.profilePic ? (
          <img 
            src={getImageUrl(property.seller.profilePic)} 
            alt={property.seller.name}
            style={{width:44, height:44, borderRadius:'50%', objectFit:'cover'}}
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <FaUserTie style={{color:'#8B7355', fontSize:'1.1rem'}} />
        )
      ) : property.builder ? (
        property.builder.profilePic ? (
          <img 
            src={getImageUrl(property.builder.profilePic)} 
            alt={property.builder.name}
            style={{width:44, height:44, borderRadius:'50%', objectFit:'cover'}}
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <FaUserTie style={{color:'#8B7355', fontSize:'1.1rem'}} />
        )
      ) : (
        <FaUserTie style={{color:'#8B7355', fontSize:'1.1rem'}} />
      )}
    </div>
    <div>
      <p className="pd-sans" style={{fontWeight:500, color:'#1E1C18', fontSize:'0.875rem'}}>
        {property.seller ? property.seller.name : (property.builder ? property.builder.name : "Property Owner")}
      </p>
      <p className="pd-sans" style={{fontSize:'0.65rem', color:'#8B7355', letterSpacing:'0.1em', textTransform:'uppercase'}}>
        {property.seller ? 'Seller' : (property.builder ? 'Builder' : 'Verified Owner')}
      </p>
      {property.builder?.companyName && !property.seller && (
        <p className="pd-sans" style={{fontSize:'0.6rem', color:'#A89880', marginTop:2}}>
          {property.builder.companyName}
        </p>
      )}
      {property.seller && (
        <>
          <p className="pd-sans" style={{fontSize:'0.65rem', color:'#8B7355', marginTop:4}}>
            <FaPhone size={10} style={{marginRight:6}} />
            {property.seller.phone || 'Contact via chat'}
          </p>
          <p className="pd-sans" style={{fontSize:'0.65rem', color:'#8B7355'}}>
            <FaEnvelope size={10} style={{marginRight:6}} />
            {property.seller.email}
          </p>
        </>
      )}
    </div>
  </div>
  
  {/* Show a note if property was purchased from builder */}
  {property.originalBuilder && property.seller && (
    <div style={{
      background: '#F5F0E8',
      padding: '12px',
      borderRadius: 2,
      marginTop: 12,
      borderLeft: '2px solid #8B7355'
    }}>
      <p className="pd-sans" style={{fontSize:'0.7rem', color:'#8B7355', margin:0}}>
        Originally built by {property.originalBuilder.name || property.originalBuilder.companyName}
      </p>
    </div>
  )}
</div>

              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        <div style={{marginTop:72}}>
          <div style={{marginBottom:32}}>
            <div className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B7355', marginBottom:8}}>You May Also Like</div>
            <h2 className="pd-serif" style={{fontSize:'2rem', fontWeight:400, color:'#1E1C18', letterSpacing:'-0.02em'}}>Similar Properties</h2>
          </div>

          {similarLoading ? (
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24}}>
              {[1,2,3].map(n => (
                <div key={n} style={{background:'white', borderRadius:2, overflow:'hidden', animation:'pulse 1.5s ease-in-out infinite'}}>
                  <div style={{aspectRatio:'4/3', background:'#EDE8DC'}} />
                  <div style={{padding:20}}>
                    <div style={{height:16, background:'#EDE8DC', borderRadius:2, marginBottom:8, width:'70%'}} />
                    <div style={{height:12, background:'#EDE8DC', borderRadius:2, width:'45%'}} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24}}>
              {similarProperties.length > 0 ? similarProperties.map(prop => (
                <Link to={`/property/${prop._id}`} key={prop._id} className="pd-similar-card"
                  style={{background:'white', borderRadius:2, overflow:'hidden', border:'1px solid rgba(139,115,85,0.12)', display:'block', textDecoration:'none'}}>
                  <div style={{aspectRatio:'4/3', overflow:'hidden'}}>
                    <img
                     src={getImageUrl(prop.images?.[0] || prop.image || fallbackImages.exterior)}
                     alt={prop.title}

                      className="pd-similar-img"
                      style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                      onError={e => { e.target.src = fallbackImages.exterior; }}
                    />
                  </div>
                  <div style={{padding:'18px 20px'}}>
                    <h3 className="pd-serif" style={{fontSize:'1.1rem', fontWeight:500, color:'#1E1C18', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{prop.title}</h3>
                    <p className="pd-sans" style={{fontSize:'0.78rem', color:'#8B7355', marginBottom:8, display:'flex', alignItems:'center', gap:4}}>
                      <FaMapMarkerAlt size={10} />{prop.location}
                    </p>
                    <p className="pd-serif" style={{fontSize:'1.25rem', fontWeight:600, color:'#1E1C18'}}>{formatPrice(prop.price)}</p>
                  </div>
                </Link>
              )) : (
                <div style={{gridColumn:'span 3', textAlign:'center', padding:'40px 0'}}>
                  <p className="pd-sans" style={{color:'#8B7355'}}>No similar properties found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div style={{position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'rgba(30,28,24,0.75)', backdropFilter:'blur(8px)'}}>
          <div style={{background:'white', borderRadius:2, maxWidth:480, width:'100%', overflow:'hidden', animation:'pd-modal-in 0.25s ease forwards', boxShadow:'0 32px 80px rgba(0,0,0,0.3)'}}>

            {/* Modal header */}
            <div style={{background:'#1E1C18', padding:'28px 32px', position:'relative'}}>
              <button
                onClick={() => setShowContactModal(false)}
                style={{position:'absolute', top:20, right:20, background:'rgba(139,115,85,0.2)', border:'none', width:32, height:32, borderRadius:2, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#C4A97A'}}
              >
                <FaTimes size={14} />
              </button>
              <div className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B7355', marginBottom:6}}>Direct Enquiry</div>
              <h3 className="pd-serif" style={{fontSize:'1.6rem', fontWeight:400, color:'#F5F0E8', lineHeight:1.1}}>Get in Touch</h3>
              <p className="pd-sans" style={{color:'#6B6355', fontSize:'0.82rem', marginTop:6}}>
                Enquiring about: <em style={{color:'#C4A97A'}}>{property?.title}</em>
              </p>
            </div>

            <div style={{padding:'28px 32px'}}>
              <form onSubmit={handleSendEnquiry}>
                <label className="pd-sans" style={{display:'block', fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B7355', marginBottom:8}}>
                  Message to Owner
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="I'm interested in this property. Could you provide more details..."
                  rows={5}
                  required
                  style={{width:'100%', background:'#F5F0E8', border:'1px solid rgba(139,115,85,0.2)', borderRadius:2, padding:'14px 16px', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', color:'#2C2A26', outline:'none', resize:'none', lineHeight:1.6, boxSizing:'border-box', marginBottom:20}}
                  onFocus={e => { e.target.style.borderColor = '#8B7355'; e.target.style.boxShadow = '0 0 0 3px rgba(139,115,85,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(139,115,85,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="submit" disabled={sending} className="pd-btn-primary" style={{marginBottom:10}}>
                  {sending ? <><FaSpinner style={{animation:'spin 0.8s linear infinite'}} size={14} /> Processing…</> : 'Send Enquiry'}
                </button>
                <button type="button" onClick={() => setShowContactModal(false)}
                  className="pd-sans"
                  style={{display:'block', width:'100%', textAlign:'center', background:'none', border:'none', color:'#8B7355', fontSize:'0.75rem', cursor:'pointer', padding:'8px', textDecoration:'underline', textUnderlineOffset:3}}
                >
                  Maybe later
                </button>
              </form>
            </div>
            <div style={{padding:'12px 32px', background:'#F5F0E8', borderTop:'1px solid rgba(139,115,85,0.1)', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
              <div style={{width:6, height:6, borderRadius:'50%', background:'#8B7355', animation:'pulse 2s ease-in-out infinite'}} />
              <span className="pd-sans" style={{fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#8B7355'}}>Secure Direct Communication</span>
            </div>
          </div>
        </div>
      )}


      
      {/* Lightbox Modal */}
{lightboxOpen && (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  }}>
    {/* Close button */}
    <button
      onClick={() => setLightboxOpen(false)}
      style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.2rem',
        zIndex: 1001,
        transition: 'background 0.2s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
    >
      <FaTimes size={20} />
    </button>

    {/* Navigation buttons */}
    {currentRoomImages.length > 1 && (
      <>
        <button
          onClick={() => navigateLightbox('prev')}
          style={{
            position: 'absolute',
            left: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem',
            zIndex: 1001,
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={() => navigateLightbox('next')}
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem',
            zIndex: 1001,
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <FiChevronRight size={24} />
        </button>
      </>
    )}

    {/* Image container */}
    <div style={{ maxWidth: '1200px', width: '100%', position: 'relative' }}>
      <img
        src={getImageUrl(lightboxImage)}
        alt={`${roomDisplayNames[selectedRoom]} ${lightboxIndex + 1}`}
        style={{
          width: '100%',
          maxHeight: '80vh',
          objectFit: 'contain',
          borderRadius: '4px'
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImages[selectedRoom];
        }}
      />
      
      {/* Image info */}
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.8)',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
          {roomDisplayNames[selectedRoom]} • {lightboxIndex + 1} of {currentRoomImages.length}
        </div>
        {property?.title && (
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            {property.title}
          </div>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default PropertyDetails;