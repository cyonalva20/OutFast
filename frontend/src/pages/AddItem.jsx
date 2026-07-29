import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { itemsApi } from '../api/itemsApi'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['camisa', 'pantalón', 'zapatos', 'chaqueta', 'vestido', 'falda', 'short', 'accesorio', 'otro']
const STYLE_OPTIONS = ['casual', 'formal', 'deportivo', 'elegante', 'playero']

export default function AddItem() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [form, setForm] = useState({ category: '', color: '', imageUrl: '' })
  const [selectedStyles, setSelectedStyles] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  function toggleStyle(style) {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    )
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImageToSupabase = async (file) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('clothing-items')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from('clothing-items')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Al requerir la IA, necesitamos al menos la foto. 
    // Por ahora dejaremos que el usuario decida si ponerla, pero si la sube, se clasifica automáticamente por backend.
    
    setSaving(true)
    let finalImageUrl = form.imageUrl

    try {
      if (imageFile) {
        setUploadingImage(true)
        finalImageUrl = await uploadImageToSupabase(imageFile)
        setUploadingImage(false)
      }

      await itemsApi.create({
        ...form,
        imageUrl: finalImageUrl,
        styleTags: selectedStyles,
      })
      setToast('¡Prenda añadida!')
      setTimeout(() => navigate('/closet'), 1000)
    } catch (err) {
      setToast('Error al guardar: ' + (err.message || 'Error desconocido'))
      setTimeout(() => setToast(''), 3500)
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  return (
    <div id="add-item-page">
      <div className="page-header">
        <h1>Añadir Prenda</h1>
        <p>Registra una nueva prenda en tu armario</p>
      </div>

      <form className="add-item-form" onSubmit={handleSubmit}>
        <div 
          className="image-upload-area" 
          onClick={() => fileInputRef.current?.click()}
          style={imagePreview ? { backgroundImage: `url(${imagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center', borderStyle: 'solid' } : {}}
        >
          {!imagePreview && (
            <>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="mono">Toca para subir foto</span>
            </>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          style={{ display: 'none' }} 
        />

        <div className="form-group">
          <label htmlFor="category">Categoría {imageFile && '(La IA puede llenarlo automáticamente)'}</label>
          <select
            id="category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            required={!imageFile}
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
            required={!imageFile}
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

        <button className="btn btn-primary" type="submit" disabled={saving || uploadingImage} id="save-item-btn">
          {uploadingImage ? 'Subiendo imagen...' : (saving ? 'Guardando...' : 'Guardar prenda')}
        </button>
      </form>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
