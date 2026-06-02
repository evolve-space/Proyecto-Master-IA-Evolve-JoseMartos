import { apiClient } from "../../../services/apiClient";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function normalizeRecipients(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export const emailsService = {
  getAll: () => apiClient.get("/emails"),
  getOne: (id, { refresh = false } = {}) =>
    apiClient.get(`/emails/${id}${refresh ? "?refresh=1" : ""}`),
  refresh: (id) => apiClient.post(`/emails/${id}/refresh`),
  update: (id, data) => apiClient.patch(`/emails/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/emails/${id}`, { status }),
  updateCategoria: (id, categoriaId) =>
    apiClient.patch(`/emails/${id}`, { categoriaId: categoriaId ?? null }),
  remove: (id) => apiClient.delete(`/emails/${id}`),
  send: ({ to, cc, subject, body, attachments = [] }) =>
    apiClient.post("/outlook/send", {
      to: normalizeRecipients(to),
      cc: normalizeRecipients(cc),
      subject,
      body,
      attachments,
    }),
  reply: (id, { body, replyAll = false, attachments = [] }) =>
    apiClient.post(`/emails/${id}/reply`, { body, replyAll, attachments }),
  syncAttachments: (id) => apiClient.post(`/emails/${id}/attachments/sync`),
  /** Equivalente a `php bin/console app:sync-emails` (bandeja completa). */
  syncFromGraph: ({ all = true, top = 50, includeAttachments = true } = {}) =>
    apiClient.post("/emails/sync", { all, top, includeAttachments }),
  downloadAttachment: (id, attachmentId, filename = "adjunto") =>
    fetch(
      `${API_BASE}/emails/${id}/attachments/${encodeURIComponent(attachmentId)}/download`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
      },
    ).then(async (res) => {
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }),
  fetchAttachmentBlob: (id, attachmentId) =>
    fetch(
      `${API_BASE}/emails/${id}/attachments/${encodeURIComponent(attachmentId)}/download`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
      },
    ).then(async (res) => {
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? `HTTP ${res.status}`);
      }
      return res.blob();
    }),
};
