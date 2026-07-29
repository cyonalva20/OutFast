/**
 * Cliente HTTP base para comunicarse con el backend Spring Boot.
 *
 * Centraliza todas las peticiones HTTP en un solo lugar para:
 * 1. Agregar headers comunes (X-User-Id, Content-Type)
 * 2. Manejar errores de forma consistente
 * 3. Facilitar el cambio a JWT cuando integremos Supabase Auth
 *
 * Por ahora, el userId se genera como UUID fijo por sesión.
 * Cuando integremos auth real, se extraerá del token.
 */

const API_BASE = '/api';

// UUID temporal para desarrollo (simula un usuario autenticado)
const DEV_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

async function request(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': DEV_USER_ID,
  };

  const options = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);

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
