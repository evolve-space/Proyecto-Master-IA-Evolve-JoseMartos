import { useState } from "react";
import { formatFileSize, isImageAttachment } from "../utils/attachmentUtils";

export default function EmailAttachmentsPanel({
  attachments = [],
  hasAttachments,
  loading,
  onSync,
  onDownload,
  onPreview,
}) {
  const [downloadingId, setDownloadingId] = useState(null);

  if (!hasAttachments) return null;

  const handleDownload = async (att) => {
    if (!att.downloadable && att.downloadable !== undefined) return;
    setDownloadingId(att.id);
    try {
      await onDownload(att);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-[#E2E4D9] bg-amber-50/30">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide flex items-center gap-1">
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
        <ul className="flex flex-wrap gap-2">
          {attachments.map((att, i) => {
            const canDownload = att.downloadable !== false;
            const busy = downloadingId === att.id;
            return (
              <li key={att.id ?? i}>
                <div className="inline-flex items-center gap-1 text-xs bg-white border border-amber-200/80 rounded-lg overflow-hidden">
                  {canDownload && isImageAttachment(att) && onPreview && (
                    <button
                      type="button"
                      onClick={() => onPreview(att)}
                      className="px-2 py-2 hover:bg-slate-50 text-slate-500"
                      title="Vista previa"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
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
                    {att.size ? (
                      <span className="text-slate-400">({formatFileSize(att.size)})</span>
                    ) : null}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
