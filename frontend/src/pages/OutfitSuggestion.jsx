import { useState, useEffect, useRef } from 'react'
import { outfitsApi } from '../api/outfitsApi'

export default function OutfitSuggestion() {
  const [outfit, setOutfit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [toast, setToast] = useState('')
  const [customOccasion, setCustomOccasion] = useState('')
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Solo fetch una vez al montar. Evita re-fetches por re-render de Supabase auth.
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    async function loadDaily() {
      try {
        const data = await outfitsApi.getDaily()
        if (data && data.items && data.items.length > 0) {
          setOutfit(data)
        }
      } catch (err) {
        // 204 No Content es normal (no hay outfit del día aún)
        if (err.message?.includes('204') || err.message?.includes('No Content')) return
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
      showToast(err.message || 'Error al generar outfit')
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
      showToast(err.message || 'Error al generar outfit personalizado')
    } finally {
      setLoading(false)
    }
  }

  async function handleFavorite() {
    if (!outfit) return
    try {
      const updated = await outfitsApi.toggleFavorite(outfit.id)
      setOutfit(updated)
      showToast(updated.isFavorite ? '♥ Guardado en favoritos' : 'Removido de favoritos')
    } catch (err) {
      console.error(err)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Skeleton Loader component
  function SkeletonLoader() {
    return (
      <div className="glass-stage" style={{ marginTop: 'var(--space-md)' }}>
        <div className="skeleton-loader">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-text" />
            </div>
          ))}
        </div>
        <p className="mono" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '8px' }}>
          La IA está analizando tus prendas...
        </p>
      </div>
    )
  }

  return (
    <div id="outfit-page">
      <div className="page-header">
        <h1>¿Qué me pongo?</h1>
        <p>Genera un outfit con tus prendas limpias</p>
      </div>

      {/* Estado inicial de carga */}
      {loadingInitial && <div className="loading-spinner" />}

      {/* Empty State — sin outfit generado */}
      {!outfit && !loading && !loadingInitial && (
        <div className="outfit-empty-state">
          <div className="outfit-empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
            </svg>
          </div>
          <h3>Tu outfit del día</h3>
          <p>Presiona el botón para que la IA combine tus prendas</p>

          <button className="btn btn-primary" onClick={generateOutfit} id="generate-outfit-btn" style={{ padding: '10px 32px' }}>
            ✨ Generar outfit
          </button>

          {/* Sección de ocasión personalizada */}
          <div className="occasion-section">
            <div className="occasion-divider">o personaliza</div>
            <div className="occasion-input-wrapper">
              <span className="occasion-icon">🎯</span>
              <input
                type="text"
                className="occasion-input"
                placeholder="Ej. Cita casual, Oficina..."
                value={customOccasion}
                onChange={e => setCustomOccasion(e.target.value)}
                maxLength={100}
                onKeyDown={e => e.key === 'Enter' && generateCustomOutfit()}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={generateCustomOutfit}
              disabled={!customOccasion.trim()}
              style={{ opacity: customOccasion.trim() ? 1 : 0.5 }}
            >
              Generar para esta ocasión
            </button>
          </div>
        </div>
      )}

      {/* Skeleton loader mientras la IA trabaja */}
      {loading && <SkeletonLoader />}

      {/* Outfit generado */}
      {outfit && (
        <>
          <div className="glass-stage">
            <div className="outfit-display">
              <div className="outfit-items-row">
                {outfit.items && outfit.items.length > 0 ? (
                  outfit.items.map(item => (
                    <div key={item.id} className="outfit-item-card hangtag">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.category}
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
                  <p className="mono" style={{ color: 'var(--text-secondary)' }}>
                    No se pudieron cargar las prendas
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="outfit-actions" style={{ marginTop: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={() => setOutfit(null)} style={{ fontSize: '0.85rem' }}>
              ← Volver
            </button>
            <button className="btn btn-secondary" onClick={generateOutfit} style={{ fontSize: '0.85rem' }}>
              ↻ Regenerar
            </button>
            <button className="btn btn-primary" onClick={handleFavorite} style={{ fontSize: '0.85rem' }}>
              {outfit.isFavorite ? '♥ Favorito' : '♡ Guardar'}
            </button>
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
