/**
 * PDF A4 sin dependencias (no requiere n8n).
 */

function fmtDate(d) {
  if (!d) return "-";
  const [y, m, day] = String(d).split("-");
  return day && m && y ? `${day}/${m}/${y}` : String(d);
}

function fmtNum(n, opts = {}) {
  const v = parseFloat(n);
  if (Number.isNaN(v)) return "-";
  return v.toLocaleString("es-ES", opts);
}

function pdfEscape(text) {
  return String(text ?? "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function buildPdfBytes(lines) {
  const textOps = ["BT", "/F1 11 Tf", "50 800 Td", `(${pdfEscape(lines[0])}) Tj`];
  for (let i = 1; i < lines.length; i += 1) {
    textOps.push("0 -15 Td", `(${pdfEscape(lines[i])}) Tj`);
  }
  textOps.push("ET");
  const stream = `${textOps.join("\n")}\n`;
  const streamByteLen = new TextEncoder().encode(stream).length;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  const add = (n, body) => {
    offsets[n] = pdf.length;
    pdf += `${n} 0 obj\n${body}\nendobj\n`;
  };

  add(1, "<< /Type /Catalog /Pages 2 0 R >>");
  add(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  add(
    3,
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
  );
  add(4, `<< /Length ${streamByteLen} >>\nstream\n${stream}endstream`);
  add(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const xrefPos = pdf.length;
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

/**
 * @param {Record<string, unknown>} item
 * @returns {Blob}
 */
export function buildImportacionPdfBlob(item) {
  const lines = [
    "SRM Compras - Ficha de importacion",
    `ID: ${item.id ?? "-"}`,
    `Proveedor: ${item.proveedorNombre ?? "-"}`,
    `Producto: ${item.producto ?? "-"}`,
    `Fecha DUA/Albaran: ${fmtDate(item.fechaDuaAlbaran)}`,
    `Fecha factura: ${fmtDate(item.fechaFactura)}`,
    `Cantidad (kg): ${fmtNum(item.cantidad)}`,
    `Importe EUR: ${fmtNum(item.importeEur, { style: "currency", currency: "EUR" })}`,
    `Importe USD: ${fmtNum(item.importeUsd, { style: "currency", currency: "USD" })}`,
    `Tipo de cambio: ${item.tipoCambio ?? "-"}`,
    `Aranceles: ${item.aranceles ?? "-"}`,
    `Coste despacho: ${item.costeDespacho ?? "-"}`,
    `Gasto imp./kg: ${item.gastoImpKg ?? "-"}`,
    `Coste/kg: ${fmtNum(item.costeKg, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`,
    `Forwarder: ${item.forwarderer ?? "-"}`,
    `Incoterm: ${item.incoterm ?? "-"}`,
    `Documentacion: ${item.documentacion ? "Si" : "No"}`,
    `Observaciones: ${item.observaciones ?? "-"}`,
    `Generado: ${new Date().toLocaleString("es-ES")}`,
  ];

  const bytes = buildPdfBytes(lines);
  return new Blob([bytes], { type: "application/pdf" });
}
