import { apiClient } from '../../../services/apiClient'

export const calendarioCategoriasService = {
  getAll: () => apiClient.get('/calendario-categorias'),
  create: (data) => apiClient.post('/calendario-categorias', data),
  update: (id, data) => apiClient.patch(`/calendario-categorias/${id}`, data),
  remove: (id) => apiClient.delete(`/calendario-categorias/${id}`),
}
