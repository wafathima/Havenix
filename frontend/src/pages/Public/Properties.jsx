import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { FaSearch, FaFilter, FaBed, FaBath, FaArrowRight, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import { Toaster } from "react-hot-toast";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    type: "",
    bedrooms: ""
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/properties");
        
        // REMOVED: Don't transform sold to available - show actual status
        // Just set the properties as they come from the database
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.log(error.response?.data || error.message);
        toast.error("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const formatPrice = (price) => {
    if (!price) return "Price on Request";
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lac`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);
    setFilteredProperties(properties.filter(p =>
      p.title?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    ));
  };

  const applyFilters = () => {
    let filtered = [...properties];
    if (filters.minPrice) filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
    if (filters.type) filtered = filtered.filter(p => p.type?.toLowerCase() === filters.type.toLowerCase());
    if (filters.bedrooms) filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    setFilteredProperties(filtered);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", type: "", bedrooms: "" });
    setFilteredProperties(properties);
    setSearchTerm("");
  };

  const propertyTypes = [...new Set(properties.map(p => p.type).filter(Boolean))];

  // Updated status style function - shows actual status
  const getStatusStyle = (status) => {
    switch(status) {
      case 'available':
        return { bg: 'rgba(139,115,85,0.12)', color: '#8B7355', border: 'rgba(139,115,85,0.3)', label: 'AVAILABLE' };
      case 'sold':
        return { bg: 'rgba(107,99,85,0.1)', color: '#6B6355', border: 'rgba(107,99,85,0.25)', label: 'SOLD' };
      case 'under_contract':
        return { bg: 'rgba(196,169,122,0.12)', color: '#C4A97A', border: 'rgba(196,169,122,0.35)', label: 'UNDER CONTRACT' };
      case 'under_construction':
        return { bg: 'rgba(168,152,128,0.1)', color: '#A89880', border: 'rgba(168,152,128,0.2)', label: 'UNDER CONSTRUCTION' };
      default:
        return { bg: 'rgba(139,115,85,0.1)', color: '#8B7355', border: 'rgba(139,115,85,0.25)', label: status?.toUpperCase() || 'AVAILABLE' };
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:5050${imagePath}`;
    return imagePath;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pr-sans  { font-family: 'DM Sans', sans-serif; }
        .pr-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .pr-search-input {
          width: 100%;
          background: white;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 12px 16px 12px 42px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C2A26;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .pr-search-input:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }
        .pr-search-input::placeholder { color: #A89880; }

        .pr-select {
          width: 100%;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C2A26;
          outline: none;
          appearance: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .pr-select:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }

        .pr-input {
          width: 100%;
          background: #F5F0E8;
          border: 1px solid rgba(139,115,85,0.2);
          border-radius: 2px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C2A26;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        }
        .pr-input:focus {
          border-color: #8B7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.1);
        }
        .pr-input::placeholder { color: #A89880; }

        .pr-filter-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 20px;
          background: white;
          border: 1px solid rgba(139,115,85,0.25);
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          color: #8B7355;
          cursor: pointer;
          transition: background 0.25s ease, border-color 0.25s ease;
          white-space: nowrap;
        }
        .pr-filter-btn:hover, .pr-filter-btn.active {
          background: rgba(139,115,85,0.08);
          border-color: #8B7355;
        }

        .pr-card {
          background: white;
          border: 1px solid rgba(139,115,85,0.12);
          border-radius: 2px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pr-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.09);
        }
        .pr-card:hover .pr-card-img { transform: scale(1.07); }
        .pr-card-img { transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

        .pr-card-arrow {
          width: 40px; height: 40px;
          border: 1px solid rgba(139,115,85,0.35);
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          color: #8B7355;
          text-decoration: none;
          flex-shrink: 0;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }
        .pr-card:hover .pr-card-arrow {
          background: #8B7355;
          color: white;
          border-color: #8B7355;
        }

        .pr-btn-primary {
          background: #8B7355;
          color: #F5F0E8;
          border: none;
          padding: 11px 28px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .pr-btn-primary:hover { background: #7A6445; }

        .pr-btn-ghost {
          background: transparent;
          color: #8B7355;
          border: 1px solid rgba(139,115,85,0.35);
          padding: 10px 24px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .pr-btn-ghost:hover {
          background: rgba(139,115,85,0.08);
          border-color: #8B7355;
        }

        @keyframes pr-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pr-filter-panel {
          animation: pr-fade-in 0.2s ease forwards;
        }

        .pr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .pr-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .pr-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <div style={{ maxWidth: 520 }}>
            <div className="pr-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 10 }}>
              Browse Collection
            </div>
            <h1 className="pr-serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 300, color: '#1E1C18', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Explore Our <em style={{ fontStyle: 'italic', color: '#8B7355' }}>Latest</em> Properties
            </h1>
            <p className="pr-sans" style={{ color: '#6B6355', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300 }}>
              Discover verified homes and investment opportunities tailored to your lifestyle.
            </p>
          </div>

          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A89880', fontSize: '0.8rem' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="City, area or property name…"
                className="pr-search-input"
                style={{ width: 300 }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`pr-filter-btn ${showFilters ? 'active' : ''}`}
            >
              <FaFilter size={11} />
              Filters {(filters.minPrice || filters.maxPrice || filters.type || filters.bedrooms) ? '·' : ''}
            </button>
          </div>
        </div>

        {/* ── FILTER PANEL ── */}
        {showFilters && (
          <div className="pr-filter-panel" style={{ background: 'white', border: '1px solid rgba(139,115,85,0.15)', borderRadius: 2, padding: '28px 32px', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <div>
                <div className="pr-sans" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 }}>Refine</div>
                <h3 className="pr-serif" style={{ fontSize: '1.3rem', fontWeight: 400, color: '#1E1C18' }}>Filter Properties</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
              <div>
                <label className="pr-sans" style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Min Price (₹)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="e.g. 5000000"
                  className="pr-input"
                />
              </div>
              <div>
                <label className="pr-sans" style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Max Price (₹)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="e.g. 10000000"
                  className="pr-input"
                />
              </div>
              <div>
                <label className="pr-sans" style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Property Type</label>
                <select
                  value={filters.type}
                  onChange={e => setFilters({ ...filters, type: e.target.value })}
                  className="pr-select"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="pr-sans" style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 8 }}>Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={e => setFilters({ ...filters, bedrooms: e.target.value })}
                  className="pr-select"
                >
                  <option value="">Any</option>
                  {['1','2','3','4','5'].map(n => <option key={n} value={n}>{n}+ BHK</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 20, borderTop: '1px solid rgba(139,115,85,0.1)' }}>
              <button onClick={clearFilters} className="pr-btn-ghost">Clear All</button>
              <button onClick={applyFilters} className="pr-btn-primary">Apply Filters</button>
            </div>
          </div>
        )}

        {/* ── RESULTS META ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(139,115,85,0.12)' }}>
          <p className="pr-sans" style={{ fontSize: '0.78rem', color: '#8B7355', letterSpacing: '0.04em' }}>
            Showing <strong style={{ color: '#1E1C18' }}>{filteredProperties.length}</strong> properties
            {searchTerm && <> matching <em style={{ color: '#8B7355' }}>"{searchTerm}"</em></>}
          </p>
          {(searchTerm || filters.minPrice || filters.maxPrice || filters.type || filters.bedrooms) && (
            <button onClick={clearFilters} className="pr-sans" style={{ background: 'none', border: 'none', color: '#8B7355', fontSize: '0.72rem', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', letterSpacing: '0.06em' }}>
              Clear all
            </button>
          )}
        </div>

        {/* ── LOADING SKELETONS ── */}
        {loading && (
          <div className="pr-grid">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} style={{ background: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,115,85,0.1)', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ aspectRatio: '4/3', background: '#EDE8DC' }} />
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ height: 16, background: '#EDE8DC', borderRadius: 2, marginBottom: 10, width: '70%' }} />
                  <div style={{ height: 12, background: '#EDE8DC', borderRadius: 2, marginBottom: 8, width: '45%' }} />
                  <div style={{ height: 20, background: '#EDE8DC', borderRadius: 2, width: '35%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROPERTIES GRID ── */}
        {!loading && filteredProperties.length > 0 && (
          <div className="pr-grid">
            {filteredProperties.map((property, idx) => {
              // Show actual status from database
              const actualStatus = property.status || 'available';
              const statusStyle = getStatusStyle(actualStatus);
              
              return (
                <div key={property._id} className="pr-card" style={{ animationDelay: `${idx * 0.04}s` }}>

                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#EDE8DC' }}>
                    {property.images?.[0] ? (
                      <img
                        src={getImageUrl(property.images?.[0])}
                        alt={property.title}
                        className="pr-card-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML += `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:absolute;inset:0"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4A97A" stroke-width="1" opacity="0.4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>`;
                        }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaHome style={{ fontSize: '2.5rem', color: '#C4A97A', opacity: 0.3 }} />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,28,24,0.35) 0%, transparent 50%)', pointerEvents: 'none' }} />

                    {/* Status badge - Shows actual status from database */}
                    <div className="pr-sans" style={{
                      position: 'absolute', top: 14, left: 14,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                      fontWeight: 600, padding: '4px 10px', borderRadius: 2,
                      backdropFilter: 'blur(8px)',
                    }}>
                      {statusStyle.label}
                    </div>
                  </div>

                  {/* Rest of the card */}
                  <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: 16, flex: 1 }}>
                      <h3 className="pr-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#1E1C18', lineHeight: 1.2, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.title}
                      </h3>
                      <p className="pr-sans" style={{ fontSize: '0.78rem', color: '#8B7355', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                        <FaMapMarkerAlt size={10} />
                        {property.location || "Location not specified"}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="pr-sans" style={{ fontSize: '0.72rem', color: '#8B7355', letterSpacing: '0.06em' }}>Verified Property</span>
                      </div>
                    </div>

                    {/* Price row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16, borderTop: '1px solid rgba(139,115,85,0.1)' }}>
                      <div>
                        <p className="pr-sans" style={{ fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A89880', marginBottom: 2 }}>Price</p>
                        <p className="pr-serif" style={{ fontSize: '1.4rem', fontWeight: 600, color: '#1E1C18', lineHeight: 1 }}>
                          {formatPrice(property.price)}
                        </p>
                      </div>
                      <Link to={`/property/${property._id}`} className="pr-card-arrow">
                        <FaArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && filteredProperties.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 64, height: 64, border: '1px solid rgba(139,115,85,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FaHome style={{ fontSize: '1.5rem', color: '#C4A97A', opacity: 0.5 }} />
            </div>
            <h3 className="pr-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1E1C18', marginBottom: 8 }}>No Properties Found</h3>
            <p className="pr-sans" style={{ color: '#8B7355', fontSize: '0.875rem', marginBottom: 24, fontWeight: 300 }}>
              Try adjusting your search criteria or clearing your filters.
            </p>
            <button onClick={clearFilters} className="pr-btn-primary">Clear Filters</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Properties;
