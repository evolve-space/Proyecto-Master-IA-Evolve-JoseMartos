const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

export function formatFileSize(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/** @param {File[]} files */
export async function filesToOutgoingAttachments(files) {
  const attachments = [];
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`"${file.name}" supera 3 MB (límite de Outlook).`);
    }
    const contentBase64 = await readFileAsBase64(file);
    attachments.push({
      name: file.name,
      contentType: file.type || "application/octet-stream",
      contentBase64,
    });
  }
  return attachments;
}

export function isImageAttachment(att) {
  const type = String(att?.contentType ?? "").toLowerCase();
  const name = String(att?.name ?? "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name);
}

export function isPdfAttachment(att) {
  const type = String(att?.contentType ?? "").toLowerCase();
  const name = String(att?.name ?? "").toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

export function getAttachmentPreviewKind(blob, att) {
  const type = String(blob?.type ?? att?.contentType ?? "").toLowerCase();
  const name = String(att?.name ?? "").toLowerCase();
  if (type.startsWith("image/") || isImageAttachment(att)) return "image";
  if (type === "application/pdf" || name.endsWith(".pdf") || isPdfAttachment(att)) return "pdf";
  return "file";
}

export function getAttachmentId(att) {
  return att?.id ?? att?.attachmentId ?? null;
}

export function normalizeCid(value) {
  return String(value ?? "")
    .replace(/^cid:/i, "")
    .replace(/^<|>$/g, "")
    .trim()
    .toLowerCase();
}

export function bodyHasEmbeddedImages(body) {
  return /cid:/i.test(String(body ?? ""));
}

/** @param {Array<{contentId?: string, name?: string}>} attachments */
export function buildCidAttachmentMap(attachments) {
  const map = new Map();
  for (const att of attachments ?? []) {
    const id = getAttachmentId(att);
    if (!id) continue;
    const cid = att.contentId ?? att.content_id;
    if (cid) map.set(normalizeCid(cid), att);
    if (att.name) map.set(normalizeCid(att.name), att);
  }
  return map;
}
