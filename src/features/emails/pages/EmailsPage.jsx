import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Modal from "../../../components/ui/Modal";
import AttachmentPreviewModal from "../components/AttachmentPreviewModal";
import CategoriesModal from "../components/CategoriesModal";
import EmailAttachmentsPanel from "../components/EmailAttachmentsPanel";
import EmailComposeModal from "../components/EmailComposeModal";
import EmailHtmlBody from "../components/EmailHtmlBody";
import { bodyHasEmbeddedImages, filesToOutgoingAttachments } from "../utils/attachmentUtils";
import { addExcludedMessageId, filterExcludedEmails } from "../utils/excludedEmailsStorage";
import { emailCategoriasService } from "../services/emailCategoriasService";
import { emailsService } from "../services/emailsService";
import { outlookOAuthService } from "../services/outlookOAuthService";

const EMPTY_COMPOSE = { to: "", cc: "", subject: "", body: "", files: [] };
const AUTO_SYNC_MS = 60_000;
const AUTO_SYNC_TOP = 30;

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

function EmailBody({ email, attachments, fetchBlob }) {
  const body = email?.body?.trim();
  if (!body) {
    return (
      <p className="text-sm text-slate-400 italic py-8 text-center">
        Sin contenido. Pulsa «Actualizar desde Outlook» para cargar el mensaje completo.
      </p>
    );
  }
  if (email.bodyIsHtml) {
    return <EmailHtmlBody html={body} attachments={attachments} fetchBlob={fetchBlob} />;
  }
  return <pre className="whitespace-pre-wrap font-sans text-base text-slate-700 leading-relaxed">{body}</pre>;
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
  const [attachmentError, setAttachmentError] = useState(null);
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
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [newMailBanner, setNewMailBanner] = useState(null);
  const syncInFlightRef = useRef(false);
  const outlookConnectedRef = useRef(false);

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
      const list = filterExcludedEmails(await emailsService.getAll());
      setEmails(list);
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
    outlookConnectedRef.current = outlook.connected;
  }, [outlook.connected]);

  useEffect(() => {
    loadList();
    loadOutlookStatus();
    loadCategorias();
  }, [loadList, loadOutlookStatus, loadCategorias]);

  useEffect(() => {
    if (!newMailBanner) return undefined;
    const t = setTimeout(() => setNewMailBanner(null), 8000);
    return () => clearTimeout(t);
  }, [newMailBanner]);

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
      setAttachmentError(null);
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
        setAttachmentError(e.message);
      } finally {
        setAttachmentsLoading(false);
      }
    },
    [applyEmailUpdate],
  );

  const syncInboxFromOutlook = useCallback(
    async ({ silent = true, full = false } = {}) => {
      if (!outlookConnectedRef.current || syncInFlightRef.current) return null;

      syncInFlightRef.current = true;
      if (silent) setAutoSyncing(true);
      else setSyncing(true);

      try {
        const result = await emailsService.syncFromGraph({
          all: false,
          top: full ? 100 : AUTO_SYNC_TOP,
          includeAttachments: full,
        });
        if (!silent) setSyncStats(result ?? null);

        const imported = result?.imported ?? 0;
        if (imported > 0) {
          setNewMailBanner(
            imported === 1 ? "1 correo nuevo recibido" : `${imported} correos nuevos recibidos`,
          );
        }

        await loadList(true);
        setError(null);
        return result;
      } catch (e) {
        if (!silent) setError(e.message);
        return null;
      } finally {
        syncInFlightRef.current = false;
        if (silent) setAutoSyncing(false);
        else setSyncing(false);
      }
    },
    [loadList],
  );

  useEffect(() => {
    if (outlook.loading || !outlook.connected) return undefined;

    syncInboxFromOutlook({ silent: true });

    const interval = setInterval(() => {
      syncInboxFromOutlook({ silent: true });
    }, AUTO_SYNC_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        syncInboxFromOutlook({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [outlook.connected, outlook.loading, syncInboxFromOutlook]);

  const openEmail = useCallback(
    async (email) => {
      setSelectedId(email.id);
      setMobileShowDetail(true);
      setDetail(null);
      setDetailError(null);
      setAttachmentError(null);
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

        const needsAttachments =
          full.hasAttachments ||
          bodyHasEmbeddedImages(full.body) ||
          (full.attachments?.length ?? 0) > 0;
        if (needsAttachments) {
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
    setError(null);
    await syncInboxFromOutlook({ silent: false, full: true });
    if (selectedId && detail) {
      try {
        const full = await emailsService.getOne(selectedId, { refresh: true });
        setDetail(full);
        applyEmailUpdate(full);
        if (
          full.hasAttachments ||
          bodyHasEmbeddedImages(full.body) ||
          (full.attachments?.length ?? 0) > 0
        ) {
          setAttachmentError(null);
          await loadAttachmentsForEmail(full.id);
        }
      } catch (e) {
        setDetailError(e.message);
      }
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
      if (deleteTarget.messageId) {
        addExcludedMessageId(deleteTarget.messageId);
      }
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
    if (!detail?.id || !(att?.id ?? att?.attachmentId)) return;
    try {
      await emailsService.downloadAttachment(detail.id, att, att.name ?? "adjunto");
    } catch (e) {
      alert(`No se pudo descargar el adjunto.\n\n${e.message}`);
      throw e;
    }
  };

  const fetchAttachmentBlob = useCallback(
    (att) => {
      if (!detail?.id || !(att?.id ?? att?.attachmentId)) {
        return Promise.reject(new Error("Selecciona un correo con adjuntos."));
      }
      return emailsService.fetchAttachmentBlob(detail.id, att);
    },
    [detail?.id],
  );

  const handlePreviewAttachment = async (att) => {
    if (!detail?.id || !(att?.id ?? att?.attachmentId)) return;
    try {
      const blob = await fetchAttachmentBlob(att);
      const url = window.URL.createObjectURL(blob);
      setAttachmentPreview({ url, blob, att, name: att.name ?? "Vista previa" });
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

  const statusChips = [
    { key: "pending", label: "Pend.", icon: "mark_email_unread", color: "text-amber-700 bg-amber-50 border-amber-200" },
    { key: "read", label: "Leídos", icon: "drafts", color: "text-sky-700 bg-sky-50 border-sky-200" },
    { key: "replied", label: "Resp.", icon: "reply", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { key: "closed", label: "Cerr.", icon: "inventory_2", color: "text-slate-600 bg-slate-50 border-slate-200" },
  ];

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex flex-col flex-1 min-h-0 h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)]">
      {!outlook.loading && !outlook.connected && (
        <div className="mx-3 mt-2 shrink-0 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <span className="material-symbols-outlined text-sky-600 text-2xl shrink-0">link</span>
            <p className="text-xs text-sky-900">
              <span className="font-semibold">Conecta Outlook</span> para sincronizar la bandeja.
            </p>
          </div>
          <button
            type="button"
            onClick={handleConnectOutlook}
            disabled={connectingOutlook}
            className="shrink-0 flex items-center gap-1.5 bg-sky-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            {connectingOutlook ? "Redirigiendo…" : "Conectar Outlook"}
          </button>
        </div>
      )}

      {newMailBanner && (
        <div className="mx-3 mt-2 shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg shrink-0">mark_email_unread</span>
          <span>{newMailBanner}</span>
        </div>
      )}

      {error && (
        <div className="mx-3 mt-2 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 flex items-start gap-2">
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Barra compacta */}
      <div className="shrink-0 px-3 pt-2 pb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-[#E2E4D9]/80 bg-[#FCFDF7]">
        <span className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-700 tabular-nums">{stats.total}</span>
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {statusChips.map(({ key, label, icon, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              title={statusLabel[key]}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs sm:text-sm font-medium transition-all ${
                statusFilter === key ? "ring-1 ring-primary/40 border-primary/50" : color
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{icon}</span>
              <span className="tabular-nums">{stats[key]}</span>
              <span className="hidden sm:inline opacity-80">{label}</span>
            </button>
          ))}
        </div>

        {outlook.connected && (
          <span className="hidden lg:inline text-[10px] text-slate-400 truncate max-w-[180px]" title={outlook.email}>
            {outlook.email}
          </span>
        )}
        {autoSyncing && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-primary">
            <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
            Sync
          </span>
        )}

        <div className="flex-1 min-w-[8px]" />

        {syncStats && (
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            +{syncStats.imported ?? 0} nuevos
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCategoriesModal(true)}
            title="Categorías"
            className="p-1.5 rounded-lg border border-[#E2E4D9] bg-white text-slate-600 hover:border-primary/40"
          >
            <span className="material-symbols-outlined text-[18px]">label</span>
          </button>
          <button
            type="button"
            onClick={openCompose}
            disabled={!outlook.connected}
            title={!outlook.connected ? "Conecta Outlook primero" : "Nuevo correo"}
            className="p-1.5 rounded-lg border border-[#E2E4D9] bg-white text-slate-600 hover:border-primary/40 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing || !outlook.connected}
            title={!outlook.connected ? "Conecta Outlook primero" : "Sincronizar"}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${syncing ? "animate-spin" : ""}`}>sync</span>
            <span className="hidden sm:inline">{syncing ? "…" : "Sync"}</span>
          </button>
          {outlook.connected && (
            <button
              type="button"
              onClick={handleDisconnectOutlook}
              title="Cambiar cuenta Outlook"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Búsqueda + filtros en una línea */}
      <div className="shrink-0 px-3 py-1.5 flex flex-wrap items-center gap-1.5 border-b border-[#E2E4D9]/60 bg-white">
        <div className="relative flex-1 min-w-[140px]">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="w-full pl-7 pr-2 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-slate-50/80 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 max-w-[120px]"
        >
          <option value="all">Estado</option>
          <option value="pending">Pendiente</option>
          <option value="read">Leído</option>
          <option value="replied">Respondido</option>
          <option value="closed">Cerrado</option>
        </select>
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="px-2 py-2 text-sm border border-[#E2E4D9] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 max-w-[130px]"
        >
          <option value="all">Categoría</option>
          <option value="none">Sin categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Panel principal */}
      <div className="flex-1 min-h-0 mx-3 mb-3 flex gap-0 rounded-xl border border-[#E2E4D9] bg-white shadow-sm overflow-hidden">
        {/* Lista */}
        <aside
          className={`w-full md:w-[min(36vw,340px)] lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col border-r border-[#E2E4D9] bg-slate-50/40 ${
            mobileShowDetail ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-3 py-1.5 border-b border-[#E2E4D9] bg-white/80 text-xs font-medium text-slate-500">
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
                    className={`w-full text-left px-2.5 py-2 transition-colors flex gap-2 ${
                      active ? "bg-primary/8 border-l-2 border-l-primary" : "hover:bg-white border-l-2 border-l-transparent"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
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
                        <span className="text-xs text-slate-400 shrink-0">{formatDate(email.receivedAt, { short: true })}</span>
                      </div>
                      <p className={`text-sm truncate ${unread ? "font-semibold text-on-surface" : "text-slate-600"}`}>
                        {email.subject || "(Sin asunto)"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[email.status] ?? statusStyles.closed}`}>
                          {statusLabel[email.status] ?? email.status}
                        </span>
                        {email.categoriaNombre && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full text-white truncate max-w-[100px]"
                            style={{ backgroundColor: email.categoriaColor || "#64748b" }}
                          >
                            {email.categoriaNombre}
                          </span>
                        )}
                        {email.proveedorNombre && (
                          <span className="text-xs text-primary truncate max-w-[140px]">{email.proveedorNombre}</span>
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-4">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">mail</span>
              <p className="text-xs text-center max-w-[200px]">Selecciona un correo</p>
            </div>
          ) : (
            <>
              <header className="shrink-0 border-b border-[#E2E4D9] px-3 sm:px-4 py-2">
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
                    <h3 className="text-base font-semibold text-on-surface leading-snug line-clamp-2">
                      {detail?.subject || selectedListItem?.subject || "Cargando…"}
                    </h3>
                    <p className="text-xs text-slate-500">{formatDate(detail?.receivedAt ?? selectedListItem?.receivedAt)}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={openReply}
                      disabled={!outlook.connected || detailLoading}
                      title="Responder"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">reply</span>
                    </button>
                    <button
                      type="button"
                      onClick={refreshDetail}
                      disabled={detailLoading}
                      title="Actualizar desde Outlook"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary disabled:opacity-40"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${detailLoading ? "animate-spin" : ""}`}>
                        refresh
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(detail ?? selectedListItem)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {["read", "replied", "closed", "pending"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={saving || !detail}
                      onClick={() => handleMarkStatus(st)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors disabled:opacity-40 ${
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

              <div className="shrink-0 px-3 sm:px-4 py-2 bg-slate-50/60 border-b border-[#E2E4D9] text-sm space-y-1">
                <div className="flex gap-2 min-w-0">
                  <span className="text-slate-400 w-10 shrink-0">De</span>
                  <span className="text-slate-700 break-all truncate">{detail?.sender ?? selectedListItem?.sender}</span>
                </div>
                <div className="flex gap-2 min-w-0">
                  <span className="text-slate-400 w-10 shrink-0">Para</span>
                  <span className="text-slate-600 break-all truncate">{detail?.recipients || "—"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {detail?.proveedor && (
                  <div className="flex gap-1 items-center min-w-0">
                    <span className="text-slate-400 shrink-0">Prov.</span>
                    <Link
                      to="/proveedores"
                      className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium truncate"
                    >
                      <span className="material-symbols-outlined text-[14px]">factory</span>
                      {detail.proveedorNombre ?? `#${detail.proveedor}`}
                    </Link>
                  </div>
                )}
                <div className="flex gap-1 items-center flex-1 min-w-[140px]">
                  <span className="text-slate-400 shrink-0">Cat.</span>
                  <select
                    value={detail?.categoriaId ?? ""}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                    disabled={saving || !detail}
                    className="flex-1 min-w-0 text-sm border border-[#E2E4D9] rounded-md px-2 py-1.5 bg-white disabled:opacity-50"
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
                      className="w-3 h-3 rounded-full shrink-0 border border-slate-200"
                      style={{ backgroundColor: detail.categoriaColor }}
                    />
                  )}
                </div>
                </div>
              </div>

              <EmailAttachmentsPanel
                hasAttachments={
                  Boolean(detail?.hasAttachments ?? selectedListItem?.hasAttachments) ||
                  (detail?.attachments?.length ?? 0) > 0 ||
                  bodyHasEmbeddedImages(detail?.body ?? selectedListItem?.body)
                }
                attachments={detail?.attachments ?? []}
                loading={attachmentsLoading}
                onSync={() => detail?.id && loadAttachmentsForEmail(detail.id)}
                onDownload={handleDownloadAttachment}
                onPreview={handlePreviewAttachment}
              />

              <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3">
                {detailLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <span className="material-symbols-outlined text-[16px] animate-spin text-primary">progress_activity</span>
                    Cargando…
                  </div>
                )}
                {detailError && (
                  <div className="mb-2 rounded-md bg-amber-50 border border-amber-100 px-2 py-1.5 text-xs text-amber-800">
                    No se pudo refrescar el mensaje: {detailError}. Mostrando copia local.
                  </div>
                )}
                {attachmentError && (
                  <div className="mb-2 rounded-md bg-amber-50 border border-amber-100 px-2 py-1.5 text-xs text-amber-800">
                    No se pudieron cargar los adjuntos: {attachmentError}. Pulsa «Actualizar lista» en adjuntos.
                  </div>
                )}
                <EmailBody
                  email={detail ?? selectedListItem}
                  attachments={detail?.attachments ?? []}
                  fetchBlob={detail?.id ? fetchAttachmentBlob : undefined}
                />
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
        <AttachmentPreviewModal
          preview={attachmentPreview}
          onClose={closeAttachmentPreview}
          onDownload={handleDownloadAttachment}
        />
      )}

      {deleteTarget && (
        <Modal title="Eliminar correo" onClose={() => setDeleteTarget(null)} size="sm">
          <p className="text-sm text-slate-600 mb-6">
            ¿Eliminar <strong>{deleteTarget.subject}</strong> de la aplicación? No se volverá a importar desde Outlook (el mensaje puede seguir en tu bandeja de Hotmail/Outlook).
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
