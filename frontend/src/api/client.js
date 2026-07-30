/**
 * Cliente HTTP base para comunicarse con el backend Spring Boot.
 *
 * Centraliza todas las peticiones HTTP en un solo lugar para:
 * 1. Agregar el token JWT de Supabase (Authorization Bearer)
 * 2. Manejar errores de forma consistente
 */

import { supabase } from '../lib/supabase';

// Si existe VITE_API_URL (ej. en producción Vercel o en local con .env), úsala. 
// Si no, asume el mismo dominio (para casos donde haya un proxy o load balancer).
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(method, path, body = null) {
  // Obtener la sesión actual de Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const options = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);

  if (response.status === 401 || response.status === 403) {
    throw new Error('No autorizado. Por favor inicia sesión de nuevo.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  // DELETE devuelve 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};
