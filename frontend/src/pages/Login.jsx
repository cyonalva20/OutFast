import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error en la autenticación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" id="login-page">
      <div className="login-content">
        <div className="login-brand">
          <h1 className="login-logo">OutFast</h1>
          <p className="login-tagline" style={{ fontWeight: 500, letterSpacing: '0.05em' }}>Tu armario inteligente con IA</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(186, 26, 26, 0.2)', color: '#ffb4ab', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '14px', border: '1px solid rgba(186, 26, 26, 0.5)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '16px', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '16px', outline: 'none' }}
          />
          <button
            type="submit"
            className="btn btn-accent login-btn"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Cargando...' : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')}
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>

        <p className="login-footer" style={{ marginTop: '48px', letterSpacing: '0.05em' }}>
          OUTFAST MVP v1.0
        </p>
      </div>
    </div>
  )
}
