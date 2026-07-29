import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { itemsApi } from '../api/itemsApi'

const CATEGORIES = ['camisa', 'pantalón', 'zapatos', 'chaqueta', 'vestido', 'falda', 'short', 'accesorio', 'otro']
const STYLE_OPTIONS = ['casual', 'formal', 'deportivo', 'elegante', 'playero']

export default function AddItem() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ category: '', color: '', imageUrl: '' })
  const [selectedStyles, setSelectedStyles] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function toggleStyle(style) {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category) {
      setToast('Selecciona una categoría')
      setTimeout(() => setToast(''), 2500)
      return
    }

    setSaving(true)
    try {
      await itemsApi.create({
        ...form,
        styleTags: selectedStyles,
      })
      setToast('¡Prenda añadida!')
      setTimeout(() => navigate('/closet'), 1000)
    } catch (err) {
      setToast('Error al guardar')
      setTimeout(() => setToast(''), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div id="add-item-page">
      <div className="page-header">
        <h1>Añadir Prenda</h1>
        <p>Registra una nueva prenda en tu armario</p>
      </div>

      <form className="add-item-form" onSubmit={handleSubmit}>
        <div className="image-upload-area">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="mono">Foto (próximamente)</span>
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input
            id="color"
            type="text"
            placeholder="ej: azul marino"
            value={form.color}
            onChange={e => setForm({ ...form, color: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Estilos</label>
          <div className="style-tags-container">
            {STYLE_OPTIONS.map(style => (
              <button
                key={style}
                type="button"
                className={`style-tag-option ${selectedStyles.includes(style) ? 'selected' : ''}`}
                onClick={() => toggleStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving} id="save-item-btn">
          {saving ? 'Guardando...' : 'Guardar prenda'}
        </button>
      </form>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
