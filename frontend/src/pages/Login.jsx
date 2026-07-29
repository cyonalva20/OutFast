import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Página de Login / Splash Screen.
 *
 * Para el MVP, usa un login simulado (sin Supabase Auth).
 * El usuario hace click y "entra" directamente al armario.
 * Cuando integremos auth real, aquí se agregará el flujo OAuth.
 */

export default function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setIsLoading(true)
    // Simular delay de autenticación
    setTimeout(() => {
      navigate('/closet')
    }, 800)
  }

  return (
    <div className="login-page" id="login-page">
      <div className="login-content">
        <div className="login-brand">
          <h1 className="login-logo">OutFast</h1>
          <p className="mono login-tagline">Tu armario inteligente</p>
        </div>

        <div className="login-description">
          <p>Digitaliza tu ropa, recibe outfits sugeridos por IA y nunca más pierdas tiempo eligiendo qué ponerte.</p>
        </div>

        <button
          className="btn btn-primary login-btn"
          onClick={handleLogin}
          disabled={isLoading}
          id="login-button"
        >
          {isLoading ? 'Entrando...' : 'Empezar'}
        </button>

        <p className="mono login-footer">
          MVP v0.1.0 — Desarrollo local
        </p>
      </div>
    </div>
  )
}
