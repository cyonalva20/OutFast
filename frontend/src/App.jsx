import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import './index.css'

import Layout from './components/Layout'
import Login from './pages/Login'
import Closet from './pages/Closet'
import AddItem from './pages/AddItem'
import OutfitSuggestion from './pages/OutfitSuggestion'
import SavedOutfits from './pages/SavedOutfits'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading-spinner" style={{ minHeight: '100vh' }} />
  }

  // Componente de protección de rutas
  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route 
          path="/" 
          element={session ? <Navigate to="/closet" replace /> : <Login />} 
        />

        {/* Rutas protegidas */}
        <Route 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/closet" element={<Closet />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/outfit" element={<OutfitSuggestion />} />
          <Route path="/saved" element={<SavedOutfits />} />
        </Route>

        {/* Ruta catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
