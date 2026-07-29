/**
 * API de outfits.
 * Cada función corresponde a un endpoint del OutfitController.
 */

import { api } from './client';

export const outfitsApi = {
  /** Obtener todos los outfits guardados */
  getAll: () => api.get('/outfits'),

  /** Generar el outfit del día */
  generateDaily: () => api.post('/outfits/generate-daily'),

  /** Toggle favorito */
  toggleFavorite: (id) => api.patch(`/outfits/${id}/favorite`),
};
