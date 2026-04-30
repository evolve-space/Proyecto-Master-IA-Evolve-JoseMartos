import { apiClient } from "../../../services/apiClient";

export const proveedoresService = {
  getAll: () => apiClient.get("/proveedores"),
  getOne: (id) => apiClient.get(`/proveedores/${id}`),
  create: (body) => apiClient.post("/proveedores", body),
  update: (id, body) => apiClient.patch(`/proveedores/${id}`, body),
  remove: (id) => apiClient.delete(`/proveedores/${id}`),
};
