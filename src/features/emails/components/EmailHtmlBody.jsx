import { useEffect, useState } from "react";
import { bodyHasEmbeddedImages, buildCidAttachmentMap, normalizeCid } from "../utils/attachmentUtils";

const CID_SRC_RE = /\bsrc\s*=\s*["']?cid:([^"'\s>]+)["']?/gi;

export default function EmailHtmlBody({ html, attachments = [], fetchBlob }) {
  const [resolvedHtml, setResolvedHtml] = useState(html ?? "");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const source = html ?? "";
    if (!source.trim()) {
      setResolvedHtml("");
      setResolving(false);
      return undefined;
    }

    if (!bodyHasEmbeddedImages(source) || !fetchBlob || attachments.length === 0) {
      setResolvedHtml(source);
      setResolving(false);
      return undefined;
    }

    let cancelled = false;
    const objectUrls = [];
    setResolving(true);

    (async () => {
      const cidMap = buildCidAttachmentMap(attachments);
      const urlByCid = new Map();

      const needed = new Set();
      for (const match of source.matchAll(CID_SRC_RE)) {
        needed.add(normalizeCid(match[1]));
      }

      await Promise.all(
        [...needed].map(async (cidKey) => {
          const att = cidMap.get(cidKey);
          if (!att) return;
          try {
            const blob = await fetchBlob(att);
            const url = window.URL.createObjectURL(blob);
            objectUrls.push(url);
            urlByCid.set(cidKey, url);
          } catch {
            // Mantener placeholder roto si falla la descarga
          }
        }),
      );

      if (cancelled) return;

      const next = source.replace(CID_SRC_RE, (full, cidRaw) => {
        const url = urlByCid.get(normalizeCid(cidRaw));
        return url ? `src="${url}"` : full;
      });

      setResolvedHtml(next);
      setResolving(false);
    })();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => window.URL.revokeObjectURL(url));
    };
  }, [html, attachments, fetchBlob]);

  if (!html?.trim()) {
    return (
      <p className="text-sm text-slate-400 italic py-8 text-center">
        Sin contenido. Pulsa «Actualizar desde Outlook» para cargar el mensaje completo.
      </p>
    );
  }

  return (
    <>
      {resolving && (
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          Cargando imágenes del mensaje…
        </p>
      )}
      <div
        className="email-html-body prose prose-base max-w-none prose-slate prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: resolvedHtml }}
      />
    </>
  );
}
