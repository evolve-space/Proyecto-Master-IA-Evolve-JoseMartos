import { apiClient } from "../../../services/apiClient";

const PDF_WEBHOOK_URL = import.meta.env.VITE_N8N_IMPORTACIONES_PDF_WEBHOOK;

async function sendToWebhook(body) {
  if (!PDF_WEBHOOK_URL) {
    throw new Error("Falta configurar VITE_N8N_IMPORTACIONES_PDF_WEBHOOK");
  }

  const response = await fetch(PDF_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let errorMessage = `Webhook error ${response.status}: ${response.statusText}`;
    if (contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage = errorData.message
        ? `Webhook error ${response.status}: ${errorData.message}`
        : `${errorMessage} ${JSON.stringify(errorData)}`;
    } else {
      const text = await response.text();
      if (text) errorMessage = `Webhook error ${response.status}: ${text}`;
    }
    throw new Error(errorMessage);
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.blob();
}

export const importacionesService = {
  getAll: () => apiClient.get("/importaciones"),
  getOne: (id) => apiClient.get(`/importaciones/${id}`),
  create: (body) => apiClient.post("/importaciones", body),
  update: (id, body) => apiClient.patch(`/importaciones/${id}`, body),
  remove: (id) => apiClient.delete(`/importaciones/${id}`),
  generatePdf: (importacion) => sendToWebhook(importacion),
};
