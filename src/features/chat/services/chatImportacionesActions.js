import { importacionesService } from "../../importaciones/services/importacionesService";
import { downloadImportacionPdf } from "../../importaciones/utils/downloadImportacionPdf";

const NOA_AGENT = { name: "Noa", id: "noa" };

const STOP_WORDS = new Set([
  "noa",
  "importacion",
  "importaciones",
  "importación",
  "pdf",
  "genera",
  "generar",
  "descarga",
  "descargar",
  "de",
  "del",
  "la",
  "el",
  "ultima",
  "última",
  "ultimo",
  "último",
]);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractIdFromText(text) {
  if (!text) return null;
  const patterns = [
    /\bID:\s*(\d+)/i,
    /importaci[oó]n\s*#?\s*(\d+)/i,
    /\bimp\.?\s*#?\s*(\d+)/i,
    /\bid\s+(\d+)\b/i,
    /\bn[uú]mero\s+(\d+)\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return Number(m[1]);
  }
  return null;
}

function extractSearchTerms(message) {
  let text = normalize(message);
  text = text.replace(/\b(genera|generar|descarga|descargar)\s+(el\s+)?pdf\b/g, " ");
  text = text.replace(/\bimportaci[oó]n(es)?\b/g, " ");
  text = text.replace(/\b(de|del|numero|n[uú]mero|#|la|el)\b/g, " ");

  const id = extractIdFromText(message);
  const terms = text
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return { id, terms };
}

function extractContextFromHistory(history = []) {
  let id = null;
  const termSet = new Set();

  for (let i = history.length - 1; i >= 0 && i >= history.length - 8; i -= 1) {
    const msg = history[i];
    if (!msg?.content) continue;
    if (!id) id = extractIdFromText(msg.content);
    const { terms } = extractSearchTerms(msg.content);
    for (const t of terms) termSet.add(t);
  }

  return { id, terms: [...termSet] };
}

/** Solo si pide explícitamente generar o descargar un PDF. */
export function wantsImportacionPdf(message) {
  const t = normalize(message);
  if (!/\bpdf\b/.test(t)) return false;
  return (
    /\b(genera|generar)\b.*\bpdf\b/.test(t) ||
    /\bpdf\b.*\b(genera|generar)\b/.test(t) ||
    /\b(descarga|descargar)\b.*\bpdf\b/.test(t) ||
    /\bpdf\b.*\b(descarga|descargar)\b/.test(t)
  );
}

function parseImportacionIntent(message, history = []) {
  if (!wantsImportacionPdf(message)) return null;

  const t = normalize(message);
  const wantsUltima = /\b(ultima|última|ultimo|último|reciente)\b/.test(t);

  let { id, terms } = extractSearchTerms(message);
  const fromHistory = extractContextFromHistory(history);
  if (id == null) id = fromHistory.id;
  if (!terms.length) terms = fromHistory.terms;

  return { id, terms, wantsUltima };
}

function scoreImportacion(imp, terms) {
  const producto = normalize(imp.producto || "");
  const proveedor = normalize(imp.proveedorNombre || "");
  let score = 0;
  for (const term of terms) {
    if (producto.includes(term)) score += 12;
    if (proveedor.includes(term)) score += 10;
  }
  const joined = terms.join(" ");
  if (joined.length > 2) {
    if (producto.includes(joined)) score += 18;
    if (proveedor.includes(joined)) score += 14;
  }
  return score;
}

function pickLatest(list) {
  return [...list].sort((a, b) =>
    (b.fechaDuaAlbaran || "").localeCompare(a.fechaDuaAlbaran || ""),
  )[0];
}

function rankImportaciones(importaciones, intent) {
  if (intent.id != null) {
    const exact = importaciones.filter((i) => Number(i.id) === Number(intent.id));
    if (exact.length) return exact;
  }
  if (!intent.terms.length) return [];

  const pool = importaciones
    .map((imp) => ({ imp, score: scoreImportacion(imp, intent.terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.imp);

  if (intent.wantsUltima && pool.length) return [pickLatest(pool)];
  return pool;
}

function fmtDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function formatCandidates(list) {
  return list
    .slice(0, 5)
    .map(
      (i) =>
        `· **#${i.id}** — ${i.producto} (${i.proveedorNombre}, ${fmtDate(i.fechaDuaAlbaran)})`,
    )
    .join("\n");
}

async function resolveImportacion(intent) {
  const list = await importacionesService.getAll();
  const ranked = rankImportaciones(list, intent);
  if (ranked.length === 1) return { imp: ranked[0], candidates: ranked };
  if (intent.id != null) {
    try {
      const imp = await importacionesService.getOne(intent.id);
      return { imp, candidates: [imp] };
    } catch {
      /* seguir */
    }
  }
  if (intent.wantsUltima && ranked.length > 1) {
    return { imp: pickLatest(ranked), candidates: ranked };
  }
  return { imp: null, candidates: ranked };
}

async function runPdfForImportacion(imp) {
  try {
    const result = await importacionesService.generatePdf(imp);
    if (result instanceof Blob) {
      downloadImportacionPdf(result, imp.id);
      return {
        handled: true,
        agent: NOA_AGENT,
        reply: `Listo: he **generado y descargado el PDF** de la importación **#${imp.id}** (${imp.producto}, ${imp.proveedorNombre}).`,
      };
    }
    if (result?.message) {
      return { handled: true, agent: NOA_AGENT, reply: result.message };
    }
    throw new Error("El servicio de PDF no devolvio un archivo.");
  } catch (e) {
    return {
      handled: true,
      agent: NOA_AGENT,
      reply: `No pude generar el PDF de la importación **#${imp.id}**: ${e?.message || "error desconocido"}.`,
    };
  }
}

/** Solo intercepta mensajes con «generar/descargar pdf». El resto va al chat normal. */
export async function handleImportacionesChatAction(message, history = []) {
  const intent = parseImportacionIntent(message, history);
  if (!intent) return { handled: false };

  try {
    const { imp, candidates } = await resolveImportacion(intent);

    if (!imp) {
      if (intent.id != null) {
        try {
          return runPdfForImportacion(await importacionesService.getOne(intent.id));
        } catch {
          /* seguir */
        }
      }
      if (candidates.length > 1) {
        return {
          handled: true,
          agent: NOA_AGENT,
          reply: `Varias importaciones coinciden. Indica el ID:\n\n${formatCandidates(candidates)}\n\nEj.: *«genera el pdf de la importación #${candidates[0].id}»*`,
        };
      }
      return {
        handled: true,
        agent: NOA_AGENT,
        reply:
          'Para generar el PDF usa: *«genera el pdf de la importación #4»* o *«generar pdf de Quimtec»*.',
      };
    }

    return runPdfForImportacion(imp);
  } catch (e) {
    return {
      handled: true,
      agent: NOA_AGENT,
      reply: `No pude consultar importaciones: ${e?.message || "error desconocido"}.`,
    };
  }
}

export async function executeChatActions(actions) {
  if (!Array.isArray(actions) || actions.length === 0) return null;
  for (const action of actions) {
    if (action?.type === "generate_importacion_pdf") {
      const id = action.importacionId ?? action.id;
      if (id == null) continue;
      const imp = await importacionesService.getOne(id);
      return runPdfForImportacion(imp);
    }
  }
  return null;
}
