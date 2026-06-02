import { apiClient } from "../../../services/apiClient";

function normalizeRecipients(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function sendProveedorEmail(payload) {
  return apiClient.post("/outlook/send", {
    to: normalizeRecipients(payload?.email?.to),
    cc: normalizeRecipients(payload?.email?.cc),
    subject: payload?.email?.subject ?? "",
    body: payload?.email?.body ?? "",
    proveedor: payload?.proveedor ?? null,
  });
}
