import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal";
import { emailCategoriasService } from "../services/emailCategoriasService";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

const inp =
  "w-full px-3 py-2 text-sm border border-[#E2E4D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function CategoriesModal({ onClose, onChanged }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ nombre: "", color: "#3b82f6" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await emailCategoriasService.getAll();
      setCategorias(list ?? []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ nombre: "", color: "#3b82f6" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nombre = form.nombre.trim();
    if (!nombre) return;

    setSaving(true);
    try {
      if (editingId) {
        await emailCategoriasService.update(editingId, { nombre, color: form.color });
      } else {
        await emailCategoriasService.create({ nombre, color: form.color });
      }
      resetForm();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ nombre: cat.nombre, color: cat.color });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría? Los correos quedarán sin categoría.")) return;
    try {
      await emailCategoriasService.remove(id);
      if (editingId === id) resetForm();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title="Categorías de correo" onClose={onClose} size="md">
      {error && (
        <p className="text-sm text-red-600 mb-3 rounded-lg bg-red-50 px-3 py-2">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 mb-6 pb-6 border-b border-slate-100">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
          {editingId ? "Editar categoría" : "Nueva categoría"}
        </p>
        <input
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          className={inp}
          placeholder="Nombre (ej. Urgente, Proveedores…)"
          required
        />
        <div className="flex flex-wrap gap-2 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              className={`w-8 h-8 rounded-full border-2 ${
                form.color === c ? "border-on-surface scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            className="w-10 h-8 cursor-pointer rounded border border-slate-200"
          />
        </div>
        <div className="flex gap-2 justify-end">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              Cancelar edición
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
          >
            {saving ? "Guardando…" : editingId ? "Guardar" : "Añadir"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : categorias.length === 0 ? (
        <p className="text-sm text-slate-400">Aún no hay categorías. Crea la primera arriba.</p>
      ) : (
        <ul className="space-y-2 max-h-[240px] overflow-y-auto">
          {categorias.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#E2E4D9] px-3 py-2"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-medium truncate">{cat.nombre}</span>
              </span>
              <span className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(cat)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                  title="Editar"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-red-600"
                  title="Eliminar"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
