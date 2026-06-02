import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Modal from "../../../components/ui/Modal";
import CategoriesModal from "../components/CategoriesModal";
import EmailAttachmentsPanel from "../components/EmailAttachmentsPanel";
import EmailComposeModal from "../components/EmailComposeModal";
import { filesToOutgoingAttachments } from "../utils/attachmentUtils";
import { emailCategoriasService } from "../services/emailCategoriasService";
import { emailsService } from "../services/emailsService";
import { outlookOAuthService } from "../services/outlookOAuthService";

const EMPTY_COMPOSE = { to: "", cc: "", subject: "", body: "", files: [] };

function extractEmailAddress(value) {
  const s = String(value ?? "").trim();
  const match = s.match(/<([^>]+)>/);
  if (match) return match[1].trim();
  if (s.includes("@")) return s;
  return "";
}

function buildReplyTemplate(email) {
  const from = extractEmailAddress(email?.sender) || "";
  const subject = email?.subject?.startsWith("Re:") ? email.subject : `Re: ${email?.subject || ""}`;
  return {
    to: from,
    cc: "",
    subject,
    body: "\n\n---\n",
  };
}

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80",
  read: "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
  replied: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
  closed: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const statusLabel = {
  pending: "Pendiente",
  read: "Leído",
  replied: "Respondido",
  closed: "Cerrado",
};

