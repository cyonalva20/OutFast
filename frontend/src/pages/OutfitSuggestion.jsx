import { useState } from 'react'
import { outfitsApi } from '../api/outfitsApi'

export default function OutfitSuggestion() {
  const [outfit, setOutfit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  async function generateOutfit() {
    setLoading(true)
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

      {!outfit && !loading && (
        <div className="empty-state" style={{ padding: '48px 0' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="1">
            <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
          </svg>
          <h3>Tu outfit del día</h3>
          <p>Presiona el botón para que la IA combine tus prendas</p>
          <button className="btn btn-primary" onClick={generateOutfit} id="generate-outfit-btn">
            Generar outfit
          </button>
        </div>
      )}

      {loading && <div className="loading-spinner" />}

      {outfit && (
        <>
          <div className="outfit-display">
            <div className="outfit-items-row">
              {outfit.items && outfit.items.length > 0 ? (
                outfit.items.map(item => (
                  <div key={item.id} className="outfit-item-card hangtag">
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
