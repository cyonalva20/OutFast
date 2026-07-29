/**
 * API de outfits.
 * Cada función corresponde a un endpoint del OutfitController.
 */

import { api } from './client';

export const outfitsApi = {
  /** Obtener todos los outfits guardados */
  getAll: () => api.get('/outfits'),

  /** Obtener el outfit del día actual si existe */
  getDaily: () => api.get('/outfits/daily'),

  /** Generar el outfit del día (conecta con IA) */
  generateDaily: () => api.post('/outfits/generate-daily'),

  /** Generar outfit personalizado (conecta con IA) */
  generateCustom: (data) => api.post('/outfits/generate-custom', data),

  /** Toggle favorito */
  toggleFavorite: (id) => api.patch(`/outfits/${id}/favorite`),
};
