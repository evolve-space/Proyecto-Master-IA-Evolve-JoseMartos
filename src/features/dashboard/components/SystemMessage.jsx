export default function SystemMessage() {
  return (
    <div className="bg-surface-container-low p-md rounded-xl border border-dashed border-outline-variant">
      <div className="flex gap-3">
        <span className="material-symbols-outlined text-secondary">info</span>
        <div>
          <p className="font-label-sm text-label-sm text-secondary uppercase mb-1">
            Aviso del sistema
          </p>
          <p className="text-body-sm text-slate-600">
            El informe trimestral de importaciones está listo para su revisión en la pestaña de documentos.
          </p>
        </div>
      </div>
    </div>
  )
}
