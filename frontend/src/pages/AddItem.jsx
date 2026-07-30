import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { itemsApi } from '../api/itemsApi'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['camisa', 'pantalón', 'zapatos', 'chaqueta', 'vestido', 'falda', 'short', 'accesorio', 'otro']
const STYLE_OPTIONS = ['casual', 'formal', 'deportivo', 'elegante', 'playero', 'verano', 'invierno']

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
        <p>Sube una foto para agregarla a tu armario digital.</p>
      </div>

      <form className="add-item-form" onSubmit={handleSubmit}>
        <div 
          className="image-upload-area" 
          onClick={() => fileInputRef.current?.click()}
          style={imagePreview ? { backgroundImage: `url(${imagePreview})`, borderStyle: 'solid' } : {}}
        >
          {!imagePreview && (
            <>
              <div className="upload-icon-circle">
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add_a_photo</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Toca para subir foto</p>
                <p style={{ fontSize: 12 }}>Formatos: JPG, PNG</p>
              </div>
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

        <div className="ai-banner">
          <span className="material-symbols-outlined icon-fill" style={{ color: 'var(--on-tertiary-container)' }}>auto_awesome</span>
          <span>La IA detectará categoría y color automáticamente</span>
        </div>

        <div className="glass" style={{ padding: 24, borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <div style={{ position: 'relative' }}>
              <select
                id="category"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                required={!imageFile}
                style={{ width: '100%', appearance: 'none' }}
              >
                <option value="">Seleccionar...</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--on-surface-variant)' }}>expand_more</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="color">Color Dominante</label>
            <input
              id="color"
              type="text"
              placeholder="ej: Azul Marino"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
              required={!imageFile}
            />
          </div>

          <div className="form-group">
            <label>Estilo / Ocasión</label>
            <div className="style-tags-container">
              {STYLE_OPTIONS.map(style => (
                <button
                  key={style}
                  type="button"
                  className={`style-tag-option ${selectedStyles.includes(style) ? 'selected' : ''}`}
                  onClick={() => toggleStyle(style)}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving || uploadingImage} style={{ padding: '16px', fontSize: 16, marginTop: 8 }}>
          <span className="material-symbols-outlined">check</span>
          {uploadingImage ? 'Subiendo imagen...' : (saving ? 'Guardando...' : 'Guardar Prenda')}
        </button>
      </form>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
