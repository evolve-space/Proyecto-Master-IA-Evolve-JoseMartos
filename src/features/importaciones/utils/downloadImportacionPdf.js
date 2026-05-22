/**
 * Descarga un Blob PDF de importación en el navegador.
 */
export function downloadImportacionPdf(blob, importacionId) {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("El PDF generado esta vacio.");
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `importacion-${importacionId || "pedido"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
