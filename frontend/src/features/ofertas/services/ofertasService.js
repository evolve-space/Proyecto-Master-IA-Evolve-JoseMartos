import { apiClient } from "../../../services/apiClient";

export const ofertasService = {
  getAll: () => apiClient.get("/ofertas"),
  getOne: (id) => apiClient.get(`/ofertas/${id}`),
  create: (body) => apiClient.post("/ofertas", body),
  update: (id, body) => apiClient.patch(`/ofertas/${id}`, body),
  remove: (id) => apiClient.delete(`/ofertas/${id}`),
};
