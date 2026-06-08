import { apiClient } from '../../../services/apiClient'

export const calendarioService = {
  getEventos: ({ from, to } = {}) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const qs = params.toString()
    return apiClient.get(`/calendario/eventos${qs ? `?${qs}` : ''}`)
  },

  getOne: (id) => apiClient.get(`/calendario/eventos/${id}`),

  create: (data) => apiClient.post('/calendario/eventos', data),

  createFromEmail: (emailId, data) =>
    apiClient.post(`/calendario/eventos/desde-email/${emailId}`, data),

  update: (id, data) => apiClient.patch(`/calendario/eventos/${id}`, data),

  remove: (id) => apiClient.delete(`/calendario/eventos/${id}`),

  syncFromOutlook: ({ from, to } = {}) =>
    apiClient.post('/calendario/sync', { from, to }),
}
