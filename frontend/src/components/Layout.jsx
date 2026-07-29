import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../index.css'

/**
 * Layout principal con barra de navegación inferior (mobile-first).
 * Usa NavLink para resaltar la pestaña activa.
 * El <Outlet/> renderiza la página hija correspondiente a la ruta.
 */

export default function Layout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="app-layout">
      <header style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>OutFast</h2>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', textDecoration: 'underline', cursor: 'pointer' }}>Salir</button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" id="main-navigation">
        <NavLink to="/closet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 3v18" />
          </svg>
          <span>Armario</span>
        </NavLink>

        <NavLink to="/add-item" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          <span>Añadir</span>
        </NavLink>

        <NavLink to="/outfit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
          </svg>
          <span>Outfit</span>
        </NavLink>

        <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span>Guardados</span>
        </NavLink>
      </nav>
    </div>
  )
}
