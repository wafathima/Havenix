import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../api/axios";
import { 
  FaArrowLeft, FaUpload, FaTimes, FaBolt, FaDumbbell, FaWifi, FaVideo, 
  FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaCalendarAlt,
  FaBuilding, FaParking, FaSwimmingPool, FaTree, FaShieldAlt,
  FaFire, FaTshirt, FaDog, FaRegBuilding, FaTools, FaCheckCircle,
  FaCamera, FaEye
} from "react-icons/fa";
import { 
  MdPool, 
  MdSecurity, 
  MdKitchen, 
  MdPets, 
  MdAcUnit, 
  MdLocalParking,
  MdBalcony,
  MdElevator,
  MdSportsTennis,
  MdYard,
  MdWifi,
  MdVideocam
} from "react-icons/md";
import { BiWater, BiBath, BiCctv } from "react-icons/bi";
import { GiElectric, GiGardeningShears } from "react-icons/gi";
import toast from "react-hot-toast";

function AddProject() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    tagline: "",
    description: "",
    price: "",
    pricePerSqFt: "",
    location: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    
    // Project Details
    projectType: "Apartment",
    status: "ongoing",
    totalUnits: "",
    availableUnits: "",
    totalTowers: "",
    floorsPerTower: "",
    possessionDate: "",
    possessionStatus: "ready",
    reraNumber: "",
    reraApproved: false,
    
    // Unit Details
    bedrooms: "2",
    bathrooms: "2",
    balconies: "1",
    area: "",
    carpetArea: "",
    superArea: "",
    
    // Dimensions
    length: "",
    breadth: "",
    ceilingHeight: "",
    facing: "East",
    
    // Pricing Breakdown
    basePrice: "",
    floorRise: "",
    parkingPrice: "",
    maintenance: "",
    maintenanceFrequency: "monthly",
    stampDuty: "",
    registration: "",
    gst: "",
    
    // Dates
    launchDate: "",
    completionDate: "",
    handoverDate: "",
    
    // Legal
    landArea: "",
    landOwnership: "freehold",
    approvalAuthority: "",
    approvalNumber: "",
    approvalDate: "",
    
    // Developer
    developerName: "",
    developerExperience: "",
    completedProjects: "",
    awards: "",
    
    // Construction
    constructionQuality: "",
    constructionType: "RCC",
    projectArchitect: "",
    
    // Features
    features: [],
    amenities: [],
    nearbyPlaces: [],
    
    // Media
    videoUrl: "",
    brochureUrl: "",
    virtualTourUrl: ""
  });


  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const projectTypes = [
    "Apartment", "Villa", "Townhouse", "Duplex", "Penthouse",
    "Commercial", "Mixed Use", "Township", "Luxury Residence", "Studio"
  ];
  
  const statusOptions = [
    "ongoing", "completed", "upcoming", "launched", "pre-launch", "ready-to-move"
  ];
  
  const possessionStatusOptions = [
    "ready", "under-construction", "within-6-months", "within-1-year", "within-2-years", "beyond-2-years"
  ];
  
  const facingOptions = [
    "East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"
  ];
  
  const landOwnershipOptions = [
    "freehold", "leasehold", "cooperative", "government", "private"
  ];


  
  const availableFeatures = [
  { id: "swimmingPool", label: "Swimming Pool", icon: <MdPool />, category: "Recreation" },
  { id: "parking", label: "Parking", icon: <FaParking />, category: "Utility" },
  { id: "security", label: "24/7 Security", icon: <MdSecurity />, category: "Safety" },
  { id: "powerBackup", label: "Power Backup", icon: <FaBolt />, category: "Utility" },
  { id: "modularKitchen", label: "Modular Kitchen", icon: <MdKitchen />, category: "Interior" },
  { id: "gym", label: "Gym", icon: <FaDumbbell />, category: "Recreation" },
  { id: "wifi", label: "High-speed WiFi", icon: <MdWifi />, category: "Technology" },
  { id: "cctv", label: "CCTV Surveillance", icon: <BiCctv />, category: "Safety" }, // Using BiCctv
  { id: "petFriendly", label: "Pet Friendly", icon: <MdPets />, category: "Lifestyle" },
  { id: "ac", label: "Air Conditioning", icon: <MdAcUnit />, category: "Interior" },
  { id: "balcony", label: "Balcony", icon: <MdBalcony />, category: "Design" },
  { id: "elevator", label: "Elevator", icon: <MdElevator />, category: "Utility" },
  { id: "clubhouse", label: "Clubhouse", icon: <FaRegBuilding />, category: "Recreation" },
  { id: "garden", label: "Garden", icon: <MdYard />, category: "Landscape" },
  { id: "childrenPlay", label: "Children's Play Area", icon: <GiGardeningShears />, category: "Recreation" },
  { id: "sports", label: "Sports Facility", icon: <MdSportsTennis />, category: "Recreation" },
  { id: "jogging", label: "Jogging Track", icon: <GiGardeningShears />, category: "Recreation" },
  { id: "indoorGames", label: "Indoor Games", icon: <MdSportsTennis />, category: "Recreation" },
  { id: "rainwater", label: "Rainwater Harvesting", icon: <BiWater />, category: "Eco-friendly" },
  { id: "solar", label: "Solar Panels", icon: <GiElectric />, category: "Eco-friendly" },
  { id: "fireSafety", label: "Fire Safety", icon: <FaFire />, category: "Safety" },
  { id: "laundry", label: "Laundry Service", icon: <FaTshirt />, category: "Service" },
  { id: "waterSoftener", label: "Water Softener", icon: <BiWater />, category: "Utility" },
  { id: "vaastu", label: "Vaastu Compliant", icon: <FaCheckCircle />, category: "Design" }
];

  // Group features by category
  const groupedFeatures = availableFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 20) {
      toast.error("You can upload maximum 20 images");
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

 
  const calculatePricePerSqFt = () => {
    if (formData.price && formData.area) {
      const perSqFt = Math.round(formData.price / formData.area);
      setFormData({ ...formData, pricePerSqFt: perSqFt });
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.description || !formData.price || !formData.location || !formData.area) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    
    // Basic Info (these definitely work)
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('area', formData.area);
    
    // Optional basic fields (these should be safe)
    if (formData.tagline) formDataToSend.append('tagline', formData.tagline);
    if (formData.city) formDataToSend.append('city', formData.city);
    if (formData.state) formDataToSend.append('state', formData.state);
    if (formData.pincode) formDataToSend.append('pincode', formData.pincode);
    if (formData.landmark) formDataToSend.append('landmark', formData.landmark);
    
    // Project Details (these should be safe as strings)
    if (formData.projectType) formDataToSend.append('projectType', formData.projectType);
    if (formData.status) formDataToSend.append('status', formData.status);
    
    // Numeric fields - ensure they're numbers
    if (formData.totalUnits) formDataToSend.append('totalUnits', parseInt(formData.totalUnits).toString());
    if (formData.availableUnits) formDataToSend.append('availableUnits', parseInt(formData.availableUnits).toString());
    if (formData.totalTowers) formDataToSend.append('totalTowers', parseInt(formData.totalTowers).toString());
    if (formData.floorsPerTower) formDataToSend.append('floorsPerTower', parseInt(formData.floorsPerTower).toString());
    
    // Unit Details
    if (formData.bedrooms) formDataToSend.append('bedrooms', parseInt(formData.bedrooms).toString());
    if (formData.bathrooms) formDataToSend.append('bathrooms', parseInt(formData.bathrooms).toString());
    if (formData.balconies) formDataToSend.append('balconies', parseInt(formData.balconies).toString());
    
    // Area fields
    if (formData.carpetArea) formDataToSend.append('carpetArea', parseFloat(formData.carpetArea).toString());
    if (formData.superArea) formDataToSend.append('superArea', parseFloat(formData.superArea).toString());
    
    // Dimensions
    if (formData.length) formDataToSend.append('length', parseFloat(formData.length).toString());
    if (formData.breadth) formDataToSend.append('breadth', parseFloat(formData.breadth).toString());
    if (formData.ceilingHeight) formDataToSend.append('ceilingHeight', parseFloat(formData.ceilingHeight).toString());
    if (formData.facing) formDataToSend.append('facing', formData.facing);
    
    // Pricing
    if (formData.basePrice) formDataToSend.append('basePrice', parseFloat(formData.basePrice).toString());
    if (formData.parkingPrice) formDataToSend.append('parkingPrice', parseFloat(formData.parkingPrice).toString());
    if (formData.maintenance) formDataToSend.append('maintenance', parseFloat(formData.maintenance).toString());
    if (formData.maintenanceFrequency) formDataToSend.append('maintenanceFrequency', formData.maintenanceFrequency);
    
    // Dates (format as YYYY-MM-DD)
    if (formData.launchDate) formDataToSend.append('launchDate', formData.launchDate);
    if (formData.completionDate) formDataToSend.append('completionDate', formData.completionDate);
    if (formData.handoverDate) formDataToSend.append('handoverDate', formData.handoverDate);
    
    // RERA
    if (formData.reraNumber) formDataToSend.append('reraNumber', formData.reraNumber);
    formDataToSend.append('reraApproved', formData.reraApproved ? 'true' : 'false');
    
    // Developer Info
    if (formData.developerName) formDataToSend.append('developerName', formData.developerName);
    if (formData.developerExperience) formDataToSend.append('developerExperience', parseInt(formData.developerExperience).toString());
    if (formData.completedProjects) formDataToSend.append('completedProjects', parseInt(formData.completedProjects).toString());
    if (formData.awards) formDataToSend.append('awards', formData.awards);
    
    // Construction
    if (formData.constructionType) formDataToSend.append('constructionType', formData.constructionType);
    if (formData.constructionQuality) formDataToSend.append('constructionQuality', formData.constructionQuality);
    if (formData.projectArchitect) formDataToSend.append('projectArchitect', formData.projectArchitect);
    
    // Arrays - send as JSON strings
    if (selectedFeatures.length > 0) {
      formDataToSend.append('features', JSON.stringify(selectedFeatures));
    }
    
    
    // Media URLs
    if (formData.videoUrl) formDataToSend.append('videoUrl', formData.videoUrl);
    if (formData.brochureUrl) formDataToSend.append('brochureUrl', formData.brochureUrl);
    if (formData.virtualTourUrl) formDataToSend.append('virtualTourUrl', formData.virtualTourUrl);
    
    // Add images
    images.forEach(image => {
      formDataToSend.append('images', image);
    });

    // Log what we're sending
    console.log("Sending form data:");
    for (let [key, value] of formDataToSend.entries()) {
      if (key === 'images') {
        console.log(key, value.name);
      } else {
        console.log(key, value);
      }
    }

    const response = await API.post('/builder', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log("Success:", response.data);
    toast.success("Project added successfully!");
    navigate('/builder/dashboard?tab=projects');
    
  } catch (error) {
    console.error("Error details:", error.response?.data);
    toast.error(error.response?.data?.message || "Failed to add project");
  } finally {
    setLoading(false);
  }
};

  const nextSection = () => setCurrentSection(currentSection + 1);
  const prevSection = () => setCurrentSection(currentSection - 1);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", padding: '40px 24px' }}>
      <style>{`
        .ap-input { width: 100%; background: white; border: 1px solid rgba(139,115,85,0.2); border-radius: 2px; padding: 12px 14px; font-size: 0.875rem; outline: none; transition: all 0.2s ease; }
        .ap-input:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); }
        .ap-input:hover { border-color: rgba(139,115,85,0.4); }
        .ap-select { width: 100%; background: white; border: 1px solid rgba(139,115,85,0.2); border-radius: 2px; padding: 12px 14px; outline: none; cursor: pointer; }
        .ap-select:focus { border-color: #8B7355; }
        .ap-textarea { width: 100%; background: white; border: 1px solid rgba(139,115,85,0.2); border-radius: 2px; padding: 12px 14px; min-height: 100px; resize: vertical; }
        .ap-textarea:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.1); }
        .ap-btn-primary { background: #8B7355; color: white; border: none; padding: 14px 32px; border-radius: 2px; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; transition: background 0.2s ease; }
        .ap-btn-primary:hover { background: #7A6445; }
        .ap-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .ap-btn-secondary { background: transparent; color: #8B7355; border: 1px solid rgba(139,115,85,0.3); padding: 14px 32px; border-radius: 2px; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all 0.2s ease; }
        .ap-btn-secondary:hover { background: rgba(139,115,85,0.05); border-color: #8B7355; }
        .ap-section { background: white; border: 1px solid rgba(139,115,85,0.12); border-radius: 2px; padding: 32px; margin-bottom: 24px; }
        .ap-section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(139,115,85,0.12); }
        .ap-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .ap-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ap-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ap-feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .ap-feature-item { display: flex; align-items: center; gap: 8px; padding: 10px; border: 1px solid rgba(139,115,85,0.15); border-radius: 2px; cursor: pointer; transition: all 0.2s ease; }
        .ap-feature-item:hover { border-color: #8B7355; background: rgba(139,115,85,0.05); }
        .ap-feature-item.selected { background: #8B7355; color: white; border-color: #8B7355; }
        .ap-feature-item.selected svg { color: white; }
        .ap-progress-bar { display: flex; gap: 4px; margin-bottom: 24px; }
        .ap-progress-step { flex: 1; height: 4px; background: rgba(139,115,85,0.2); border-radius: 2px; }
        .ap-progress-step.active { background: #8B7355; }
        .ap-nearby-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #F5F0E8; border-radius: 2px; margin-bottom: 8px; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBot: 32 }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355', marginBottom: 16 }}>
            <FaArrowLeft size={12} /> Back
          </button>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
            Launch New Project
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 400, color: '#1E1C18', fontFamily: "'Cormorant Garamond', serif" }}>
            Add New <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Project</em>
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="ap-progress-bar">
          {[1, 2, 3, 4, 5].map(step => (
            <div key={step} className={`ap-progress-step ${currentSection >= step ? 'active' : ''}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          {currentSection === 1 && (
            <div className="ap-section">
              <h3 className="ap-section-title">Basic Information</h3>
              
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Project Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="ap-input" placeholder="e.g., Green Valley Residency" />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Tagline</label>
                  <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="ap-input" placeholder="e.g., Live in the heart of nature" />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required className="ap-textarea" placeholder="Detailed description of your project..." />
                </div>

                <div className="ap-grid-2">
                  <div>
                    <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Price (₹) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} onBlur={calculatePricePerSqFt} required className="ap-input" placeholder="e.g., 5000000" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Price per sq.ft (₹)</label>
                    <input type="number" name="pricePerSqFt" value={formData.pricePerSqFt} onChange={handleChange} className="ap-input" placeholder="Auto-calculated" readOnly />
                  </div>
                </div>

                <div className="ap-grid-2">
                  <div>
                    <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Project Type *</label>
                    <select name="projectType" value={formData.projectType} onChange={handleChange} className="ap-select">
                      {projectTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="ap-select">
                      {statusOptions.map(opt => <option key={opt} value={opt}>{opt.replace('-', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" onClick={nextSection} className="ap-btn-primary">Next: Location</button>
              </div>
            </div>
          )}

          {/* Section 2: Location Details */}
          {currentSection === 2 && (
            <div className="ap-section">
              <h3 className="ap-section-title">Location Details</h3>
              
              <div className="ap-grid-2">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Address *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required className="ap-input" placeholder="Street address" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Landmark</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="ap-input" placeholder="Near..." />
                </div>
              </div>

              <div className="ap-grid-3">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="ap-input" placeholder="e.g., Mumbai" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="ap-input" placeholder="e.g., Maharashtra" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="ap-input" placeholder="e.g., 400001" />
                </div>
              </div>

             

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" onClick={prevSection} className="ap-btn-secondary">Previous</button>
                <button type="button" onClick={nextSection} className="ap-btn-primary">Next: Project Details</button>
              </div>
            </div>
          )}

          {/* Section 3: Project Details */}
          {currentSection === 3 && (
            <div className="ap-section">
              <h3 className="ap-section-title">Project Details</h3>
              
              <div className="ap-grid-3">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Total Units</label>
                  <input type="number" name="totalUnits" value={formData.totalUnits} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Available Units</label>
                  <input type="number" name="availableUnits" value={formData.availableUnits} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Total Towers</label>
                  <input type="number" name="totalTowers" value={formData.totalTowers} onChange={handleChange} className="ap-input" />
                </div>
              </div>

              <div className="ap-grid-3">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Floors per Tower</label>
                  <input type="number" name="floorsPerTower" value={formData.floorsPerTower} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Land Area (sq.ft)</label>
                  <input type="number" name="landArea" value={formData.landArea} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Land Ownership</label>
                  <select name="landOwnership" value={formData.landOwnership} onChange={handleChange} className="ap-select">
                    {landOwnershipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="ap-grid-3">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Launch Date</label>
                  <input type="date" name="launchDate" value={formData.launchDate} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Completion Date</label>
                  <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Handover Date</label>
                  <input type="date" name="handoverDate" value={formData.handoverDate} onChange={handleChange} className="ap-input" />
                </div>
              </div>

              <div className="ap-grid-2">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>RERA Number</label>
                  <input type="text" name="reraNumber" value={formData.reraNumber} onChange={handleChange} className="ap-input" placeholder="e.g., RERA/2024/001" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" name="reraApproved" checked={formData.reraApproved} onChange={handleChange} id="reraApproved" />
                  <label htmlFor="reraApproved" style={{ fontSize: '0.8rem', color: '#1E1C18' }}>RERA Approved</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" onClick={prevSection} className="ap-btn-secondary">Previous</button>
                <button type="button" onClick={nextSection} className="ap-btn-primary">Next: Unit Details</button>
              </div>
            </div>
          )}

          {/* Section 4: Unit Details */}
          {currentSection === 4 && (
            <div className="ap-section">
              <h3 className="ap-section-title">Unit Details</h3>
              
              <div className="ap-grid-4">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Bedrooms</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Bathrooms</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Balconies</label>
                  <input type="number" name="balconies" value={formData.balconies} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Facing</label>
                  <select name="facing" value={formData.facing} onChange={handleChange} className="ap-select">
                    {facingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="ap-grid-3">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Area (sq.ft) *</label>
                  <input type="number" name="area" value={formData.area} onChange={handleChange} required className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Carpet Area (sq.ft)</label>
                  <input type="number" name="carpetArea" value={formData.carpetArea} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Super Area (sq.ft)</label>
                  <input type="number" name="superArea" value={formData.superArea} onChange={handleChange} className="ap-input" />
                </div>
              </div>

              <div className="ap-grid-3">
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Length (ft)</label>
                  <input type="number" name="length" value={formData.length} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Breadth (ft)</label>
                  <input type="number" name="breadth" value={formData.breadth} onChange={handleChange} className="ap-input" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Ceiling Height (ft)</label>
                  <input type="number" name="ceilingHeight" value={formData.ceilingHeight} onChange={handleChange} className="ap-input" />
                </div>
              </div>


              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" onClick={prevSection} className="ap-btn-secondary">Previous</button>
                <button type="button" onClick={nextSection} className="ap-btn-primary">Next: Features & Amenities</button>
              </div>
            </div>
          )}

          {/* Section 5: Features & Amenities */}
          {currentSection === 5 && (
            <div className="ap-section">
              <h3 className="ap-section-title">Features & Amenities</h3>
              
              {/* Features by Category */}
              {Object.entries(groupedFeatures).map(([category, features]) => (
                <div key={category} style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E1C18', marginBottom: 12 }}>{category}</h4>
                  <div className="ap-feature-grid">
                    {features.map(feature => (
                      <div
                        key={feature.id}
                        className={`ap-feature-item ${selectedFeatures.includes(feature.id) ? 'selected' : ''}`}
                        onClick={() => {
                          if (selectedFeatures.includes(feature.id)) {
                            setSelectedFeatures(selectedFeatures.filter(f => f !== feature.id));
                          } else {
                            setSelectedFeatures([...selectedFeatures, feature.id]);
                          }
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>{feature.icon}</span>
                        <span style={{ fontSize: '0.8rem' }}>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Image Upload */}
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E1C18', marginBottom: 12 }}>Project Images</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,115,85,0.2)' }}>
                      <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', width: 24, height: 24, borderRadius: 2, cursor: 'pointer', color: 'white' }}>
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 20 && (
                    <label style={{ aspectRatio: '1/1', border: '2px dashed rgba(139,115,85,0.3)', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F5F0E8' }}>
                      <FaUpload style={{ color: '#8B7355', fontSize: '1.2rem', marginBottom: 8 }} />
                      <span style={{ fontSize: '0.7rem', color: '#8B7355' }}>Upload Images</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Additional Media */}
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E1C18', marginBottom: 12 }}>Additional Media</h4>
                <div className="ap-grid-3">
                  <div>
                    <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Video Tour URL</label>
                    <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="ap-input" placeholder="YouTube/Vimeo link" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Brochure URL</label>
                    <input type="url" name="brochureUrl" value={formData.brochureUrl} onChange={handleChange} className="ap-input" placeholder="PDF link" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Virtual Tour URL</label>
                    <input type="url" name="virtualTourUrl" value={formData.virtualTourUrl} onChange={handleChange} className="ap-input" placeholder="3D tour link" />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" onClick={prevSection} className="ap-btn-secondary">Previous</button>
                <button type="submit" disabled={loading} className="ap-btn-primary">
                  {loading ? 'Adding Project...' : 'Add Project'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AddProject;