import { Outlet, NavLink } from "react-router-dom"
import { useState } from "react"

export default function App(){
  const [open, setOpen] = useState(false)
  return (
    <div className="site">
      <header className="site-header">
        <div className="container header-inner">
          <a href="/" className="brand">
            <img src="/icons/logo-mark.svg" alt="3D Ops logo" aria-hidden="true"/>
            <span>3D Ops</span>
          </a>
          <button className="nav-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>
            <span className="sr-only">Toggle navigation</span>
            <svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <nav className={"nav "+(open?"open":"")}>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/work">Work</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact" className="cta">Get a Quote</NavLink>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container grid-3">
          <div>
            <div className="brand mini">
              <img src="/icons/logo-mark.svg" alt="" aria-hidden="true"/><span>3D Ops</span>
            </div>
            <p className="muted">Affordable metal additive manufacturing & product development.</p>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="list">
              <li><a href="mailto:hello@3dops.com">hello@3dops.com</a></li>
              <li><a href="tel:+1-000-000-0000">+1 (000) 000-0000</a></li>
            </ul>
          </div>
          <div>
            <h4>Follow</h4>
            <ul className="list">
              <li><a href="https://www.instagram.com/3dops/" target="_blank" rel="noreferrer">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="container tiny">© {new Date().getFullYear()} 3D Ops</div>
      </footer>
    </div>
  )
}
