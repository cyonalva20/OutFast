/**
 * API de prendas de ropa.
 * Cada función corresponde a un endpoint del ClothingItemController.
 */

import { api } from './client';

export const itemsApi = {
  /** Obtener todas las prendas del usuario */
  getAll: () => api.get('/items'),

  /** Obtener prendas filtradas por estado */
  getByStatus: (status) => api.get(`/items?status=${status}`),

  /** Crear una nueva prenda */
  create: (data) => api.post('/items', data),

  /** Actualizar campos de una prenda */
  update: (id, data) => api.patch(`/items/${id}`, data),

  /** Cambiar estado limpio/sucio */
  updateStatus: (id, status) => api.patch(`/items/${id}/status`, { status }),

  /** Eliminar una prenda */
  delete: (id) => api.delete(`/items/${id}`),
};
