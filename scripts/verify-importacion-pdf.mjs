import { writeFileSync } from "node:fs";
import { buildImportacionPdfBlob } from "../src/features/importaciones/utils/importacionPdf.js";

const sample = {
  id: 42,
  proveedorNombre: "Quimtec S.A.",
  producto: "Acido citrico FOOD",
  fechaDuaAlbaran: "2026-05-15",
  fechaFactura: "2026-05-10",
  cantidad: "25000",
  importeEur: "29500",
  importeUsd: "32000",
  tipoCambio: "1.085",
  aranceles: "5",
  costeDespacho: "1200",
  gastoImpKg: "0.12",
  costeKg: "1.2456",
  forwarderer: "DHL",
  incoterm: "CIF",
  documentacion: true,
  observaciones: "Prueba PDF local",
};

const blob = buildImportacionPdfBlob(sample);
const buf = Buffer.from(await blob.arrayBuffer());

if (!buf.slice(0, 4).equals(Buffer.from("%PDF"))) {
  console.error("FAIL: no empieza con %PDF");
  process.exit(1);
}
if (buf.length < 500) {
  console.error("FAIL: PDF demasiado pequeno", buf.length);
  process.exit(1);
}
if (!buf.slice(-6).toString().includes("%%EOF")) {
  console.error("FAIL: falta %%EOF");
  process.exit(1);
}

writeFileSync("tmp-importacion-test.pdf", buf);
console.log("OK: PDF valido,", buf.length, "bytes -> tmp-importacion-test.pdf");
