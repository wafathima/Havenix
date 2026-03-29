import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        .ftr-sans  { font-family: 'DM Sans', sans-serif; }
        .ftr-serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        .ftr-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          color: #6B6355;
          text-decoration: none;
          letter-spacing: 0.03em;
          font-weight: 400;
          transition: color 0.25s ease;
          display: inline-block;
        }
        .ftr-link:hover { color: #C4A97A; }

        .ftr-col-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8B7355;
          font-weight: 600;
          margin-bottom: 20px;
          display: block;
        }

        .ftr-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, rgba(139,115,85,0.4), rgba(139,115,85,0.08), transparent);
          margin: 48px 0 32px;
        }

        .ftr-bottom-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          color: #4A4540;
          text-decoration: none;
          letter-spacing: 0.08em;
          transition: color 0.25s ease;
        }
        .ftr-bottom-link:hover { color: #8B7355; }
      `}</style>

      <footer style={{background:'#1E1C18', padding:'72px 24px 40px'}}>
        <div style={{maxWidth:'1200px', margin:'0 auto'}}>

          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'48px 64px'}}>

            {/* ── BRAND ── */}
            <div>
              <Link to="/" style={{display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:20}}>
                <FaHome style={{fontSize:20, color:'#8B7355'}} />
                <span className="ftr-serif" style={{fontSize:'1.25rem', fontWeight:600, color:'#F5F0E8', letterSpacing:'0.05em'}}>
                  HAVENIX
                </span>
              </Link>

              <p className="ftr-sans" style={{color:'#4A4540', fontSize:'0.875rem', lineHeight:1.8, maxWidth:'280px', fontWeight:300}}>
                Where your home takes shape. A curated approach to premium real estate for discerning buyers and sellers.
              </p>

              {/* Ornamental rule */}
              <div style={{marginTop:28, width:40, height:1, background:'rgba(139,115,85,0.5)'}} />
            </div>

            {/* ── BROWSE ── */}
            <div>
              <span className="ftr-col-label">Browse</span>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12}}>
                <li><Link to="/properties" className="ftr-link">Buy</Link></li>
                <li><Link to="/sell"       className="ftr-link">Sell</Link></li>
                <li><Link to="/rent"       className="ftr-link">Rent</Link></li>
              </ul>
            </div>

            {/* ── COMPANY ── */}
            <div>
              <span className="ftr-col-label">Company</span>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12}}>
                <li><Link to="/about"   className="ftr-link">About</Link></li>
                <li><Link to="/blog"    className="ftr-link">Blog</Link></li>
                <li><Link to="/contact" className="ftr-link">Contact</Link></li>
              </ul>
            </div>

            {/* ── LEGAL ── */}
            <div>
              <span className="ftr-col-label">Legal</span>
              <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12}}>
                <li><Link to="/privacy" className="ftr-link">Privacy</Link></li>
                <li><Link to="/terms"   className="ftr-link">Terms</Link></li>
                <li><Link to="/cookies" className="ftr-link">Cookies</Link></li>
              </ul>
            </div>
          </div>

          {/* ── BOTTOM BAR ── */}
          <div className="ftr-divider" />

          <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
            <p className="ftr-sans" style={{color:'#3A3830', fontSize:'0.72rem', letterSpacing:'0.06em'}}>
              © 2026 Havenix. All rights reserved.
            </p>

            <p className="ftr-serif" style={{color:'#8B7355', fontSize:'0.95rem', fontStyle:'italic', fontWeight:400, letterSpacing:'0.02em'}}>
              Where Your Home Takes Shape
            </p>

            <div style={{display:'flex', gap:24}}>
              <Link to="/privacy" className="ftr-bottom-link">Privacy</Link>
              <Link to="/terms"   className="ftr-bottom-link">Terms</Link>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}

export default Footer;