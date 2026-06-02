import { apiClient } from "../../../services/apiClient";

export const outlookOAuthService = {
  getStatus: () => apiClient.get("/outlook/oauth/status"),
  getConnectUrl: () => apiClient.get("/outlook/oauth/connect"),
  disconnect: () => apiClient.post("/outlook/oauth/disconnect"),
};
