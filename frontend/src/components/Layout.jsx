import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { outfitsApi } from '../api/outfitsApi'
import '../index.css'

export default function Layout() {
  const navigate = useNavigate()
  const [dailyOutfit, setDailyOutfit] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loadingDaily, setLoadingDaily] = useState(false)
  const [showDot, setShowDot] = useState(false)

  // Check if daily outfit exists on mount
  useEffect(() => {
    checkDailyOutfit()
  }, [])

  async function checkDailyOutfit() {
    try {
      const data = await outfitsApi.getDaily()
      if (data && data.items && data.items.length > 0) {
        setDailyOutfit(data)
        // Check if user has already seen this outfit
        const seenId = localStorage.getItem('outfast_daily_seen_id')
        if (seenId !== data.id) {
          setShowDot(true) // New outfit not yet seen
        } else {
          setShowDot(false) // Already seen
        }
      }
    } catch (err) {
      setDailyOutfit(null)
      setShowDot(false)
    }
  }

  async function handleDailyClick() {
    if (dailyOutfit) {
      // Mark as seen
      localStorage.setItem('outfast_daily_seen_id', dailyOutfit.id)
      setShowDot(false)
      setShowModal(true)
    } else {
      // No daily outfit yet — generate one
      setLoadingDaily(true)
      setShowModal(true)
      try {
        const data = await outfitsApi.generateDaily()
        setDailyOutfit(data)
        // Mark as seen immediately since user is viewing it
        localStorage.setItem('outfast_daily_seen_id', data.id)
        setShowDot(false)
      } catch (err) {
        console.error('Error generando outfit del día:', err)
      } finally {
        setLoadingDaily(false)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="app-layout">
      {/* Top App Bar */}
      <header className="top-bar">
        <button className="top-bar-btn daily-outfit-btn" onClick={handleDailyClick}>
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>styler</span>
          {showDot && <span className="daily-dot" />}
        </button>
        <span className="top-bar-logo">OutFast</span>
        <button className="top-bar-btn" onClick={handleLogout} title="Cerrar sesión">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      {/* Floating Bottom Nav */}
      <nav className="bottom-nav" id="main-navigation">
        <NavLink to="/closet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">checkroom</span>
          <span>Mi Armario</span>
        </NavLink>

        <NavLink to="/add-item" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">add_circle</span>
          <span>Añadir</span>
        </NavLink>

        <NavLink to="/outfit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">auto_awesome</span>
          <span>IA Outfit</span>
        </NavLink>

        <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">favorite</span>
          <span>Guardados</span>
        </NavLink>
      </nav>

      {/* Daily Outfit Modal */}
      {showModal && (
        <div className="daily-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="daily-modal" onClick={e => e.stopPropagation()}>
            <button className="daily-modal-close" onClick={() => setShowModal(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="daily-modal-header">
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--on-tertiary-container)' }}>auto_awesome</span>
              <h2>Outfit del Día</h2>
              <p>El outfit del día es el siguiente:</p>
            </div>

            {loadingDaily ? (
              <div className="daily-modal-loading">
                <div className="loading-spinner" />
                <p style={{ marginTop: 16, color: 'var(--on-surface-variant)' }}>Generando tu outfit del día...</p>
              </div>
            ) : dailyOutfit ? (
              <div className="daily-modal-items">
                {dailyOutfit.items.map(item => (
                  <div key={item.id} className="daily-modal-item">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.category} />
                    ) : (
                      <div className="daily-modal-item-placeholder">
                        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>checkroom</span>
                      </div>
                    )}
                    <span className="daily-modal-item-label">{item.category}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="daily-modal-empty">
                <p>No se pudo generar el outfit. Asegúrate de tener prendas limpias en tu armario.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
