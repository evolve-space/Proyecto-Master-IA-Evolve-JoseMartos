import { apiClient } from "../../../services/apiClient";

export const usuariosService = {
  getAll: () => apiClient.get("/usuarios"),
  getOne: (id) => apiClient.get(`/usuarios/${id}`),
  create: (body) => apiClient.post("/usuarios", body),
  update: (id, body) => apiClient.patch(`/usuarios/${id}`, body),
  remove: (id) => apiClient.delete(`/usuarios/${id}`),
};
