import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../api/axios";
import { FaHome, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaArrowLeft, FaUpload, FaTimes, FaImage, FaBolt,  FaDumbbell, FaWifi,FaVideo } from "react-icons/fa";
import { MdBalcony, MdSecurity, MdKitchen, MdPets, MdAcUnit, MdOutlinePool, MdOutlineLocalParking } from "react-icons/md";
import toast from "react-hot-toast";

function AddProperty() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "Home",
    bedrooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    totalFloors: "",
    furnished: "Semi-Furnished",
    yearBuilt: "",
    parking: "",
    features: [],
    status: "available"
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // Available features for selection
  const availableFeatures = [
    { id: "swimming", label: "Swimming Pool", icon: <MdOutlinePool /> },
    { id: "garden", label: "Garden", icon: <FaHome /> },
    { id: "parking", label: "Parking", icon: <MdOutlineLocalParking /> },
    { id: "security", label: "Security", icon: <MdSecurity /> },
    { id: "powerBackup", label: "Power Backup", icon: <FaBolt /> },
    { id: "modularKitchen", label: "Modular Kitchen", icon: <MdKitchen /> },
    { id: "balcony", label: "Balcony", icon: <MdBalcony /> },
    { id: "gym", label: "Gym", icon: <FaDumbbell /> },
    { id: "wifi", label: "WiFi", icon: <FaWifi /> },
    { id: "cctv", label: "CCTV", icon: <FaVideo /> },
    { id: "petFriendly", label: "Pet Friendly", icon: <MdPets /> },
    { id: "ac", label: "Air Conditioning", icon: <MdAcUnit /> }
  ];

  const propertyTypes = ["Villa", "Apartment", "Farmhouse", "Home", "Condo", "Penthouse", "Office", "Land"];
  const furnishedOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];
  const statusOptions = ["available", "sold", "under_contract", "under_construction"];

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle feature selection
  const handleFeatureToggle = (featureLabel) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureLabel)) {
        return prev.filter(f => f !== featureLabel);
      } else {
        return [...prev, featureLabel];
      }
    });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 10) {
      toast.error("You can upload maximum 10 images");
      return;
    }

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
  };

  // Remove image
  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (images.length === 0) {
    toast.error("Please upload at least one image");
    return;
  }

  setLoading(true);
  
  try {
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== "") {
        // Don't append features here - we'll handle it separately
        if (key !== 'features') {
          formDataToSend.append(key, formData[key]);
          console.log(`Appending ${key}:`, formData[key]);
        }
      }
    });

    // Append features as a JSON string
    console.log("Selected features:", selectedFeatures);
    formDataToSend.append('features', JSON.stringify(selectedFeatures));

    // Append images
    console.log("Images to upload:", images.length);
    images.forEach((image, index) => {
      formDataToSend.append('images', image);
      console.log(`Appending image ${index}:`, image.name, image.type, image.size);
    });

    // Log FormData contents (for debugging)
    console.log("=== FormData Contents ===");
    for (let pair of formDataToSend.entries()) {
      if (pair[0] === 'images') {
        console.log(pair[0] + ': [File] ' + (pair[1]?.name || 'unknown'));
      } else {
        console.log(pair[0] + ': ' + pair[1]);
      }
    }

    // POST to builder/properties endpoint
    const response = await API.post('/builder/properties', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log("Add property response:", response.data);
    toast.success("Property added successfully!");
    navigate("/builder?tab=properties");
    
  } catch (error) {
    console.error("Error adding property:", error);
    console.error("Error response:", error.response?.data);
    
    // Show more detailed error message
    if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors.map(err => err.message).join(', ');
      toast.error(`Validation failed: ${errorMessages}`);
    } else {
      toast.error(error.response?.data?.message || "Failed to add property");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", padding: '40px 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .ap-sans { font-family: 'DM Sans', sans-serif; }
        .ap-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        
        .ap-input {
          width: 100%;
          background: white;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 12px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C2A26;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        }
        .ap-input:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }
        .ap-input::placeholder { color: #A89880; }
        
        .ap-select {
          width: 100%;
          background: white;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 12px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C2A26;
          outline: none;
          appearance: none;
        }
        
        .ap-textarea {
          width: 100%;
          background: white;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 12px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C2A26;
          outline: none;
          resize: vertical;
          min-height: 100px;
        }
        
        .ap-feature-btn {
          padding: 10px 16px;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          background: white;
          color: #6B6355;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ap-feature-btn.selected {
          background: #8B7355;
          color: white;
          border-color: #8B7355;
        }
        
        .ap-btn-primary {
          background: #8B7355;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .ap-btn-primary:hover { background: #7A6445; }
        .ap-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .ap-btn-secondary {
          background: transparent;
          color: #8B7355;
          border: 1px solid rgba(139,115,85,0.3);
          padding: 14px 32px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .ap-btn-secondary:hover { background: rgba(139,115,85,0.08); }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355', marginBottom: 16 }}
          >
            <FaArrowLeft size={12} /> Back
          </button>
          <div className="ap-sans" style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
            List Your Property
          </div>
          <h1 className="ap-serif" style={{ fontSize: '2.5rem', fontWeight: 400, color: '#1E1C18', lineHeight: 1.1 }}>
            Add New <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Property</em>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ap-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 16 }}>Property Images</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,115,85,0.2)' }}>
                  <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', width: 24, height: 24, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              
              {imagePreviews.length < 10 && (
                <label style={{ aspectRatio: '1/1', border: '2px dashed rgba(139,115,85,0.3)', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F5F0E8' }}>
                  <FaUpload style={{ color: '#8B7355', fontSize: '1.2rem', marginBottom: 8 }} />
                  <span className="ap-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            <p className="ap-sans" style={{ fontSize: '0.7rem', color: '#A89880' }}>Upload up to 10 images. First image will be the cover.</p>
          </div>

          {/* Basic Information */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ap-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 20 }}>Basic Information</h3>
            
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Luxurious 3BHK Villa with Pool"
                  className="ap-input"
                />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your property in detail..."
                  className="ap-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="25000000"
                    className="ap-input"
                  />
                </div>
                <div>
                  <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Goa"
                    className="ap-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ap-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 20 }}>Property Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} className="ap-select">
                  {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Bedrooms</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} placeholder="3" className="ap-input" />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Bathrooms</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="2" className="ap-input" />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Area (sq.ft) *</label>
                <input type="number" name="area" value={formData.area} onChange={handleChange} required placeholder="1500" className="ap-input" />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Floor</label>
                <input type="number" name="floor" value={formData.floor} onChange={handleChange} placeholder="2" className="ap-input" />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Total Floors</label>
                <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} placeholder="5" className="ap-input" />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Furnished</label>
                <select name="furnished" value={formData.furnished} onChange={handleChange} className="ap-select">
                  {furnishedOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Year Built</label>
                <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} placeholder="2020" className="ap-input" />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Parking</label>
                <input type="number" name="parking" value={formData.parking} onChange={handleChange} placeholder="2" className="ap-input" />
              </div>

              <div>
                <label className="ap-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="ap-select">
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ap-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 16 }}>Amenities & Features</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {availableFeatures.map(feature => (
                <button
                  key={feature.id}
                  type="button"
                  className={`ap-feature-btn ${selectedFeatures.includes(feature.label) ? 'selected' : ''}`}
                  onClick={() => handleFeatureToggle(feature.label)}
                >
                  {feature.icon} {feature.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate('/seller')} className="ap-btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="ap-btn-primary">
              {loading ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;


