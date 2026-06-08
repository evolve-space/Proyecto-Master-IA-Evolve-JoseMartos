import { Link } from 'react-router-dom'
import Modal from '../../../components/ui/Modal'
import { getEntityLink, urgencyLabel, urgencyStyle } from '../../emails/utils/emailEntityLink'
import { formatDateLong, formatTime, fromLocalInput, toLocalInputValue } from '../utils/dateUtils'

const inp = 'w-full border border-[#E2E4D9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#62C234]/40 focus:border-[#62C234]'

function F({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function EventModal({
  mode,
  form,
  set,
  onClose,
  onSubmit,
  onDelete,
  saving,
  proveedores = [],
  emails = [],
  categorias = [],
  outlookConnected,
}) {
  const isView = mode === 'view'
  const isDelete = mode === 'delete'
  const title = {
    create: 'Nuevo evento',
    edit: 'Editar evento',
    view: form.subject || 'Evento',
    delete: 'Eliminar evento',
  }[mode]

  if (isDelete) {
    return (
      <Modal title={title} onClose={onClose} size="sm">
        <p className="text-sm text-slate-600 mb-6">
          ¿Eliminar <strong>{form.subject}</strong>?
          {form.graphEventId && outlookConnected && (
            <span className="block mt-2 text-xs text-slate-500">También se eliminará de Outlook si está vinculado.</span>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[#E2E4D9] hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    )
  }

  if (isView) {
    return (
      <Modal title={title} onClose={onClose}>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-1">Cuándo</p>
            <p className="font-medium text-slate-800">
              {formatDateLong(form.startAt)}
              {!form.allDay && (
                <span className="text-slate-500 font-normal">
                  {' '}· {formatTime(form.startAt)} – {formatTime(form.endAt)}
                </span>
              )}
              {form.allDay && <span className="text-slate-500 font-normal"> · Todo el día</span>}
            </p>
          </div>

          {form.location && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Ubicación</p>
              <p className="text-slate-700">{form.location}</p>
            </div>
          )}

          {form.description && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Descripción</p>
              <p className="text-slate-600 whitespace-pre-wrap">{form.description}</p>
            </div>
          )}

          {form.organizer && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Organizador</p>
              <p className="text-slate-600">{form.organizer}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              form.source === 'outlook' ? 'bg-sky-100 text-sky-800' : 'bg-[#62C234]/20 text-[#276c00]'
            }`}>
              {form.source === 'outlook' ? 'Outlook' : 'Local'}
            </span>
            {form.urgency && form.urgency !== 'normal' && (
              <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${urgencyStyle[form.urgency] ?? urgencyStyle.normal}`}>
                Urgencia {urgencyLabel[form.urgency] ?? form.urgency}
              </span>
            )}
            {form.categoriaNombre && (
              <span
                className="text-xs px-2 py-1 rounded-full font-medium text-white"
                style={{ backgroundColor: form.categoriaColor || '#64748b' }}
              >
                {form.categoriaNombre}
              </span>
            )}
            {form.proveedorNombre && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {form.proveedorNombre}
              </span>
            )}
          </div>

          {(() => {
            const entity = getEntityLink(form)
            if (!entity) return null
            return (
              <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E4D9]">
                <p className="text-xs text-slate-400 mb-1">Entidad vinculada</p>
                <Link to={entity.to} className="text-primary hover:underline font-medium text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  {entity.label}
                  {entity.sub && <span className="text-slate-500 font-normal">· {entity.sub}</span>}
                </Link>
              </div>
            )
          })()}

          {form.emailId && (
            <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E4D9]">
              <p className="text-xs text-slate-400 mb-1">Correo vinculado</p>
              <Link to="/correos" className="text-primary hover:underline font-medium text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {form.emailSubject || `Correo #${form.emailId}`}
              </Link>
            </div>
          )}

          {form.webLink && (
            <a
              href={form.webLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-sky-700 hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Abrir en Outlook
            </a>
          )}
        </div>

        <div className="flex justify-between gap-2 mt-6 pt-4 border-t border-[#E2E4D9]">
          <button
            type="button"
            onClick={() => onDelete?.()}
            className="px-4 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50"
          >
            Eliminar
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[#E2E4D9] hover:bg-slate-50">
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => onSubmit('edit')}
              className="px-4 py-2 text-sm rounded-lg bg-[#276c00] text-white hover:bg-[#276c00]/90"
            >
              Editar
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <F label="Asunto *" full>
          <input
            required
            value={form.subject ?? ''}
            onChange={(e) => set('subject', e.target.value)}
            className={inp}
            placeholder="Reunión con proveedor…"
          />
        </F>

        <F label="Ubicación" full>
          <input
            value={form.location ?? ''}
            onChange={(e) => set('location', e.target.value)}
            className={inp}
            placeholder="Sala, Teams, dirección…"
          />
        </F>

        <F label="Inicio *">
          <input
            required
            type={form.allDay ? 'date' : 'datetime-local'}
            value={toLocalInputValue(form.startAt, form.allDay)}
            onChange={(e) => set('startAt', fromLocalInput(e.target.value, form.allDay))}
            className={inp}
          />
        </F>

        <F label="Fin *">
          <input
            required
            type={form.allDay ? 'date' : 'datetime-local'}
            value={toLocalInputValue(form.endAt, form.allDay)}
            onChange={(e) => set('endAt', fromLocalInput(e.target.value, form.allDay))}
            className={inp}
          />
        </F>

        <F label="Todo el día" full>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.allDay}
              onChange={(e) => set('allDay', e.target.checked)}
              className="rounded border-[#E2E4D9] text-[#62C234] focus:ring-[#62C234]"
            />
            Evento de día completo
          </label>
        </F>

        <F label="Descripción" full>
          <textarea
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            className={inp}
            placeholder="Notas, agenda, recordatorios…"
          />
        </F>

        <F label="Categoría">
          <select
            value={form.categoriaId ?? ''}
            onChange={(e) => set('categoriaId', e.target.value ? Number(e.target.value) : null)}
            className={inp}
          >
            <option value="">— Sin categoría —</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </F>

        <F label="Proveedor">
          <select
            value={form.proveedorId ?? ''}
            onChange={(e) => set('proveedorId', e.target.value ? Number(e.target.value) : null)}
            className={inp}
          >
            <option value="">— Ninguno —</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </F>

        <F label="Correo vinculado">
          <select
            value={form.emailId ?? ''}
            onChange={(e) => set('emailId', e.target.value ? Number(e.target.value) : null)}
            className={inp}
          >
            <option value="">— Ninguno —</option>
            {emails.map((em) => (
              <option key={em.id} value={em.id}>
                {em.subject?.slice(0, 60) || `Correo #${em.id}`}
              </option>
            ))}
          </select>
        </F>

        {outlookConnected && (
          <F label="Outlook" full>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.pushOutlook !== false}
                onChange={(e) => set('pushOutlook', e.target.checked)}
                className="rounded border-[#E2E4D9] text-[#62C234] focus:ring-[#62C234]"
              />
              Sincronizar con calendario de Outlook
            </label>
          </F>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[#E2E4D9] hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-[#276c00] text-white hover:bg-[#276c00]/90 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : mode === 'create' ? 'Crear evento' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
