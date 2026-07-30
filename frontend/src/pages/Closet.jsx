import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { itemsApi } from '../api/itemsApi'

const FILTERS = ['todos', 'camisa', 'pantalón', 'zapatos', 'chaqueta', 'otro']

export default function Closet() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      const data = await itemsApi.getAll()
      setItems(data)
    } catch (err) {
      console.error('Error cargando prendas:', err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(e, item) {
    e.stopPropagation()
    const newStatus = item.status === 'LIMPIO' ? 'SUCIO' : 'LIMPIO'
    try {
      const updated = await itemsApi.updateStatus(item.id, newStatus)
      setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }

  const filtered = filter === 'todos'
    ? items
    : items.filter(i => i.category?.toLowerCase() === filter)

  if (loading) return <div className="loading-spinner" />

  return (
    <div id="closet-page">
      <div className="page-header">
        <h1>Mi Armario</h1>
        <p>{items.length} prendas totales</p>
      </div>

      <div className="closet-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="closet-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Sin prendas</h3>
            <p>Añade tu primera prenda tocando el botón +</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-item')} style={{ marginTop: 16 }}>
              Añadir prenda
            </button>
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="clothing-card glass">
              <button
                className="status-badge"
                onClick={(e) => toggleStatus(e, item)}
              >
                <span className={`status-dot ${item.status === 'LIMPIO' ? 'clean' : 'dirty'}`} />
                <span>{item.status}</span>
              </button>

              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.category} className="clothing-card-image" />
              ) : (
                <div className="clothing-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline-variant)' }}>checkroom</span>
                </div>
              )}

              <div className="clothing-card-info">
                <h3>{item.category}</h3>
                <span className="clothing-card-color">{item.color}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
