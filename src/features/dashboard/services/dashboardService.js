import { apiClient } from '../../../services/apiClient'

export const dashboardService = {
  getAlerts: () => apiClient.get('/dashboard/alerts'),
}
