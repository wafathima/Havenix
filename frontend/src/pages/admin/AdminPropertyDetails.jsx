import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineHome,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineStatusOnline,
  HiOutlineOfficeBuilding,
   HiOutlineColorSwatch,
    HiOutlineViewGrid,
    HiOutlinePhone,
    
} from "react-icons/hi";

function AdminPropertyDetails() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/admin/properties/${propertyId}`);
      if (data.success) {
        setProperty(data.property);
      } else {
        toast.error(data.message || "Failed to load property details");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error(error.response?.data?.message || "Failed to load property details");
    } finally {
      setLoading(false);
    }
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
          <p style={{ color: "#8B7355" }}>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#F5F0E8",
        minHeight: "100vh",
        padding: "36px 40px"
      }}>
        <button
          onClick={() => navigate('/admin/properties')}
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
          <HiOutlineArrowLeft /> Back to Properties
        </button>
        <div style={{ textAlign: "center", padding: 60, color: "#A89880" }}>
          Property not found
        </div>
      </div>
    );
  }

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
      `}</style>

      <button
        onClick={() => navigate('/admin/properties')}
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
          marginBottom: 24
        }}
      >
        <HiOutlineArrowLeft /> Back to Properties
      </button>

      <div style={{ marginBottom: 30 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#A89880", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
          Property Details
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: "#2C2A26", fontWeight: 400, fontStyle: "italic" }}>
          {property.title}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Main Info */}
        <div className="detail-card">
          <h2 style={{ fontSize: 18, marginBottom: 20, color: "#2C2A26" }}>Property Information</h2>
          
          {property.images && property.images.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <img 
                src={property.images[0]} 
                alt={property.title}
                style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 12 }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Price</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: "#2C2A26" }}>
                ₹{property.price?.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Status</p>
              <span style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 13,
                background: property.status === 'available' ? '#EDF2EE' : '#F5EDED',
                color: property.status === 'available' ? '#4A7C59' : '#8B4040',
                border: `1px solid ${property.status === 'available' ? '#B8D0BF' : '#D4AAAA'}`
              }}>
                {property.status}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Type</p>
              <p style={{ fontSize: 15, color: "#2C2A26" }}>{property.type}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Area</p>
              <p style={{ fontSize: 15, color: "#2C2A26" }}>{property.area} sq.ft</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Bedrooms</p>
              <p style={{ fontSize: 15, color: "#2C2A26" }}>{property.bedrooms}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Bathrooms</p>
              <p style={{ fontSize: 15, color: "#2C2A26" }}>{property.bathrooms}</p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Description</p>
            <p style={{ fontSize: 14, color: "#2C2A26", lineHeight: 1.6 }}>{property.description}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, color: "#A89880", marginBottom: 4 }}>Location</p>
            <p style={{ fontSize: 15, color: "#2C2A26", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlineLocationMarker /> 
              {property.location} 
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="detail-card">
            <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26" }}>Seller Information</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#EDE8DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#8B7355'
              }}>
                {property.seller?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#2C2A26" }}>{property.seller?.name}</p>
                <p style={{ fontSize: 13, color: "#8B7355" }}>{property.seller?.email}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 8 }}>
              <HiOutlinePhone /> {property.seller?.phone || 'No phone'}
            </p>
          </div>

          <div className="detail-card">
            <h2 style={{ fontSize: 18, marginBottom: 16, color: "#2C2A26" }}>Additional Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineCalendar /> Listed: {new Date(property.createdAt).toLocaleDateString()}
              </p>
              <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlinePhotograph /> {property.images?.length || 0} images
              </p>
              <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineViewGrid /> {property.area} sq.ft
              </p>
              <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineOfficeBuilding /> {property.bedrooms} BHK
              </p>
              <p style={{ fontSize: 13, color: "#6B5840", display: "flex", alignItems: "center", gap: 8 }}>
                <HiOutlineColorSwatch /> {property.bathrooms} Bathrooms
    
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPropertyDetails;