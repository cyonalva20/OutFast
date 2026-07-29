import { useState, useEffect } from 'react'
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
        <p className="mono">{items.length} prendas</p>
      </div>

      <div className="closet-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="closet-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Sin prendas</h3>
            <p>Añade tu primera prenda tocando el botón +</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-item')}>
              Añadir prenda
            </button>
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="hangtag clothing-card">
              <div
                className="clothing-card-image"
                style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
                         backgroundSize: 'cover', backgroundPosition: 'center',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         color: 'var(--accent-secondary)', fontSize: '2rem' }}
              >
                {!item.imageUrl && '👕'}
              </div>
              <div className="clothing-card-info">
                <h3>{item.category}</h3>
                <span className="clothing-card-color">{item.color}</span>
              </div>
              <button
                className={`status-badge ${item.status === 'LIMPIO' ? 'status-clean' : 'status-dirty'}`}
                onClick={(e) => toggleStatus(e, item)}
                style={{ marginTop: '8px', cursor: 'pointer', border: 'none' }}
              >
                {item.status}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
