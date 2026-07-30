import { useState, useEffect, useRef } from 'react'
import { outfitsApi } from '../api/outfitsApi'

export default function SavedOutfits() {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('favorites') // 'favorites' | 'history'
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    loadOutfits()
  }, [])

  async function loadOutfits() {
    try {
      const data = await outfitsApi.getAll()
      setOutfits(data)
    } catch (err) {
      console.error('Error cargando outfits:', err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleFav(id) {
    try {
      const updated = await outfitsApi.toggleFavorite(id)
      setOutfits(prev => prev.map(o => o.id === id ? updated : o))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="loading-spinner" />

  const sortedOutfits = [...outfits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredOutfits = sortedOutfits.filter(o => {
    if (activeTab === 'favorites') {
      return o.isFavorite; // No date filter in favorites
    }
    
    // In history tab, apply date filter if present
    if (filterDate) {
      const oDate = new Date(o.createdAt).toLocaleDateString('en-CA');
      if (oDate !== filterDate) return false;
    }
    return true;
  });

  return (
    <div id="saved-outfits-page">
      <div className="page-header">
        <h1>{activeTab === 'favorites' ? 'Favoritos' : 'Historial'}</h1>
        <p>{filteredOutfits.length} outfits guardados</p>
      </div>

      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favoritos
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </button>
      </div>

      {activeTab === 'history' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(210,196,187,0.5)', background: 'rgba(255,255,255,0.6)',
              color: 'var(--primary)', fontFamily: 'var(--font)', outline: 'none'
            }}
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate('')} 
              title="Limpiar filtro"
              style={{ 
                marginLeft: 8, background: 'var(--surface-variant)', border: 'none', 
                cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px',
                borderRadius: '50%'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          )}
        </div>
      )}

      {filteredOutfits.length === 0 ? (
        <div className="empty-state">
          <h3>{activeTab === 'favorites' ? 'Sin favoritos' : 'Historial vacío'}</h3>
          <p>{activeTab === 'favorites' ? 'Genera un outfit y guárdalo como favorito' : 'Aún no has generado ningún outfit'}</p>
        </div>
      ) : (
        <div className="saved-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
          {filteredOutfits.map(outfit => (
            <div key={outfit.id} className="glass-stage">
              <div className="outfit-result-header">
                <div className="outfit-result-title">
                  <span className="material-symbols-outlined" style={{ color: 'var(--on-tertiary-container)' }}>check_circle</span>
                  <h3>{outfit.generationType === 'MANUAL_REQUEST' ? 'Outfit Personalizado' : 'Sugerencia del Día'}</h3>
                </div>
                <span className="outfit-badge">
                  {new Date(outfit.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                </span>
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
                  onClick={() => toggleFav(outfit.id)}
                  style={outfit.isFavorite ? { background: 'var(--surface-card)', color: 'var(--on-tertiary-container)', border: '1px solid var(--on-tertiary-container)' } : {}}
                >
                  <span className={`material-symbols-outlined ${outfit.isFavorite ? 'icon-fill' : ''}`}>favorite</span> 
                  {outfit.isFavorite ? 'Guardado' : 'Favorito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
