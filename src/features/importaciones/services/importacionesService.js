import { apiClient } from "../../../services/apiClient";
import { buildImportacionPdfBlob } from "../utils/importacionPdf";

const PDF_WEBHOOK_URL = import.meta.env.VITE_N8N_IMPORTACIONES_PDF_WEBHOOK;
/** "n8n" = solo webhook; "local" = solo navegador; "auto" = n8n y si falla, local */
const PDF_MODE_RAW = (import.meta.env.VITE_IMPORTACIONES_PDF_MODE ?? "").toLowerCase();
const PDF_MODE =
  PDF_MODE_RAW === "n8n" || PDF_MODE_RAW === "local" || PDF_MODE_RAW === "auto"
    ? PDF_MODE_RAW
    : PDF_WEBHOOK_URL
      ? "n8n"
      : "local";

const N8N_EMPTY_BODY_HINT =
  "El webhook de n8n respondio sin contenido (workflow inactivo o nodo Respond to Webhook vacio).";

function isPdfBytes(bytes) {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

function base64ToBlob(base64, mime = "application/pdf") {
  const normalized = base64.replace(/^data:application\/pdf;base64,/, "").trim();
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function extractPdfBlobFromJson(data) {
  if (!data || typeof data !== "object") return null;
  const candidates = [data.pdf, data.file, data.data, data.base64, data.content, data.body];
  for (const value of candidates) {
    if (typeof value === "string" && value.length > 0) {
      try {
        return base64ToBlob(value);
      } catch {
        /* siguiente */
      }
    }
  }
  return null;
}

function buildHttpError(status, statusText, bodyText) {
  let message = `Webhook n8n: HTTP ${status}${statusText ? ` (${statusText})` : ""}.`;
  const trimmed = (bodyText || "").trim();
  if (trimmed) {
    try {
      const json = JSON.parse(trimmed);
      if (json.message) message += ` ${json.message}`;
      else if (json.error) message += ` ${json.error}`;
    } catch {
      message += ` ${trimmed.slice(0, 160)}`;
    }
  } else {
    message += ` ${N8N_EMPTY_BODY_HINT}`;
  }
  const err = new Error(message);
  err.code = "n8n_http_error";
  err.status = status;
  return err;
}

async function fetchPdfFromN8n(importacion) {
  if (!PDF_WEBHOOK_URL) {
    throw new Error("Falta VITE_N8N_IMPORTACIONES_PDF_WEBHOOK en .env");
  }

  let response;
  try {
    response = await fetch(PDF_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(importacion),
    });
  } catch {
    const err = new Error("No hay conexion con el webhook de n8n.");
    err.code = "n8n_network";
    throw err;
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (!response.ok) {
    const bodyText = bytes.length > 0 ? new TextDecoder().decode(bytes) : "";
    throw buildHttpError(response.status, response.statusText, bodyText);
  }

  if (bytes.length === 0) {
    const err = new Error(N8N_EMPTY_BODY_HINT);
    err.code = "n8n_empty_body";
    throw err;
  }

  if (contentType.includes("application/pdf") || isPdfBytes(bytes)) {
    return new Blob([bytes], { type: "application/pdf" });
  }

  const text = new TextDecoder().decode(bytes).trim();
  if (text.startsWith("{") || text.startsWith("[")) {
    const data = JSON.parse(text);
    const pdfBlob = extractPdfBlobFromJson(data);
    if (pdfBlob) return pdfBlob;
    if (typeof data?.message === "string") return { message: data.message };
  }

  const err = new Error(N8N_EMPTY_BODY_HINT);
  err.code = "n8n_empty_body";
  throw err;
}

/**
 * Genera PDF de una importación.
 * Por defecto en local (sin n8n). Modo n8n: VITE_IMPORTACIONES_PDF_MODE=n8n
 */
export async function generateImportacionPdf(importacion) {
  if (PDF_MODE === "n8n") {
    return fetchPdfFromN8n(importacion);
  }

  if (PDF_MODE === "local") {
    return buildImportacionPdfBlob(importacion);
  }

  // auto: n8n primero, fallback local
  try {
    return await fetchPdfFromN8n(importacion);
  } catch (e) {
    if (e?.code === "n8n_empty_body" || e?.code === "n8n_network" || e?.code === "n8n_http_error") {
      return buildImportacionPdfBlob(importacion);
    }
    throw e;
  }
}

export const importacionesService = {
  getAll: () => apiClient.get("/importaciones"),
  getOne: (id) => apiClient.get(`/importaciones/${id}`),
  create: (body) => apiClient.post("/importaciones", body),
  update: (id, body) => apiClient.patch(`/importaciones/${id}`, body),
  remove: (id) => apiClient.delete(`/importaciones/${id}`),
  generatePdf: (importacion) => generateImportacionPdf(importacion),
};
