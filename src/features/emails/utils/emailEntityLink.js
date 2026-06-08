/** @param {object|null} record Email or calendar event with entity FK fields */
export function getEntityLink(record) {
  if (!record) return null
  if (record.importacionId) {
    return { to: `/importaciones/${record.importacionId}`, label: `Importación #${record.importacionId}`, sub: record.importacionProducto }
  }
  if (record.muestraId) {
    return { to: `/muestras/${record.muestraId}`, label: `Muestra #${record.muestraId}`, sub: record.muestraProducto }
  }
  if (record.ofertaId) {
    return { to: `/ofertas/${record.ofertaId}`, label: `Oferta #${record.ofertaId}`, sub: record.ofertaProducto }
  }
  if (record.contratoId) {
    return { to: `/contratos/${record.contratoId}`, label: `Contrato #${record.contratoId}`, sub: record.contratoNumero }
  }
  const provId = record.proveedor ?? record.proveedorId
  if (provId) {
    return { to: `/proveedores/${provId}`, label: record.proveedorNombre || `Proveedor #${provId}`, sub: null }
  }
  return null
}

export const getEmailEntityLink = getEntityLink

export const urgencyLabel = { baja: 'Baja', normal: 'Normal', alta: 'Alta' }

export const urgencyStyle = {
  baja: 'bg-slate-100 text-slate-600 border-slate-200',
  normal: 'bg-sky-50 text-sky-700 border-sky-200',
  alta: 'bg-red-100 text-red-700 border-red-200',
}
