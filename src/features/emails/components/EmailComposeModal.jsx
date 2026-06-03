import Modal from "../../../components/ui/Modal";
import ComposeFilePreview from "./ComposeFilePreview";
import { formatFileSize } from "../utils/attachmentUtils";

const inp =
  "w-full px-3 py-2 text-sm border border-[#E2E4D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

export default function EmailComposeModal({
  title,
  onClose,
  form,
  onChange,
  onSubmit,
  sending,
  status,
  submitLabel = "Enviar",
  showTo = true,
  showCc = true,
  allowAttachments = true,
}) {
  const set = (key, value) => onChange({ ...form, [key]: value });
  const files = form.files ?? [];

  const onFilesSelected = (e) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    set("files", [...files, ...picked]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    set(
      "files",
      files.filter((_, i) => i !== index),
    );
  };

  return (
    <Modal title={title} onClose={onClose} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        {showTo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="text-slate-600 font-medium">Para *</span>
              <input
                required
                type="text"
                value={form.to}
                onChange={(e) => set("to", e.target.value)}
                className={inp + " mt-1"}
                placeholder="correo@empresa.com"
              />
            </label>
            {showCc && (
              <label className="block text-sm">
                <span className="text-slate-600 font-medium">CC</span>
                <input
                  type="text"
                  value={form.cc}
                  onChange={(e) => set("cc", e.target.value)}
                  className={inp + " mt-1"}
                  placeholder="opcional, separados por coma"
                />
              </label>
            )}
          </div>
        )}

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Asunto *</span>
          <input
            required
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            className={inp + " mt-1"}
          />
        </label>

        {allowAttachments && (
          <div className="space-y-2">
            <span className="text-slate-600 font-medium text-sm">Adjuntos</span>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline w-fit">
              <span className="material-symbols-outlined text-[18px]">attach_file</span>
              Añadir archivos
              <input type="file" multiple className="sr-only" onChange={onFilesSelected} />
            </label>
            <p className="text-[11px] text-slate-400">Máximo 3 MB por archivo (límite de Outlook).</p>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-3 text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2"
                  >
                    <ComposeFilePreview file={file} />
                    <span className="truncate flex-1 min-w-0">
                      {file.name}{" "}
                      <span className="text-slate-400">({formatFileSize(file.size)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded shrink-0"
                      aria-label="Quitar adjunto"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Mensaje *</span>
          <textarea
            required
            rows={12}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            className={inp + " mt-1 resize-y"}
            placeholder="Escribe el cuerpo del correo…"
          />
        </label>

        {status && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              status.ok
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#E2E4D9] text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? "Enviando…" : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
