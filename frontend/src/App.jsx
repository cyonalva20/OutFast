import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

/**
 * Componente raíz de la aplicación.
 * Configura React Router con las rutas principales.
 * Las páginas reales se crearán en commits posteriores (Parte 4).
 */

function Placeholder({ name }) {
  return (
    <div className="placeholder-page">
      <h1>{name}</h1>
      <p className="mono">Página en construcción</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder name="OutFast" />} />
        <Route path="/login" element={<Placeholder name="Login" />} />
        <Route path="/closet" element={<Placeholder name="Mi Armario" />} />
        <Route path="/add-item" element={<Placeholder name="Añadir Prenda" />} />
        <Route path="/outfit" element={<Placeholder name="¿Qué me pongo?" />} />
        <Route path="/saved" element={<Placeholder name="Outfits Guardados" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
