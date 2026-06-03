import { useState } from "react";
import {
  formatFileSize,
  getAttachmentId,
  isImageAttachment,
  isPdfAttachment,
} from "../utils/attachmentUtils";

export default function EmailAttachmentsPanel({
  attachments = [],
  hasAttachments,
  loading,
  onSync,
  onDownload,
  onPreview,
}) {
  const [downloadingId, setDownloadingId] = useState(null);

  if (!hasAttachments && attachments.length === 0) return null;

  const handleDownload = async (att) => {
    if (!att.downloadable && att.downloadable !== undefined) return;
    const attId = getAttachmentId(att);
    setDownloadingId(attId);
    try {
      await onDownload(att);
    } finally {
      setDownloadingId(null);
    }
  };

  const canPreview = (att) =>
    onPreview &&
    att.downloadable !== false &&
    (isImageAttachment(att) || isPdfAttachment(att));

  const renderAttachmentRow = (att, i) => {
    const attId = getAttachmentId(att);
    const canDownload = att.downloadable !== false;
    const busy = downloadingId === attId;
    const showPreview = canPreview(att);

    return (
      <li key={attId ?? i}>
        <div className="inline-flex items-center gap-1 text-sm bg-white border border-amber-200/80 rounded-lg overflow-hidden">
          {showPreview && (
            <button
              type="button"
              onClick={() => onPreview(att)}
              className="px-2 py-2 hover:bg-slate-50 text-slate-500"
              title={isPdfAttachment(att) ? "Ver PDF" : "Vista previa"}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPdfAttachment(att) ? "picture_as_pdf" : "visibility"}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDownload(att)}
            disabled={!canDownload || busy}
            title={canDownload ? "Descargar" : "No descargable (elemento vinculado)"}
            className="inline-flex items-center gap-2 px-3 py-2 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`material-symbols-outlined text-[16px] ${busy ? "animate-spin" : ""}`}>
              {busy ? "progress_activity" : canDownload ? "download" : "link"}
            </span>
            <span className="max-w-[180px] truncate">{att.name ?? "Archivo"}</span>
            {att.size ? <span className="text-slate-400">({formatFileSize(att.size)})</span> : null}
            {att.isInline && (
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">en línea</span>
            )}
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="shrink-0 px-3 sm:px-4 py-2 border-b border-[#E2E4D9] bg-amber-50/30">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">attach_file</span>
          Adjuntos
          {attachments.length > 0 && (
            <span className="font-normal text-amber-700/80">({attachments.length})</span>
          )}
        </p>
        <button
          type="button"
          onClick={onSync}
          disabled={loading}
          className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
        >
          <span className={`material-symbols-outlined text-[14px] ${loading ? "animate-spin" : ""}`}>
            {loading ? "progress_activity" : "refresh"}
          </span>
          {loading ? "Cargando…" : "Actualizar lista"}
        </button>
      </div>

      {loading && attachments.length === 0 && (
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          Obteniendo adjuntos desde Outlook…
        </p>
      )}

      {!loading && attachments.length === 0 && (
        <p className="text-xs text-slate-500">
          Este mensaje tiene adjuntos en Outlook. Pulsa <strong>Actualizar lista</strong>.
        </p>
      )}

      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-2">{attachments.map(renderAttachmentRow)}</ul>
      )}
    </div>
  );
}
