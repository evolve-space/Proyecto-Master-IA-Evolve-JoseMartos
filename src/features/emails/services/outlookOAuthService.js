import { apiClient } from "../../../services/apiClient";

export const outlookOAuthService = {
  getStatus: () => apiClient.get("/outlook/oauth/status"),
  getConnectUrl: ({ consent = false, returnTo = "correos", popup = true } = {}) => {
    const params = new URLSearchParams();
    if (consent) params.set("consent", "1");
    if (returnTo) params.set("return", returnTo);
    if (popup) params.set("popup", "1");
    const qs = params.toString();
    return apiClient.get(`/outlook/oauth/connect${qs ? `?${qs}` : ""}`);
  },
  disconnect: () => apiClient.post("/outlook/oauth/disconnect"),
};
