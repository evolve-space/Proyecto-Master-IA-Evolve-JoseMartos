import { apiClient } from "../../../services/apiClient";

export const contratosService = {
  getAll: () => apiClient.get("/contratos"),
  getOne: (id) => apiClient.get(`/contratos/${id}`),
  create: (body) => apiClient.post("/contratos", body),
  update: (id, body) => apiClient.patch(`/contratos/${id}`, body),
  remove: (id) => apiClient.delete(`/contratos/${id}`),
};
