import { Outlet, NavLink, Link, useLocation } from "react-router-dom"
import { useState, useEffect} from "react";

const ASSET = (p) => `${import.meta.env.BASE_URL}${p}`

export default function App(){
  const [open, setOpen] = useState(false)
  // Close mobile nav on link click
  const handleNavClick = () => {
    setOpen(false)
  }

  // Scroll to top on route change (works for all navigations)
  function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [pathname])
    return null
  }
  return (
    <div className="site">
      <ScrollToTop />
      {/* Global ripple initializer */}
      <RippleInitializer />
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <img src={ASSET("icons/logo-horizontal-white.png")} alt="3D Ops" className="brand-logo"/>
          </Link>
          <button className="nav-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>
            <span className="sr-only">Toggle navigation</span>
            <svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <nav className={"nav "+(open?"open":"")}>
            <NavLink to="/" end onClick={handleNavClick}>Home</NavLink>
            <NavLink to="/services" onClick={handleNavClick}>Services</NavLink>
            <NavLink to="/about" onClick={handleNavClick}>About</NavLink>
            <NavLink to="/team" onClick={handleNavClick}>Team</NavLink>
            <NavLink to="/contact" className="cta" onClick={handleNavClick}>Get a Quote</NavLink>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container grid-2">
          <div>
            <div className="brand mini">
              <img src={ASSET("icons/logo-icon-white.png")} alt="" aria-hidden="true" className="footer-logo-icon"/><span>3D Ops</span>
            </div>
            <p className="muted">Affordable metal additive manufacturing & product development.</p>
          </div>
          <div>
            <h4>Contact</h4>
              <a href="mailto:hello@3dops.com">hello@3dops.com</a>
          </div>
        </div>
        <div className="container tiny">© {new Date().getFullYear()} 3D Ops</div>
      </footer>
    </div>
  )
}

// Component to attach ripple interaction to elements with .card
function RippleInitializer(){
  useEffect(()=>{
    const handler = (e) => {
      const card = e.target.closest('.card');
      if(!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      card.appendChild(span);
      span.addEventListener('animationend', ()=> span.remove());
    }
    // Use pointerdown for quicker mobile response
    document.addEventListener('pointerdown', handler, { passive:true });
    return () => document.removeEventListener('pointerdown', handler);
  },[]);
  return null;
}
