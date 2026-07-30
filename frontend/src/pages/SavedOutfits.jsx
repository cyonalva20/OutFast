import { useState, useEffect, useRef } from 'react'
import { outfitsApi } from '../api/outfitsApi'

export default function SavedOutfits() {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('favorites') // 'favorites' | 'history'
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
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

  const filteredOutfits = activeTab === 'favorites' 
    ? outfits.filter(o => o.isFavorite) 
    : outfits;

  return (
    <div id="saved-outfits-page">
      <div className="page-header">
        <h1>{activeTab === 'favorites' ? 'Guardados' : 'Historial'}</h1>
        <p className="mono">{filteredOutfits.length} outfits</p>
      </div>

      <div className="closet-filters" style={{ marginBottom: 'var(--space-lg)', justifyContent: 'center' }}>
        <button
          className={`filter-chip ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          ❤️ Favoritos
        </button>
        <button
          className={`filter-chip ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          🕒 Historial
        </button>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="empty-state">
          <h3>{activeTab === 'favorites' ? 'Sin favoritos' : 'Historial vacío'}</h3>
          <p>{activeTab === 'favorites' ? 'Genera un outfit y guárdalo como favorito' : 'Aún no has generado ningún outfit'}</p>
        </div>
      ) : (
        <div className="saved-list">
          {filteredOutfits.map(outfit => (
            <div key={outfit.id} className="hangtag saved-outfit-card">
              <div className="saved-outfit-items">
                {outfit.items && outfit.items.map(item => (
                  item.imageUrl ? (
                    <img
                      key={item.id}
                      src={item.imageUrl}
                      alt={item.category}
                      style={{
                        width: 60, height: 80,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div
                      key={item.id}
                      style={{
                        width: 60, height: 80,
                        background: 'var(--bg-base)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}
                    >
                      👕
                    </div>
                  )
                ))}
                {(!outfit.items || outfit.items.length === 0) && (
                  <span className="mono" style={{ color: 'var(--accent-secondary)' }}>Sin prendas</span>
                )}
              </div>
              <div className="saved-outfit-meta">
                <span className="mono">
                  {new Date(outfit.createdAt).toLocaleDateString('es-ES')}
                </span>
                <button className="favorite-btn" onClick={() => toggleFav(outfit.id)}>
                  {outfit.isFavorite ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
