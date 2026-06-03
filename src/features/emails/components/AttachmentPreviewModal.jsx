import Modal from "../../../components/ui/Modal";
import { getAttachmentPreviewKind } from "../utils/attachmentUtils";

export default function AttachmentPreviewModal({ preview, onClose, onDownload }) {
  if (!preview) return null;

  const kind = getAttachmentPreviewKind(preview.blob, preview.att);

  return (
    <Modal title={preview.name} onClose={onClose} size="lg">
      <div className="flex flex-col gap-4">
        {kind === "image" && (
          <div className="flex justify-center bg-slate-50 rounded-lg p-2 max-h-[70vh] overflow-auto">
            <img
              src={preview.url}
              alt={preview.name}
              className="max-w-full h-auto object-contain"
            />
          </div>
        )}
        {kind === "pdf" && (
          <iframe
            src={preview.url}
            title={preview.name}
            className="w-full min-h-[60vh] rounded-lg border border-[#E2E4D9] bg-white"
          />
        )}
        {kind === "file" && (
          <div className="text-center py-8 text-sm text-slate-600">
            <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">description</span>
            <p>Vista previa no disponible para este tipo de archivo.</p>
            {onDownload && preview.att && (
              <button
                type="button"
                onClick={() => onDownload(preview.att)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Descargar
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
