import { apiClient } from "../../../services/apiClient";

export const emailCategoriasService = {
  getAll: () => apiClient.get("/email-categorias"),
  create: (data) => apiClient.post("/email-categorias", data),
  update: (id, data) => apiClient.patch(`/email-categorias/${id}`, data),
  remove: (id) => apiClient.delete(`/email-categorias/${id}`),
};
