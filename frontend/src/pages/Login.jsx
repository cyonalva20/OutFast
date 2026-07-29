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
        // If email confirmation is off, it logs in automatically or requires sign in.
        // If it throws no error, let's assume it succeeded.
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
          <p className="mono login-tagline">Tu armario inteligente</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#ff5a3633', color: '#ff5a36', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
            style={{ marginBottom: '8px' }}
          >
            {loading ? 'Cargando...' : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')}
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>

        <p className="mono login-footer" style={{ marginTop: '32px' }}>
          MVP v0.1.0 — Autenticación Real
        </p>
      </div>
    </div>
  )
}
