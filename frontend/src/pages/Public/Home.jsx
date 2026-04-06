import { useContext, useState, useEffect} from "react";
import { useNavigate , Link} from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FiHome, FiArrowRight, FiSearch } from "react-icons/fi";
import herobg3 from "../../image/herobg3.png"; 
import API from "../../api/axios";
import toast from "react-hot-toast";

function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchLocation, setSearchLocation] = useState("");
  const [searchPrice, setSearchPrice] = useState("");
  const [searchType, setSearchType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await API.get("/properties");
        let properties = [];
        if (Array.isArray(res.data)) {
          properties = res.data;
        } else if (res.data.properties && Array.isArray(res.data.properties)) {
          properties = res.data.properties;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          properties = res.data.data;
        } else {
          properties = [];
        }
        setFeaturedProperties(properties.slice(0, 3));
      } catch (error) {
        console.error("Error fetching properties:", error);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchLocation && !searchPrice && !searchType) {
      toast.error("Please select at least one search criteria");
      return;
    }
    try {
      setIsSearching(true);
      const params = new URLSearchParams();
      if (searchLocation) params.append("location", searchLocation);
      if (searchPrice) params.append("maxPrice", searchPrice);
      if (searchType) params.append("keyword", searchType);
      const { data } = await API.get(`/properties?${params.toString()}`);
      let results = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data.properties && Array.isArray(data.properties)) {
        results = data.properties;
      } else if (data.data && Array.isArray(data.data)) {
        results = data.data;
      }
      setSearchResults(results);
      setShowSearchResults(true);
      if (results.length === 0) {
        toast.success("No properties found matching your criteria");
      } else {
        toast.success(`Found ${results.length} properties`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search properties");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchLocation("");
    setSearchPrice("");
    setSearchType("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const formatPrice = (price) => {
    if (!price) return "₹ On Request";
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lac`;
    } else {
      return `₹ ${price.toLocaleString('en-IN')}`;
    }
  };

  const priceOptions = [
    { value: "5000000", label: "Under ₹50 Lac" },
    { value: "10000000", label: "Under ₹1 Cr" },
    { value: "20000000", label: "Under ₹2 Cr" },
    { value: "50000000", label: "Under ₹5 Cr" },
    { value: "100000000", label: "Under ₹10 Cr" },
  ];

  const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/uploads')) {
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  }
  
  // Fallback
  return imagePath;
};

  const typeOptions = [
    { value: "Villa", label: "Villa" },
    { value: "Farmhouse", label: "Farmhouse" },
    { value: "Home", label: "Home" },
  ];
  
  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{fontFamily: "'Cormorant Garamond', 'Georgia', serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        .havenix-sans { font-family: 'DM Sans', sans-serif; }
        .havenix-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        @keyframes havenix-rise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes havenix-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes havenix-float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes havenix-drift {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes havenix-line {
          from { width: 0; }
          to   { width: 100%; }
        }

        .rise-1 { animation: havenix-rise 0.8s ease forwards; animation-delay: 0.1s; opacity: 0; }
        .rise-2 { animation: havenix-rise 0.8s ease forwards; animation-delay: 0.25s; opacity: 0; }
        .rise-3 { animation: havenix-rise 0.8s ease forwards; animation-delay: 0.4s; opacity: 0; }
        .rise-4 { animation: havenix-rise 0.8s ease forwards; animation-delay: 0.55s; opacity: 0; }
        .fade-in { animation: havenix-fade 1.2s ease forwards; animation-delay: 0.6s; opacity: 0; }

        .float-card-1 { animation: havenix-float 5s ease-in-out infinite; }
        .float-card-2 { animation: havenix-drift 4s ease-in-out infinite; animation-delay: 0.8s; }

        .hero-img-wrap:hover .hero-img { transform: scale(1.04); }
        .hero-img { transition: transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

        .prop-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.09); }
        .prop-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }

        .prop-card:hover .prop-img { transform: scale(1.08); }
        .prop-img { transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

        .stat-num:hover { letter-spacing: 0.02em; }
        .stat-num { transition: letter-spacing 0.3s ease; }

        .search-input:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.12); }
        .search-select:focus { border-color: #8B7355; box-shadow: 0 0 0 3px rgba(139,115,85,0.12); }

        .btn-primary:hover { background: #7A6445; letter-spacing: 0.06em; }
        .btn-primary { transition: background 0.3s ease, letter-spacing 0.3s ease; }

        .btn-ghost:hover { border-color: #2C2A26; color: #2C2A26; background: transparent; }
        .btn-ghost { transition: all 0.3s ease; }

        .feature-card:hover .feature-icon { background: #2C2A26; color: #F5F0E8; }
        .feature-icon { transition: background 0.3s ease, color 0.3s ease; }

        .divider-ornament::before,
        .divider-ornament::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #D4C9B5);
        }
        .divider-ornament::after {
          background: linear-gradient(to left, transparent, #D4C9B5);
        }

        .grain-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .tag-pill {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .cta-section {
          background: #1E1C18;
          background-image: radial-gradient(ellipse at 20% 50%, rgba(139,115,85,0.15) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, rgba(139,115,85,0.1) 0%, transparent 50%);
        }

        input::placeholder { color: #A89880; }
        select option { color: #2C2A26; }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden grain-overlay" style={{background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE8DC 40%, #E8E0D0 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center'}}>
        
        {/* Subtle geometric accents */}
        <div style={{position:'absolute', top:'8%', right:'5%', width:'380px', height:'380px', border:'1px solid rgba(139,115,85,0.15)', borderRadius:'50%', zIndex:0}} />
        <div style={{position:'absolute', top:'12%', right:'8%', width:'300px', height:'300px', border:'1px solid rgba(139,115,85,0.1)', borderRadius:'50%', zIndex:0}} />
        <div style={{position:'absolute', bottom:'-80px', left:'-60px', width:'280px', height:'280px', background:'rgba(139,115,85,0.06)', borderRadius:'50%', zIndex:0}} />

        <div className="max-w-7xl mx-auto px-6 md:px-16 py-20 w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

            {/* LEFT */}
            <div className="w-full lg:w-[52%] flex flex-col">
              
              <div className="rise-1 tag-pill inline-flex items-center gap-2 mb-8 w-fit" style={{color:'#8B7355'}}>
                <span style={{width:20, height:1, background:'#8B7355', display:'inline-block'}} />
                Premium Real Estate
                <span style={{width:20, height:1, background:'#8B7355', display:'inline-block'}} />
              </div>

              <h1 className="rise-2 havenix-serif" style={{fontSize:'clamp(3.2rem, 7vw, 6.5rem)', fontWeight:300, lineHeight:1.05, color:'#1E1C18', letterSpacing:'-0.02em'}}>
                Discover<br/>
                <em style={{fontStyle:'italic', color:'#8B7355'}}>Extraordinary</em><br/>
                Homes
              </h1>

              <p className="rise-3 havenix-sans mt-7" style={{color:'#6B6355', fontSize:'1.05rem', lineHeight:1.75, maxWidth:'440px', fontWeight:300}}>
                A curated collection of India's most distinguished properties. Where architecture meets aspiration, and every home tells a story worth living.
              </p>

              <div className="rise-4 mt-10 flex items-center gap-5">
                <Link
                  to="/properties"
                  className="btn-primary havenix-sans inline-flex items-center gap-3 px-9 py-4 text-white font-medium"
                  style={{background:'#8B7355', borderRadius:'4px', fontSize:'0.875rem', letterSpacing:'0.04em', textTransform:'uppercase'}}
                >
                  Explore Properties
                  <FiArrowRight size={16} />
                </Link>
              </div>

              {/* Stats */}
              <div className="fade-in mt-14 pt-10 flex gap-12" style={{borderTop:'1px solid rgba(139,115,85,0.2)'}}>
                {[['8k+','Satisfied Clients'],['12k+','Listings'],['15+','Years Experience']].map(([num, label]) => (
                  <div key={label}>
                    <p className="stat-num havenix-serif" style={{fontSize:'2rem', fontWeight:600, color:'#1E1C18', lineHeight:1}}>{num}</p>
                    <p className="havenix-sans mt-1" style={{fontSize:'0.75rem', color:'#8B7355', letterSpacing:'0.1em', textTransform:'uppercase'}}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT – Image */}
            <div className="w-full lg:w-[48%] relative">
              
              {/* Main image */}
              <div className="hero-img-wrap relative" style={{borderRadius:'2px', overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.18)'}}>
                {/* Thin gold frame */}
                <div style={{position:'absolute', inset:'12px', border:'1px solid rgba(255,255,255,0.35)', zIndex:2, pointerEvents:'none', borderRadius:'2px'}} />
                <img
                  src={herobg3}
                  alt="Luxury Home Interior"
                  className="hero-img w-full"
                  style={{display:'block', height:'540px', objectFit:'cover'}}
                />
                <div style={{position:'absolute', inset:0, background:'linear-gradient(to top, rgba(30,28,24,0.3) 0%, transparent 50%)', zIndex:1}} />
              </div>

              {/* Floating badge – available units */}
              <div className="float-card-1 havenix-sans" style={{position:'absolute', bottom:'-16px', left:'-24px', background:'#1E1C18', color:'white', padding:'18px 22px', borderRadius:'4px', boxShadow:'0 20px 50px rgba(0,0,0,0.25)', zIndex:10, minWidth:'180px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  <div style={{width:36, height:36, background:'rgba(139,115,85,0.25)', borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <FiHome size={18} color="#C4A97A" />
                  </div>
                  <div>
                    <p style={{fontSize:'0.65rem', color:'#8B7355', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2}}>Available</p>
                    <p style={{fontSize:'1.1rem', fontWeight:600, letterSpacing:'-0.01em'}}>148 Homes</p>
                    <p style={{fontSize:'0.65rem', color:'#8B7355', marginTop:1}}>+12 listed this week</p>
                  </div>
                </div>
              </div>

              {/* Floating badge – rating */}
              <div className="float-card-2 havenix-sans" style={{position:'absolute', top:'20px', right:'-20px', background:'white', padding:'14px 18px', borderRadius:'4px', boxShadow:'0 16px 40px rgba(0,0,0,0.12)', zIndex:10}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{display:'flex', gap:'-4px'}}>
                    {[1,2,3].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" style={{width:28, height:28, borderRadius:'50%', border:'2px solid white', marginLeft: i > 1 ? '-8px' : 0, objectFit:'cover'}} />
                    ))}
                  </div>
                  <div>
                    <div style={{display:'flex', gap:2, marginBottom:2}}>
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="10" height="10" viewBox="0 0 20 20" fill="#C4A97A"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                    </div>
                    <p style={{fontSize:'0.75rem', fontWeight:600, color:'#1E1C18'}}>4.9 / 5</p>
                    <p style={{fontSize:'0.6rem', color:'#8B7355'}}>2,500+ reviews</p>
                  </div>
                </div>
              </div>

              {/* Verified badge */}
              <div style={{position:'absolute', bottom:'60px', right:'-16px', background:'white', padding:'10px 14px', borderRadius:'4px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', zIndex:10, display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:28, height:28, background:'#EDE8DC', borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <p style={{fontSize:'0.6rem', color:'#8B7355', textTransform:'uppercase', letterSpacing:'0.1em'}}>Verified</p>
                  <p className="havenix-sans" style={{fontSize:'0.75rem', fontWeight:600, color:'#1E1C18'}}>100% Authentic</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section style={{background:'#FAFAF8', padding:'80px 16px'}}>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>

          {/* Section label */}
          <div className="text-center mb-10">
            <div className="havenix-sans tag-pill inline-flex items-center gap-3 mb-4" style={{color:'#8B7355'}}>
              <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
              Property Search
              <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
            </div>
            <h2 className="havenix-serif" style={{fontSize:'clamp(2.2rem, 4vw, 3rem)', fontWeight:400, color:'#1E1C18', letterSpacing:'-0.02em'}}>
              Find Your Ideal <em style={{fontStyle:'italic', color:'#8B7355'}}>Property</em>
            </h2>
          </div>

          {/* Search card */}
          <div style={{background:'white', borderRadius:'2px', padding:'36px 40px', boxShadow:'0 4px 40px rgba(0,0,0,0.06)', border:'1px solid rgba(139,115,85,0.12)'}}>
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">

                {/* Location */}
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="havenix-sans" style={{fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#8B7355', fontWeight:500}}>Location</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#A89880'}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="City or area..."
                      className="search-input havenix-sans w-full outline-none"
                      style={{paddingLeft:38, paddingRight:14, paddingTop:12, paddingBottom:12, border:'1px solid #E5DDD0', borderRadius:'2px', fontSize:'0.875rem', color:'#2C2A26', background:'#FAFAF8', width:'100%'}}
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="flex flex-col gap-2">
                  <label className="havenix-sans" style={{fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#8B7355', fontWeight:500}}>Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-select havenix-sans w-full outline-none appearance-none"
                    style={{padding:'12px 14px', border:'1px solid #E5DDD0', borderRadius:'2px', fontSize:'0.875rem', color:'#2C2A26', background:'#FAFAF8'}}
                  >
                    <option value="">Any Type</option>
                    {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <label className="havenix-sans" style={{fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#8B7355', fontWeight:500}}>Budget</label>
                  <select
                    value={searchPrice}
                    onChange={(e) => setSearchPrice(e.target.value)}
                    className="search-select havenix-sans w-full outline-none appearance-none"
                    style={{padding:'12px 14px', border:'1px solid #E5DDD0', borderRadius:'2px', fontSize:'0.875rem', color:'#2C2A26', background:'#FAFAF8'}}
                  >
                    <option value="">Any Price</option>
                    {priceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="btn-primary havenix-sans flex items-center justify-center gap-2"
                  style={{background:'#8B7355', color:'white', border:'none', padding:'12px 24px', borderRadius:'2px', fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500, cursor: isSearching ? 'not-allowed' : 'pointer', opacity: isSearching ? 0.7 : 1}}
                >
                  {isSearching ? (
                    <><div style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.6s linear infinite'}} />Searching</>
                  ) : (
                    <><FiSearch size={15} />Search</>
                  )}
                </button>
              </div>

              {showSearchResults && (
                <div style={{marginTop:16, textAlign:'right'}}>
                  <button type="button" onClick={clearSearch} className="havenix-sans" style={{color:'#8B7355', background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', textDecoration:'underline', textUnderlineOffset:3}}>
                    Clear Search
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <div style={{marginTop:40}}>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:20}}>
                <h3 className="havenix-serif" style={{fontSize:'1.5rem', fontWeight:400, color:'#1E1C18'}}>
                  Results <span style={{color:'#8B7355', fontStyle:'italic'}}>({searchResults.length})</span>
                </h3>
              </div>
              {searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {searchResults.slice(0, 3).map((property) => (
                      <Link
                        to={`/property/${property._id}`}
                        key={property._id}
                        className="prop-card"
                        style={{background:'white', borderRadius:'2px', overflow:'hidden', border:'1px solid rgba(139,115,85,0.12)', display:'block', textDecoration:'none'}}
                      >
                        <div style={{aspectRatio:'4/3', overflow:'hidden'}}>
                          <img
                            src={property.image || property.images?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"}
                            alt={property.title}
                            className="prop-img w-full h-full"
                            style={{objectFit:'cover', display:'block'}}
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"; }}
                          />
                        </div>
                        <div style={{padding:'20px'}}>
                          <h4 className="havenix-serif" style={{fontWeight:500, color:'#1E1C18', fontSize:'1.1rem', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{property.title}</h4>
                          <p className="havenix-sans" style={{color:'#8B7355', fontSize:'0.8rem', marginBottom:8}}>{property.location}</p>
                          <p className="havenix-serif" style={{color:'#1E1C18', fontWeight:600, fontSize:'1.2rem'}}>{formatPrice(property.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {searchResults.length > 3 && (
                    <div style={{textAlign:'center', marginTop:24}}>
                      <Link
                        to={`/properties?${new URLSearchParams({...(searchLocation && {location: searchLocation}),...(searchPrice && {maxPrice: searchPrice}),...(searchType && {type: searchType})}).toString()}`}
                        className="havenix-sans"
                        style={{color:'#8B7355', fontSize:'0.85rem', textDecoration:'underline', textUnderlineOffset:3}}
                      >
                        View all {searchResults.length} matching properties →
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div style={{textAlign:'center', padding:'40px', background:'white', border:'1px solid rgba(139,115,85,0.12)'}}>
                  <p className="havenix-sans" style={{color:'#8B7355'}}>No properties match your criteria</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{maxWidth:'900px', margin:'64px auto 0', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0}}>
          {[['50K+','Active Listings'],['10K+','Happy Clients'],['98%','Success Rate'],['24/7','Expert Support']].map(([num, label], i) => (
            <div key={label} style={{textAlign:'center', padding:'32px 16px', borderLeft: i > 0 ? '1px solid rgba(139,115,85,0.2)' : 'none'}}>
              <p className="stat-num havenix-serif" style={{fontSize:'2.5rem', fontWeight:600, color:'#1E1C18', lineHeight:1}}>{num}</p>
              <p className="havenix-sans" style={{fontSize:'0.72rem', color:'#8B7355', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:6}}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW WE HELP ── */}
      <section style={{background:'#1E1C18', padding:'96px 24px'}}>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="text-center mb-16">
            <div className="havenix-sans tag-pill inline-flex items-center gap-3 mb-5" style={{color:'#8B7355'}}>
              <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
              Our Services
              <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
            </div>
            <h2 className="havenix-serif" style={{fontSize:'clamp(2.4rem, 4vw, 3.5rem)', fontWeight:300, color:'#F5F0E8', letterSpacing:'-0.02em'}}>
              How We <em style={{fontStyle:'italic', color:'#C4A97A'}}>Help</em>
            </h2>
            <p className="havenix-sans" style={{color:'#8B7355', marginTop:12, fontSize:'1rem'}}>Whether you're buying, selling, or renting — we're here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{border:'1px solid rgba(139,115,85,0.2)'}}>
            {[
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                title: 'Buy',
                sub: 'Your Dream Home',
                desc: 'Find properties that match your lifestyle and budget with our expert guidance.'
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                title: 'Sell',
                sub: 'With Confidence',
                desc: 'List your property and connect with serious, verified buyers nationwide.'
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                title: 'Rent',
                sub: 'Hassle-Free',
                desc: 'Discover rental properties that fit your lifestyle, verified and move-in ready.'
              }
            ].map((item, i) => (
              <div key={item.title} className="feature-card" style={{padding:'48px 40px', borderLeft: i > 0 ? '1px solid rgba(139,115,85,0.2)' : 'none', cursor:'default'}}>
                <div className="feature-icon" style={{width:52, height:52, border:'1px solid rgba(139,115,85,0.35)', borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center', color:'#C4A97A', marginBottom:28}}>
                  {item.icon}
                </div>
                <p className="havenix-sans" style={{fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#8B7355', marginBottom:4}}>{item.title}</p>
                <h3 className="havenix-serif" style={{fontSize:'1.6rem', fontWeight:400, color:'#F5F0E8', marginBottom:14, lineHeight:1.2}}>{item.sub}</h3>
                <p className="havenix-sans" style={{color:'#8B7355', fontSize:'0.9rem', lineHeight:1.7, fontWeight:300}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ── */}
      <section style={{background:'#FAFAF8', padding:'96px 24px'}}>
        <div style={{maxWidth:'1200px', margin:'0 auto'}}>
          
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:56}}>
            <div>
              <div className="havenix-sans tag-pill inline-flex items-center gap-3 mb-5" style={{color:'#8B7355'}}>
                <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
                Curated Selection
                <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
              </div>
              <h2 className="havenix-serif" style={{fontSize:'clamp(2.4rem, 4vw, 3.5rem)', fontWeight:300, color:'#1E1C18', letterSpacing:'-0.02em'}}>
                Featured <em style={{fontStyle:'italic', color:'#8B7355'}}>Properties</em>
              </h2>
              <p className="havenix-sans" style={{color:'#8B7355', marginTop:8, fontSize:'0.95rem'}}>Handpicked homes in premier markets</p>
            </div>
            <Link to="/properties" className="havenix-sans btn-ghost" style={{border:'1px solid #D4C9B5', padding:'10px 24px', borderRadius:'2px', color:'#8B7355', textDecoration:'none', fontSize:'0.78rem', letterSpacing:'0.1em', textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:8, fontWeight:500}}>
              View All
              <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading && [1,2,3].map(n => (
              <div key={n} style={{background:'white', borderRadius:'2px', overflow:'hidden', border:'1px solid rgba(139,115,85,0.1)'}}>
                <div style={{aspectRatio:'4/3', background:'#EDE8DC', animation:'pulse 1.5s ease-in-out infinite'}} />
                <div style={{padding:'24px'}}>
                  <div style={{height:16, background:'#EDE8DC', borderRadius:2, marginBottom:8, width:'70%'}} />
                  <div style={{height:12, background:'#EDE8DC', borderRadius:2, width:'45%'}} />
                </div>
              </div>
            ))}

            {!loading && featuredProperties.map((property) => (
              <div key={property._id} className="prop-card" style={{background:'white', borderRadius:'2px', overflow:'hidden', border:'1px solid rgba(139,115,85,0.12)'}}>
                <div style={{position:'relative', aspectRatio:'4/3', overflow:'hidden'}}>
                  <span className="havenix-sans" style={{position:'absolute', top:16, left:16, background:'#1E1C18', color:'#C4A97A', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'5px 12px', zIndex:2}}>
                    Featured
                  </span>
                  {property.image || property.images?.[0] ? (
                    <img
                      src={getImageUrl(property.images?.[0])}
                      alt={property.title}
                      className="prop-img w-full h-full"
                      style={{objectFit:'cover', display:'block'}}
                      onError={(e) => { e.target.style.display='none'; }}
                    />
                  ) : (
                    <div style={{width:'100%', height:'100%', background:'#EDE8DC', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.4}}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </div>
                  )}
                  <div style={{position:'absolute', inset:0, background:'linear-gradient(to top, rgba(30,28,24,0.5) 0%, transparent 50%)', zIndex:1}} />
                </div>

                <div style={{padding:'24px 28px 28px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4}}>
                    <h3 className="havenix-serif" style={{fontSize:'1.25rem', fontWeight:500, color:'#1E1C18', lineHeight:1.2, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginRight:8}}>
                      {property.title || "Untitled Property"}
                    </h3>
                  </div>
                  <p className="havenix-sans" style={{color:'#8B7355', fontSize:'0.78rem', marginBottom:4}}>{property.location || "Location not specified"}</p>
                  <p className="havenix-sans" style={{color:'#A89880', fontSize:'0.78rem', marginBottom:20, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:300}}>
                    {property.description || "Luxury living awaits"}
                  </p>

                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                    <div>
                      <p className="havenix-serif" style={{color:'#1E1C18', fontSize:'1.5rem', fontWeight:600, lineHeight:1}}>
                        {formatPrice(property.price)}
                      </p>
                      <p className="havenix-sans" style={{color:'#8B7355', fontSize:'0.75rem', marginTop:4}}>
                        {property.bedrooms || property.beds || "3"} bed · {property.bathrooms || property.baths || "2"} bath
                      </p>
                    </div>
                    <Link
                      to={`/property/${property._id}`}
                      style={{width:40, height:40, border:'1px solid rgba(139,115,85,0.4)', borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B7355', textDecoration:'none', flexShrink:0, transition:'all 0.3s ease'}}
                      onMouseEnter={e => { e.currentTarget.style.background='#8B7355'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#8B7355'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8B7355'; e.currentTarget.style.borderColor='rgba(139,115,85,0.4)'; }}
                    >
                      <FiArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {!loading && featuredProperties.length === 0 && (
              <div className="col-span-3" style={{textAlign:'center', padding:'80px 0'}}>
                <p className="havenix-sans" style={{color:'#8B7355'}}>No properties available at this time. Please check back soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── WHY HAVENIX ── */}
      <section style={{background:'#F5F0E8', padding:'96px 24px'}}>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="text-center mb-16">
            <div className="havenix-sans tag-pill inline-flex items-center gap-3 mb-5" style={{color:'#8B7355'}}>
              <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
              Our Promise
              <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
            </div>
            <h2 className="havenix-serif" style={{fontSize:'clamp(2.4rem, 4vw, 3.5rem)', fontWeight:300, color:'#1E1C18', letterSpacing:'-0.02em'}}>
              The <em style={{fontStyle:'italic', color:'#8B7355'}}>Havenix</em> Difference
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, title:'Smart Technology', desc:'AI-powered recommendations tailored precisely to your preferences and lifestyle.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title:'Secure & Safe', desc:"Industry-leading security protocols protecting your transactions and personal data." },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title:'Expert Agents', desc:'Dedicated professionals with deep market knowledge ready to guide every step.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, title:'Transparent Pricing', desc:'No hidden fees, no surprises. Complete clarity in every transaction we facilitate.' },
            ].map((item, i) => (
              <div key={item.title} style={{background:'white', padding:'36px 40px', border:'1px solid rgba(139,115,85,0.12)', borderRadius:'2px', display:'flex', gap:24, alignItems:'flex-start'}}>
                <div style={{width:48, height:48, border:'1px solid rgba(139,115,85,0.3)', borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B7355', flexShrink:0}}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="havenix-serif" style={{fontSize:'1.2rem', fontWeight:500, color:'#1E1C18', marginBottom:8}}>{item.title}</h3>
                  <p className="havenix-sans" style={{color:'#6B6355', fontSize:'0.9rem', lineHeight:1.7, fontWeight:300}}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" style={{padding:'100px 24px'}}>
        <div style={{maxWidth:'720px', margin:'0 auto', textAlign:'center'}}>
          <div className="havenix-sans tag-pill inline-flex items-center gap-3 mb-8" style={{color:'#8B7355'}}>
            <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
            Begin Your Journey
            <span style={{width:24, height:1, background:'#8B7355', display:'inline-block'}} />
          </div>
          <h2 className="havenix-serif" style={{fontSize:'clamp(2.8rem, 6vw, 5rem)', fontWeight:300, color:'#F5F0E8', letterSpacing:'-0.03em', lineHeight:1.05}}>
            Ready to Find<br/>
            <em style={{fontStyle:'italic', color:'#C4A97A'}}>Your Home?</em>
          </h2>
          <p className="havenix-sans" style={{color:'#8B7355', fontSize:'1rem', marginTop:16, marginBottom:40, lineHeight:1.7, fontWeight:300}}>
            Join thousands of discerning clients who discovered their perfect property through Havenix.
          </p>
          <Link
            to="/properties"
            className="btn-primary havenix-sans inline-flex items-center gap-3"
            style={{background:'#C4A97A', color:'#1E1C18', padding:'16px 40px', borderRadius:'2px', fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600, textDecoration:'none'}}
          >
            Browse Properties
            <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;
