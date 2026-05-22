import { apiClient } from "../../../services/apiClient";

export const muestrasService = {
  getAll: () => apiClient.get("/muestras"),
  getOne: (id) => apiClient.get(`/muestras/${id}`),
  create: (body) => apiClient.post("/muestras", body),
  update: (id, body) => apiClient.patch(`/muestras/${id}`, body),
  remove: (id) => apiClient.delete(`/muestras/${id}`),
};
