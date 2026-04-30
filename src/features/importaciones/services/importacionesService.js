import { apiClient } from "../../../services/apiClient";

export const importacionesService = {
  getAll: () => apiClient.get("/importaciones"),
  getOne: (id) => apiClient.get(`/importaciones/${id}`),
  create: (body) => apiClient.post("/importaciones", body),
  update: (id, body) => apiClient.patch(`/importaciones/${id}`, body),
  remove: (id) => apiClient.delete(`/importaciones/${id}`),
};
