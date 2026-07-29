import { useState, useEffect } from 'react'
import { outfitsApi } from '../api/outfitsApi'

export default function OutfitSuggestion() {
  const [outfit, setOutfit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [toast, setToast] = useState('')
  const [customOccasion, setCustomOccasion] = useState('')

  useEffect(() => {
    async function loadDaily() {
      try {
        const data = await outfitsApi.getDaily()
        if (data && data.items && data.items.length > 0) {
          setOutfit(data)
        }
      } catch (err) {
        console.error('Error cargando outfit diario:', err)
      } finally {
        setLoadingInitial(false)
      }
    }
    loadDaily()
  }, [])

  async function generateOutfit() {
    setLoading(true)
    setOutfit(null)
    try {
      const data = await outfitsApi.generateDaily()
      setOutfit(data)
    } catch (err) {
      setToast(err.message || 'Error al generar outfit')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  async function generateCustomOutfit() {
    if (!customOccasion.trim()) return
    setLoading(true)
    setOutfit(null)
    try {
      const data = await outfitsApi.generateCustom({ occasion: customOccasion })
      setOutfit(data)
      setCustomOccasion('')
    } catch (err) {
      setToast(err.message || 'Error al generar outfit personalizado')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  async function handleFavorite() {
    if (!outfit) return
    try {
      const updated = await outfitsApi.toggleFavorite(outfit.id)
      setOutfit(updated)
      setToast(updated.isFavorite ? '♥ Guardado en favoritos' : 'Removido de favoritos')
      setTimeout(() => setToast(''), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div id="outfit-page">
      <div className="page-header">
        <h1>¿Qué me pongo?</h1>
        <p>Genera un outfit con tus prendas limpias</p>
      </div>

      {!outfit && !loading && !loadingInitial && (
        <div className="empty-state" style={{ padding: '48px 0' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="1">
            <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
          </svg>
          <h3>Tu outfit del día</h3>
          <p>Presiona el botón para que la IA combine tus prendas</p>
          <button className="btn btn-primary" onClick={generateOutfit} id="generate-outfit-btn">
            Generar outfit
          </button>
          
          <div style={{ marginTop: '2rem', width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>O pide un outfit personalizado:</p>
            <input 
              type="text" 
              placeholder="Ej. Cita casual, Oficina..." 
              value={customOccasion}
              onChange={e => setCustomOccasion(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            />
            <button 
              className="btn btn-secondary" 
              onClick={generateCustomOutfit}
              disabled={!customOccasion.trim()}
            >
              Generar personalizado
            </button>
          </div>
        </div>
      )}

      {loadingInitial && <div className="loading-spinner" />}

      {loading && <div className="loading-spinner" />}

      {outfit && (
        <>
          <div className="outfit-display">
            <div className="outfit-items-row">
              {outfit.items && outfit.items.length > 0 ? (
                outfit.items.map(item => (
                  <div key={item.id} className="outfit-item-card hangtag">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.category}
                        style={{
                          width: '100%', aspectRatio: '3/4',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%', aspectRatio: '3/4',
                          background: 'var(--bg-base)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '2rem'
                        }}
                      >
                        👕
                      </div>
                    )}
                    <p>{item.category} — {item.color}</p>
                  </div>
                ))
              ) : (
                <p className="mono" style={{ color: 'var(--accent-secondary)' }}>
                  Outfit generado (conecta la IA para ver prendas)
                </p>
              )}
            </div>
          </div>

          <div className="outfit-actions">
            <button className="btn btn-secondary" onClick={() => setOutfit(null)}>
              Volver
            </button>
            <button className="btn btn-secondary" onClick={generateOutfit}>
              Regenerar
            </button>
            <button className="btn btn-primary" onClick={handleFavorite}>
              {outfit.isFavorite ? '♥ Favorito' : '♡ Guardar'}
            </button>
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
