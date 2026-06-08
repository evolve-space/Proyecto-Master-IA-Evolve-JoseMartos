import { apiClient } from "../../../services/apiClient";

export const proveedoresService = {
  getAll: () => apiClient.get("/proveedores"),
  getOne: (id) => apiClient.get(`/proveedores/${id}`),
  getTimeline: (id, type) => {
    const qs = type && type !== "all" ? `?type=${encodeURIComponent(type)}` : "";
    return apiClient.get(`/proveedores/${id}/timeline${qs}`);
  },
  create: (body) => apiClient.post("/proveedores", body),
  update: (id, body) => apiClient.patch(`/proveedores/${id}`, body),
  remove: (id) => apiClient.delete(`/proveedores/${id}`),
};
