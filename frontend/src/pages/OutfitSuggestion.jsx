import { useState, useEffect } from 'react'
import { outfitsApi } from '../api/outfitsApi'

export default function OutfitSuggestion() {
  const [customOutfits, setCustomOutfits] = useState([])
  const [loadingCustom, setLoadingCustom] = useState(false)
  const [loadingInit, setLoadingInit] = useState(true)
  const [occasion, setOccasion] = useState('')

  useEffect(() => {
    loadCustomOutfits()
  }, [])

  async function loadCustomOutfits() {
    try {
      const data = await outfitsApi.getCustomToday()
      if (data) setCustomOutfits(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingInit(false)
    }
  }

  async function generateCustom() {
    if (!occasion.trim()) return
    try {
      setLoadingCustom(true)
      const sanitizedOccasion = occasion.substring(0, 100)
      const data = await outfitsApi.generateCustom({ occasion: sanitizedOccasion })
      // Add the new custom outfit to the top of the list
      setCustomOutfits(prev => [data, ...prev])
      setOccasion('')
    } catch (err) {
      console.error(err)
      alert("Error generando outfit. Asegúrate de tener ropa limpia.")
    } finally {
      setLoadingCustom(false)
    }
  }

  async function toggleFav(outfit, index) {
    if (!outfit) return
    try {
      const updated = await outfitsApi.toggleFavorite(outfit.id)
      setCustomOutfits(prev => {
        const copy = [...prev]
        copy[index] = updated
        return copy
      })
    } catch (err) {
      console.error(err)
    }
  }

  function handleCustomGenerate(e) {
    e.preventDefault()
    generateCustom()
  }

  return (
    <div id="outfit-page">
      <div className="page-header">
        <h1>IA Outfit</h1>
        <p>Genera outfits personalizados para cualquier ocasión.</p>
      </div>

      {/* --- Prompt input bar --- */}
      <form className="ai-input-bar glass" onSubmit={handleCustomGenerate} style={{ marginBottom: 32 }}>
        <span className="material-symbols-outlined ai-input-icon">auto_awesome</span>
        <input 
          type="text" 
          placeholder="Ocasión (ej. Lluvia, Entrevista, Cita...)"
          value={occasion}
          onChange={e => setOccasion(e.target.value)}
          maxLength={100}
        />
        <button type="submit" className="btn btn-accent" style={{ padding: '8px 16px', borderRadius: 8 }} disabled={!occasion.trim() || loadingCustom}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>flare</span>
        </button>
      </form>

      {/* --- Loading indicator for new custom outfit --- */}
      {loadingCustom && (
        <div className="glass-stage" style={{ marginBottom: 32 }}>
          <div className="outfit-result-header">
            <div className="outfit-result-title">
              <span className="material-symbols-outlined" style={{ color: 'var(--on-tertiary-container)' }}>auto_awesome</span>
              <h3>Generando...</h3>
            </div>
          </div>
          <div className="skeleton-loader">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Empty state when no custom outfits yet --- */}
      {!loadingInit && customOutfits.length === 0 && !loadingCustom && (
        <div className="outfit-empty-state">
          <div className="outfit-empty-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--on-tertiary-container)' }}>auto_awesome</span>
          </div>
          <div>
            <h3 style={{ fontSize: 20, color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>Crea un outfit personalizado</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>Escribe la ocasión arriba y deja que la IA arme el conjunto perfecto para ti.</p>
          </div>
        </div>
      )}

      {/* --- Custom outfits (persisted, with occasion shown) --- */}
      {customOutfits.map((outfit, idx) => (
        <div key={outfit.id} className="glass-stage" style={{ marginBottom: 32 }}>
          <div className="outfit-result-header">
            <div className="outfit-result-title">
              <span className="material-symbols-outlined" style={{ color: 'var(--on-tertiary-container)' }}>check_circle</span>
              <h3>Outfit Personalizado</h3>
            </div>
            <span className="outfit-badge">Generado hoy</span>
          </div>

          {outfit.occasionContext && (
            <div style={{ 
              marginBottom: 16, fontSize: 14, color: 'var(--primary)', 
              background: 'rgba(255,255,255,0.5)', padding: '12px 16px', 
              borderRadius: 8, border: '1px solid rgba(216,103,53,0.15)',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-tertiary-container)' }}>event</span>
              <span><strong>Ocasión:</strong> {outfit.occasionContext}</span>
            </div>
          )}

          <div className="outfit-items-row">
            {outfit.items && outfit.items.map(item => (
              <div key={item.id} className="outfit-item-card">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.category} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32 }}>checkroom</span>
                  </div>
                )}
                <div className="outfit-item-label">{item.category}</div>
              </div>
            ))}
          </div>

          <div className="outfit-actions" style={{ marginTop: 16 }}>
            <button 
              className="btn btn-accent" 
              onClick={() => toggleFav(outfit, idx)}
              style={outfit.isFavorite ? { background: 'var(--surface-card)', color: 'var(--on-tertiary-container)', border: '1px solid var(--on-tertiary-container)' } : {}}
            >
              <span className={`material-symbols-outlined ${outfit.isFavorite ? 'icon-fill' : ''}`}>favorite</span> 
              {outfit.isFavorite ? 'Guardado' : 'Favorito'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
