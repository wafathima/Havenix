import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { FaBed, FaBath, FaCar, FaRuler } from "react-icons/fa";

export default function EditPurchasedProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "Home",
    status: "available",
    bedrooms: "",
    bathrooms: "",
    area: "",
    floor: "1",
    totalFloors: "1",
    furnished: "Semi-Furnished",
    yearBuilt: "",
    parking: "0",
    features: []
  });
  const [featureInput, setFeatureInput] = useState("");
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/seller/properties/${id}`);
        const propertyData = response.data;
        
        // Check if user is the owner
        if (propertyData.owner !== user?._id) {
          toast.error("You don't have permission to edit this property");
          navigate("/seller/dashboard");
          return;
        }
        
        setProperty(propertyData);
        setFormData({
          title: propertyData.title || "",
          description: propertyData.description || "",
          price: propertyData.price || "",
          location: propertyData.location || "",
          type: propertyData.type || "Home",
          status: propertyData.status || "available",
          bedrooms: propertyData.bedrooms || "",
          bathrooms: propertyData.bathrooms || "",
          area: propertyData.area || "",
          floor: propertyData.floor || "1",
          totalFloors: propertyData.totalFloors || "1",
          furnished: propertyData.furnished || "Semi-Furnished",
          yearBuilt: propertyData.yearBuilt || "",
          parking: propertyData.parking || "0",
          features: propertyData.features || []
        });
        setImages(propertyData.images || []);
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error(error.response?.data?.message || "Failed to load property");
        navigate("/seller/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setImages(prev => prev.filter(img => img !== imageUrl));
    setDeleteImages(prev => [...prev, imageUrl]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.location || !formData.area) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add delete images
      if (deleteImages.length > 0) {
        submitData.append('deleteImages', JSON.stringify(deleteImages));
      }
      
      // Add existing images that remain
      submitData.append('existingImages', JSON.stringify(images));
      
      // Add new images
      newImages.forEach(image => {
        submitData.append('images', image);
      });
      
      const response = await API.put(`/seller/properties/purchased/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success("Property updated successfully!");
        navigate("/seller/dashboard");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error(error.response?.data?.message || "Failed to update property");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', padding: '40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button 
            onClick={() => navigate("/seller/dashboard")}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#8B7355',
              marginBottom: 16
            }}
          >
            <ArrowLeftIcon style={{ width: 16, height: 16 }} />
            Back to Dashboard
          </button>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 400, color: '#1E1C18', marginBottom: 8 }}>
            Edit <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Property</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#8B7355' }}>
            Update your property details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 2, padding: '32px' }}>
          
          {/* Property Status - Important for sellers */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
              Property Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
              required
            >
              <option value="available">Available for Sale</option>
              <option value="sold">Sold</option>
              <option value="under_contract">Under Contract</option>
              <option value="under_construction">Under Construction</option>
            </select>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#A89880', marginTop: 4 }}>
              Set the current status of this property
            </p>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
              Property Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Luxury 3BHK Apartment in South Delhi"
              style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
              required
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              placeholder="Describe your property in detail..."
              style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, fontFamily: "'DM Sans', sans-serif", resize: 'vertical' }}
              required
            />
          </div>

          {/* Price and Location Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 7500000"
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
                required
              />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Greater Kailash, New Delhi"
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
                required
              />
            </div>
          </div>

          {/* Type and Furnished */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                Property Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
              >
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Farmhouse">Farmhouse</option>
                <option value="Home">Home</option>
                <option value="Condo">Condo</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Office">Office</option>
                <option value="Land">Land</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                Furnished Status
              </label>
              <select
                name="furnished"
                value={formData.furnished}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2, fontFamily: "'DM Sans', sans-serif" }}
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Area, Parking */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                <FaBed style={{ display: 'inline', marginRight: 4 }} /> Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="0"
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2 }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                <FaBath style={{ display: 'inline', marginRight: 4 }} /> Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="0"
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2 }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                <FaRuler style={{ display: 'inline', marginRight: 4 }} /> Area (sq.ft) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                min="100"
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2 }}
                required
              />
            </div>
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
                <FaCar style={{ display: 'inline', marginRight: 4 }} /> Parking
              </label>
              <input
                type="number"
                name="parking"
                value={formData.parking}
                onChange={handleInputChange}
                min="0"
                style={{ width: '100%', padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2 }}
              />
            </div>
          </div>

          {/* Features */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
              Features & Amenities
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="e.g., Swimming Pool, Gym, Parking"
                style={{ flex: 1, padding: '12px', border: '1px solid rgba(139,115,85,0.25)', borderRadius: 2 }}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                style={{ padding: '12px 20px', background: '#1E1C18', color: 'white', border: 'none', borderRadius: 2, cursor: 'pointer' }}
              >
                <PlusIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {formData.features.map((feature, index) => (
                <span key={index} style={{ background: '#F5F0E8', padding: '6px 12px', borderRadius: 2, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {feature}
                  <button type="button" onClick={() => handleRemoveFeature(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <XMarkIcon style={{ width: 14, height: 14, color: '#C4503C' }} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#1E1C18', display: 'block', marginBottom: 8 }}>
              Property Images
            </label>
            
            {/* Existing Images */}
            {images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 8 }}>Current Images:</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 100, height: 100 }}>
                      <img src={`http://localhost:5050${img}`} alt={`Property ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img)}
                        style={{ position: 'absolute', top: -8, right: -8, background: '#C4503C', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <XMarkIcon style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.7rem', color: '#8B7355', marginBottom: 8 }}>New Images to Add:</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {newImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 100, height: 100 }}>
                      <img src={URL.createObjectURL(img)} alt={`New ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        style={{ position: 'absolute', top: -8, right: -8, background: '#C4503C', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <XMarkIcon style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div style={{ border: '2px dashed rgba(139,115,85,0.25)', borderRadius: 2, padding: '24px', textAlign: 'center' }}>
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, color: '#8B7355' }}>
                <PhotoIcon style={{ width: 20, height: 20 }} />
                Click to upload new images
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
            <button
              type="button"
              onClick={() => navigate("/seller/dashboard")}
              style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(139,115,85,0.3)', borderRadius: 2, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '12px 32px', background: '#1E1C18', color: 'white', border: 'none', borderRadius: 2, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