function formatDate(value, { short = false } = {}) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  if (short) {
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  }
  return d.toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function senderInitials(sender) {
  const s = String(sender ?? "").trim();
  if (!s) return "?";
  const match = s.match(/^([^<@]+)/);
  const name = (match?.[1] ?? s).trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function EmailBody({ email }) {
  const body = email?.body?.trim();
  if (!body) {
    return (
      <p className="text-sm text-slate-400 italic py-8 text-center">
        Sin contenido. Pulsa «Actualizar desde Outlook» para cargar el mensaje completo.
      </p>
    );
  }
  if (email.bodyIsHtml) {
    return (
      <div
        className="email-html-body prose prose-sm max-w-none prose-slate prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }
  return <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">{body}</pre>;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [outlook, setOutlook] = useState({ connected: false, email: null, loading: true });
  const [connectingOutlook, setConnectingOutlook] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categorias, setCategorias] = useState([]);
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [composeMode, setComposeMode] = useState(null);
  const [composeForm, setComposeForm] = useState(EMPTY_COMPOSE);
  const [composeSending, setComposeSending] = useState(false);
  const [composeStatus, setComposeStatus] = useState(null);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const loadOutlookStatus = useCallback(async () => {
    try {
      const status = await outlookOAuthService.getStatus();
      setOutlook({
        connected: Boolean(status?.connected),
        email: status?.email ?? null,
        loading: false,
      });
    } catch {
      setOutlook({ connected: false, email: null, loading: false });
    }
  }, []);

  const loadList = useCallback(async (silent = false) => {
    if (!silent) setListLoading(true);
    try {
      const list = await emailsService.getAll();
      setEmails(list ?? []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      if (!silent) setListLoading(false);
    }
  }, []);

  const loadCategorias = useCallback(async () => {
    try {
      const list = await emailCategoriasService.getAll();
      setCategorias(list ?? []);
    } catch {
      setCategorias([]);
    }
  }, []);

  useEffect(() => {
    loadList();
    loadOutlookStatus();
    loadCategorias();
  }, [loadList, loadOutlookStatus, loadCategorias]);

  useEffect(() => {
    const interval = setInterval(() => loadList(true), 30000);
    return () => clearInterval(interval);
  }, [loadList]);

  useEffect(() => {
    const result = searchParams.get("outlook");
    if (!result) return;

    if (result === "connected") {
      setError(null);
      loadOutlookStatus();
    } else if (result === "error") {
      const msg = searchParams.get("message");
      setError(msg ? decodeURIComponent(msg) : "No se pudo conectar Outlook.");
    }

    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, loadOutlookStatus]);

  const handleConnectOutlook = async () => {
    setConnectingOutlook(true);
    try {
      const { url } = await outlookOAuthService.getConnectUrl();
      if (!url) throw new Error("No se recibió URL de Microsoft.");
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setConnectingOutlook(false);
    }
  };

  const handleDisconnectOutlook = async () => {
    try {
      await outlookOAuthService.disconnect();
      setOutlook({ connected: false, email: null, loading: false });
    } catch (e) {
      setError(e.message);
    }
  };

  const stats = useMemo(() => {
    const counts = { pending: 0, read: 0, replied: 0, closed: 0 };
    for (const e of emails) {
      if (counts[e.status] !== undefined) counts[e.status]++;
    }
    return { total: emails.length, ...counts };
  }, [emails]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return emails.filter((email) => {
      const statusOk = statusFilter === "all" || email.status === statusFilter;
      const categoriaOk =
        categoriaFilter === "all" ||
        (categoriaFilter === "none" ? !email.categoriaId : email.categoriaId === Number(categoriaFilter));
      const textOk =
        q === "" ||
        [email.subject, email.sender, email.recipients, email.proveedorNombre, email.categoriaNombre, email.messageId]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return statusOk && categoriaOk && textOk;
    });
  }, [emails, search, statusFilter, categoriaFilter]);

  const selectedListItem = useMemo(
    () => emails.find((e) => e.id === selectedId) ?? null,
    [emails, selectedId],
  );

  const applyEmailUpdate = useCallback((updated) => {
    if (!updated?.id) return;
    setEmails((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    setDetail((d) => (d?.id === updated.id ? { ...d, ...updated } : d));
  }, []);

  const loadAttachmentsForEmail = useCallback(
    async (emailId) => {
      setAttachmentsLoading(true);
      try {
        const result = await emailsService.syncAttachments(emailId);
        if (result?.email) {
          applyEmailUpdate(result.email);
        } else if (result?.attachments) {
          applyEmailUpdate({
            id: emailId,
            attachments: result.attachments,
            hasAttachments: result.hasAttachments,
          });
        }
      } catch (e) {
        setDetailError(e.message);
      } finally {
        setAttachmentsLoading(false);
      }
    },
    [applyEmailUpdate],
  );

  const openEmail = useCallback(
    async (email) => {
      setSelectedId(email.id);
      setMobileShowDetail(true);
      setDetail(null);
      setDetailError(null);
      setDetailLoading(true);

      try {
        const full = await emailsService.getOne(email.id, { refresh: true });
        setDetail(full);
        setEmails((prev) => prev.map((item) => (item.id === full.id ? { ...item, ...full } : item)));

        if (full.status === "pending") {
          const updated = await emailsService.updateStatus(email.id, "read");
          const merged = { ...full, ...updated };
          applyEmailUpdate(merged);
        }

        if (full.hasAttachments && !(full.attachments?.length > 0)) {
          await loadAttachmentsForEmail(full.id);
        }
      } catch (e) {
        setDetailError(e.message);
        setDetail(email);
      } finally {
        setDetailLoading(false);
      }
    },
    [applyEmailUpdate, loadAttachmentsForEmail],
  );

  const refreshDetail = async () => {
    if (!selectedId) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const full = await emailsService.refresh(selectedId);
      setDetail(full);
      setEmails((prev) => prev.map((item) => (item.id === full.id ? { ...item, ...full } : item)));
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await emailsService.syncFromGraph({
        all: true,
        top: 50,
        includeAttachments: true,
      });
      setSyncStats(result ?? null);
      await loadList(true);
      if (selectedId) {
        const still = (await emailsService.getAll()).find((e) => e.id === selectedId);
        if (still) await openEmail(still);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkStatus = async (status) => {
    if (!detail) return;
    setSaving(true);
    try {
      const updated = await emailsService.updateStatus(detail.id, status);
      setEmails((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setDetail(updated);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await emailsService.remove(deleteTarget.id);
      setEmails((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) {
        setSelectedId(null);
        setDetail(null);
        setMobileShowDetail(false);
      }
      setDeleteTarget(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadAttachment = async (att) => {
    if (!detail?.id || !att?.id) return;
    try {
      await emailsService.downloadAttachment(detail.id, att.id, att.name ?? "adjunto");
    } catch (e) {
      alert(`No se pudo descargar el adjunto.\n\n${e.message}`);
      throw e;
    }
  };

  const handlePreviewAttachment = async (att) => {
    if (!detail?.id || !att?.id) return;
    try {
      const blob = await emailsService.fetchAttachmentBlob(detail.id, att.id);
      const url = window.URL.createObjectURL(blob);
      setAttachmentPreview({ url, name: att.name ?? "Vista previa" });
    } catch (e) {
      alert(`No se pudo abrir la vista previa.\n\n${e.message}`);
    }
  };

  const closeAttachmentPreview = () => {
    if (attachmentPreview?.url) {
      window.URL.revokeObjectURL(attachmentPreview.url);
    }
    setAttachmentPreview(null);
  };

  const openCompose = () => {
    if (!outlook.connected) {
      setError("Conecta Outlook para redactar correos.");
      return;
    }
    setComposeForm(EMPTY_COMPOSE);
    setComposeStatus(null);
    setComposeMode("new");
  };

  const openReply = () => {
    if (!outlook.connected) {
      setError("Conecta Outlook para responder.");
      return;
    }
    const email = detail ?? selectedListItem;
    if (!email) return;
    setComposeForm(buildReplyTemplate(email));
    setComposeStatus(null);
    setComposeMode("reply");
  };

  const closeCompose = () => {
    setComposeMode(null);
    setComposeForm(EMPTY_COMPOSE);
    setComposeStatus(null);
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    setComposeSending(true);
    setComposeStatus(null);
    try {
      const attachments = await filesToOutgoingAttachments(composeForm.files ?? []);
      if (composeMode === "reply") {
        const email = detail ?? selectedListItem;
        if (!email) throw new Error("Selecciona un correo.");
        const result = await emailsService.reply(email.id, {
          body: composeForm.body,
          attachments,
        });
        if (result?.email) applyEmailUpdate(result.email);
        setComposeStatus({ ok: true, message: "Respuesta enviada." });
      } else {
        await emailsService.send({ ...composeForm, attachments });
        setComposeStatus({ ok: true, message: "Correo enviado correctamente." });
      }
    } catch (err) {
      setComposeStatus({ ok: false, message: err?.message || "No se pudo enviar." });
    } finally {
      setComposeSending(false);
    }
  };

  const handleCategoriaChange = async (categoriaId) => {
    if (!detail) return;
    setSaving(true);
    try {
      const updated = await emailsService.updateCategoria(
        detail.id,
        categoriaId === "" ? null : Number(categoriaId),
      );
      setEmails((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setDetail(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (listLoading && emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 text-slate-500">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary/70">progress_activity</span>
        <p className="text-sm">Cargando bandeja de correos…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[calc(100vh-4.5rem)] min-h-[640px]">
      {!outlook.loading && !outlook.connected && (
        <div className="mb-3 shrink-0 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-white px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="material-symbols-outlined text-sky-600 text-2xl shrink-0">link</span>
            <div>
              <p className="text-sm font-semibold text-sky-900">Conecta tu Outlook</p>
              <p className="text-xs text-sky-700/90 mt-0.5 max-w-xl">
                Funciona con Hotmail, Outlook.com y Microsoft 365. Inicias sesión una vez — no hace falta inventar una organización.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleConnectOutlook}
            disabled={connectingOutlook}
            className="shrink-0 flex items-center gap-2 bg-sky-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-sky-700 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            {connectingOutlook ? "Redirigiendo…" : "Conectar Outlook"}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-3 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="shrink-0 mb-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
              Correos
            </h2>
            <p className="text-body-sm text-slate-500 mt-0.5">
              {outlook.connected ? (
                <>
                  {stats.total} correos en base de datos
                  <span className="text-slate-300 mx-1">·</span>
                  <button
                    type="button"
                    onClick={handleDisconnectOutlook}
                    className="text-slate-400 hover:text-red-600 underline"
                  >
                    Cambiar cuenta Outlook
                  </button>
                </>
              ) : (
                `${stats.total} en base de datos · conecta Outlook para sincronizar`
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCategoriesModal(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E2E4D9] bg-white text-sm text-slate-700 hover:border-primary/40"
            >
              <span className="material-symbols-outlined text-[18px]">label</span>
              Categorías
            </button>
            <button
              type="button"
              onClick={openCompose}
              disabled={!outlook.connected}
              title={!outlook.connected ? "Conecta Outlook primero" : undefined}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E2E4D9] bg-white text-sm text-slate-700 hover:border-primary/40 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Nuevo correo
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || !outlook.connected}
              title={!outlook.connected ? "Conecta Outlook primero" : undefined}
              className="flex items-center gap-2 bg-primary text-white font-label-md px-4 py-2.5 rounded-xl shadow-sm shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[20px] ${syncing ? "animate-spin" : ""}`}>
                sync
              </span>
              {syncing ? "Sincronizando…" : "Sincronizar"}
            </button>
          </div>
        </div>

        {syncStats && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1">
              {syncStats.fetched ?? 0} leídos en Graph
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">
              +{syncStats.imported ?? 0} nuevos
            </span>
            <span className="rounded-full bg-slate-100 text-slate-500 px-3 py-1">
              {syncStats.duplicated ?? 0} ya existían
            </span>
            {(syncStats.failed ?? 0) > 0 && (
              <span className="rounded-full bg-red-50 text-red-600 px-3 py-1">
                {syncStats.failed} fallidos
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {[
            { key: "pending", label: "Pendientes", icon: "mark_email_unread", color: "text-amber-600" },
            { key: "read", label: "Leídos", icon: "drafts", color: "text-sky-600" },
            { key: "replied", label: "Respondidos", icon: "reply", color: "text-emerald-600" },
            { key: "closed", label: "Cerrados", icon: "inventory_2", color: "text-slate-500" },
          ].map(({ key, label, icon, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                statusFilter === key
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-[#E2E4D9] bg-white hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
                <span className="text-lg font-bold text-on-surface">{stats[key]}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Búsqueda */}
      <div className="shrink-0 flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar asunto, remitente, proveedor…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E4D9] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E4D9] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="read">Leído</option>
          <option value="replied">Respondido</option>
          <option value="closed">Cerrado</option>
        </select>
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E4D9] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[200px]"
        >
          <option value="all">Todas las categorías</option>
          <option value="none">Sin categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Panel principal */}
      <div className="flex-1 min-h-0 flex gap-0 rounded-2xl border border-[#E2E4D9] bg-white shadow-sm overflow-hidden">
        {/* Lista */}
        <aside
          className={`w-full md:w-[min(42vw,480px)] lg:w-[min(38vw,520px)] shrink-0 flex flex-col border-r border-[#E2E4D9] bg-slate-50/40 ${
            mobileShowDetail ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-4 py-2 border-b border-[#E2E4D9] bg-white/80 text-xs font-medium text-slate-500 uppercase tracking-wider">
            {filtered.length} mensajes
          </div>
          <ul className="flex-1 overflow-y-auto divide-y divide-[#E2E4D9]/80">
            {filtered.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-400">
                {emails.length === 0 ? (
                  <>
                    <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">inbox</span>
                    Bandeja vacía. Pulsa <strong>Sincronizar Outlook</strong>.
                  </>
                ) : (
                  `Sin resultados para «${search}»`
                )}
              </li>
            )}
            {filtered.map((email) => {
              const active = selectedId === email.id;
              const unread = email.status === "pending";
              return (
                <li key={email.id}>
                  <button
                    type="button"
                    onClick={() => openEmail(email)}
                    className={`w-full text-left px-4 py-3 transition-colors flex gap-3 ${
                      active ? "bg-primary/8 border-l-[3px] border-l-primary" : "hover:bg-white border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        unread ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {senderInitials(email.sender)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 items-baseline">
                        <span className={`text-sm truncate ${unread ? "font-bold text-on-surface" : "font-medium text-slate-700"}`}>
                          {email.sender?.split("<")[0]?.trim() || email.sender || "—"}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">{formatDate(email.receivedAt, { short: true })}</span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${unread ? "font-semibold text-on-surface" : "text-slate-600"}`}>
                        {email.subject || "(Sin asunto)"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[email.status] ?? statusStyles.closed}`}>
                          {statusLabel[email.status] ?? email.status}
                        </span>
                        {email.hasAttachments && (
                          <span className="material-symbols-outlined text-slate-400 text-[14px]">attach_file</span>
                        )}
                        {email.categoriaNombre && (
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white truncate max-w-[100px]"
                            style={{ backgroundColor: email.categoriaColor || "#64748b" }}
                          >
                            {email.categoriaNombre}
                          </span>
                        )}
                        {email.proveedorNombre && (
                          <span className="text-[10px] text-primary truncate max-w-[140px]">{email.proveedorNombre}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Lectura */}
        <section
          className={`flex-1 flex flex-col min-w-0 bg-white ${
            !mobileShowDetail ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-3">mail</span>
              <p className="text-sm text-center max-w-xs">
                Selecciona un correo para ver el contenido completo desde Outlook
              </p>
            </div>
          ) : (
            <>
              <header className="shrink-0 border-b border-[#E2E4D9] px-4 sm:px-6 py-4">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    className="md:hidden shrink-0 p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                    onClick={() => setMobileShowDetail(false)}
                    aria-label="Volver a la lista"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-on-surface leading-snug">
                      {detail?.subject || selectedListItem?.subject || "Cargando…"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(detail?.receivedAt ?? selectedListItem?.receivedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={openReply}
                      disabled={!outlook.connected || detailLoading}
                      title="Responder"
                      className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[20px]">reply</span>
                    </button>
                    <button
                      type="button"
                      onClick={refreshDetail}
                      disabled={detailLoading}
                      title="Actualizar desde Outlook"
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary disabled:opacity-40"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${detailLoading ? "animate-spin" : ""}`}>
                        refresh
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(detail ?? selectedListItem)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["read", "replied", "closed", "pending"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={saving || !detail}
                      onClick={() => handleMarkStatus(st)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                        detail?.status === st
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-[#E2E4D9] text-slate-600 hover:border-primary/40"
                      }`}
                    >
                      {statusLabel[st]}
                    </button>
                  ))}
                </div>
              </header>

              <div className="shrink-0 px-4 sm:px-6 py-3 bg-slate-50/60 border-b border-[#E2E4D9] text-sm space-y-2">
                <div className="flex gap-2">
                  <span className="text-slate-400 w-14 shrink-0">De</span>
                  <span className="text-slate-700 break-all">{detail?.sender ?? selectedListItem?.sender}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400 w-14 shrink-0">Para</span>
                  <span className="text-slate-600 break-all">{detail?.recipients || "—"}</span>
                </div>
                {detail?.proveedor && (
                  <div className="flex gap-2 items-center">
                    <span className="text-slate-400 w-14 shrink-0">Prov.</span>
                    <Link
                      to="/proveedores"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">factory</span>
                      {detail.proveedorNombre ?? `Proveedor #${detail.proveedor}`}
                    </Link>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <span className="text-slate-400 w-14 shrink-0">Cat.</span>
                  <select
                    value={detail?.categoriaId ?? ""}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                    disabled={saving || !detail}
                    className="flex-1 max-w-xs text-sm border border-[#E2E4D9] rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {detail?.categoriaColor && (
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-slate-200"
                      style={{ backgroundColor: detail.categoriaColor }}
                    />
                  )}
                </div>
              </div>

              <EmailAttachmentsPanel
                hasAttachments={detail?.hasAttachments ?? selectedListItem?.hasAttachments}
                attachments={detail?.attachments ?? []}
                loading={attachmentsLoading}
                onSync={() => detail?.id && loadAttachmentsForEmail(detail.id)}
                onDownload={handleDownloadAttachment}
                onPreview={handlePreviewAttachment}
              />

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
                {detailLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    Cargando mensaje completo…
                  </div>
                )}
                {detailError && (
                  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-800">
                    No se pudo refrescar desde Graph: {detailError}. Mostrando copia local.
                  </div>
                )}
                <EmailBody email={detail ?? selectedListItem} />
              </div>
            </>
          )}
        </section>
      </div>

      {showCategoriesModal && (
        <CategoriesModal
          onClose={() => setShowCategoriesModal(false)}
          onChanged={() => {
            loadCategorias();
            loadList(true);
          }}
        />
      )}

      {composeMode && (
        <EmailComposeModal
          title={composeMode === "reply" ? "Responder" : "Nuevo correo"}
          onClose={closeCompose}
          form={composeForm}
          onChange={setComposeForm}
          onSubmit={handleComposeSubmit}
          sending={composeSending}
          status={composeStatus}
          submitLabel={composeMode === "reply" ? "Enviar respuesta" : "Enviar"}
          showTo={composeMode === "new"}
          showCc={composeMode === "new"}
        />
      )}

      {attachmentPreview && (
        <Modal title={attachmentPreview.name} onClose={closeAttachmentPreview} size="lg">
          <div className="flex justify-center bg-slate-50 rounded-lg p-2 max-h-[70vh] overflow-auto">
            <img
              src={attachmentPreview.url}
              alt={attachmentPreview.name}
              className="max-w-full h-auto object-contain"
            />
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Eliminar correo" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="text-sm text-slate-600 mb-6">
            ¿Eliminar <strong>{deleteTarget.subject}</strong>? Esta acción no borra el mensaje en Outlook.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-[#E2E4D9] text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        .email-html-body img { max-width: 100%; height: auto; }
        .email-html-body table { max-width: 100%; }
      `}</style>
    </div>
  );
}
