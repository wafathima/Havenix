import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../api/axios";
import { FaHome, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaArrowLeft, FaUpload, FaTimes, FaImage, FaBolt, FaDumbbell, FaWifi, FaVideo } from "react-icons/fa";
import { MdBalcony, MdSecurity, MdKitchen, MdPets, MdAcUnit, MdOutlinePool, MdOutlineLocalParking } from "react-icons/md";
import toast from "react-hot-toast";

function EditProperty() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${import.meta.env.VITE_API_URL}${imagePath}`;
    return `http://localhost:5050/${imagePath}`;
  };

  useEffect(() => {
const fetchProperty = async () => {
  try {
    setFetching(true);
    const { data } = await API.get(`/builder/properties/${id}`);
    console.log("Fetched property:", data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          location: data.location || "",
          type: data.type || "Home",
          bedrooms: data.bedrooms || "",
          bathrooms: data.bathrooms || "",
          area: data.area || "",
          floor: data.floor || "",
          totalFloors: data.totalFloors || "",
          furnished: data.furnished || "Semi-Furnished",
          yearBuilt: data.yearBuilt || "",
          parking: data.parking || "",
          features: data.features || [],
          status: data.status || "available"
        });
        
        setExistingImages(data.images || []);
    setSelectedFeatures(data.features || []);
    
     } catch (error) {
    console.error("Error fetching property:", error);
    toast.error("Failed to load property details");
    navigate("/builder?tab=properties");
  } finally {
    setFetching(false);
  }
};
    
    fetchProperty();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFeatureToggle = (featureLabel) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureLabel)) {
        return prev.filter(f => f !== featureLabel);
      } else {
        return [...prev, featureLabel];
      }
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 10) {
      toast.error("You can upload maximum 10 images");
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (existingImages.length === 0 && images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append('features', JSON.stringify(selectedFeatures));
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await API.put(`/builder/properties/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log("Update property response:", response.data);
      toast.success("Property updated successfully!");
      navigate("/builder?tab=properties");
      
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error(error.response?.data?.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", padding: '40px 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .ep-sans { font-family: 'DM Sans', sans-serif; }
        .ep-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        
        .ep-input {
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
        .ep-input:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }
        
        .ep-select {
          width: 100%;
          background: white;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 12px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C2A26;
          outline: none;
        }
        
        .ep-textarea {
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
        
        .ep-feature-btn {
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
        .ep-feature-btn.selected {
          background: #8B7355;
          color: white;
          border-color: #8B7355;
        }
        
        .ep-btn-primary {
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
        .ep-btn-primary:hover { background: #7A6445; }
        .ep-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .ep-btn-secondary {
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
        .ep-btn-secondary:hover { background: rgba(139,115,85,0.08); }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355', marginBottom: 16 }}
          >
            <FaArrowLeft size={12} /> Back
          </button>
          <div className="ep-sans" style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>
            Edit Property
          </div>
          <h1 className="ep-serif" style={{ fontSize: '2.5rem', fontWeight: 400, color: '#1E1C18', lineHeight: 1.1 }}>
            Edit <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Property</em>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ep-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 16 }}>Property Images</h3>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', color: '#8B7355', marginBottom: 8 }}>Current Images</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                  {existingImages.map((img, index) => (
                    <div key={index} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,115,85,0.2)' }}>
                      <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', width: 24, height: 24, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,115,85,0.2)' }}>
                  <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(index, false)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', width: 24, height: 24, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              
              {(existingImages.length + imagePreviews.length) < 10 && (
                <label style={{ aspectRatio: '1/1', border: '2px dashed rgba(139,115,85,0.3)', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F5F0E8' }}>
                  <FaUpload style={{ color: '#8B7355', fontSize: '1.2rem', marginBottom: 8 }} />
                  <span className="ep-sans" style={{ fontSize: '0.7rem', color: '#8B7355' }}>Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            <p className="ep-sans" style={{ fontSize: '0.7rem', color: '#A89880' }}>Upload up to 10 images. First image will be the cover.</p>
          </div>

          {/* Basic Information */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ep-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 20 }}>Basic Information</h3>
            
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="ep-input"
                />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="ep-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="ep-input"
                  />
                </div>
                <div>
                  <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="ep-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ep-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 20 }}>Property Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} className="ep-select">
                  {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Bedrooms</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="ep-input" />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Bathrooms</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="ep-input" />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Area (sq.ft) *</label>
                <input type="number" name="area" value={formData.area} onChange={handleChange} required className="ep-input" />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Floor</label>
                <input type="number" name="floor" value={formData.floor} onChange={handleChange} className="ep-input" />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Total Floors</label>
                <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} className="ep-input" />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Furnished</label>
                <select name="furnished" value={formData.furnished} onChange={handleChange} className="ep-select">
                  {furnishedOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Year Built</label>
                <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} className="ep-input" />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Parking</label>
                <input type="number" name="parking" value={formData.parking} onChange={handleChange} className="ep-input" />
              </div>

              <div>
                <label className="ep-sans" style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 6 }}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="ep-select">
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: 32, marginBottom: 24 }}>
            <h3 className="ep-sans" style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1C18', marginBottom: 16 }}>Amenities & Features</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {availableFeatures.map(feature => (
                <button
                  key={feature.id}
                  type="button"
                  className={`ep-feature-btn ${selectedFeatures.includes(feature.label) ? 'selected' : ''}`}
                  onClick={() => handleFeatureToggle(feature.label)}
                >
                  {feature.icon} {feature.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate('/builder?tab=properties')} className="ep-btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="ep-btn-primary">
              {loading ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;
