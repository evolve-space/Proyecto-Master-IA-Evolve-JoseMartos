export const inp =
  'w-full border border-[#E2E4D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

export function F({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

export function FormActions({ onCancel, saving, submitLabel = 'Guardar cambios' }) {
  return (
    <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-lg border border-[#E2E4D9] text-sm text-slate-600 hover:bg-slate-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Guardando…' : submitLabel}
      </button>
    </div>
  )
}
