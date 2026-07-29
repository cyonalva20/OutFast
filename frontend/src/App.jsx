import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import Layout from './components/Layout'
import Login from './pages/Login'
import Closet from './pages/Closet'
import AddItem from './pages/AddItem'
import OutfitSuggestion from './pages/OutfitSuggestion'
import SavedOutfits from './pages/SavedOutfits'

/**
 * Componente raíz.
 *
 * Estructura de rutas:
 * /           → Login (splash)
 * /closet     → Mi Armario (dentro del Layout con navbar)
 * /add-item   → Añadir Prenda
 * /outfit     → ¿Qué me pongo?
 * /saved      → Outfits Guardados
 */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública (sin navbar) */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas (con navbar inferior) */}
        <Route element={<Layout />}>
          <Route path="/closet" element={<Closet />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/outfit" element={<OutfitSuggestion />} />
          <Route path="/saved" element={<SavedOutfits />} />
        </Route>

        {/* Ruta catch-all: redirigir al login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
