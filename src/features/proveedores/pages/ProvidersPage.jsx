const proveedores = [
  { id: 1, nombre: 'SunFlower Industries', cifNif: 'B12345678', telefono: '+34 93 123 45 67', web: 'www.sunflower.com',   actividad: 'Aceites vegetales',   dirFact: 'Calle Mayor 10, Barcelona',      dirLog: 'Pol. Industrial Sur, BCN', tipo: 'Fabricante',    certificaciones: 'FOOD, BIO',  contPrincipal: 'John Smith',   formaPago: 60,  email: 'sales@sunflower.com',  movil: '+34 666 111 222', incoterm: 'CIF', observaciones: '-',              documentacion: 'Sí' },
  { id: 2, nombre: 'Palm Oil Co.',         cifNif: 'A87654321', telefono: '+60 3 1234 5678',  web: 'www.palmoil.com',    actividad: 'Aceite de palma',     dirFact: 'Jalan Bukit 5, Kuala Lumpur', dirLog: 'Port Klang, Malaysia',    tipo: 'Fabricante',    certificaciones: 'HALAL',      contPrincipal: 'Ahmad Razak',  formaPago: 30,  email: 'export@palmoil.com',   movil: '+60 12 345 678',  incoterm: 'CFR', observaciones: '-',              documentacion: 'Sí' },
  { id: 3, nombre: 'Soja Global S.L.',     cifNif: 'C11223344', telefono: '+54 11 4567 8901', web: 'www.sojaglobal.com', actividad: 'Oleaginosas',         dirFact: 'Av. Córdoba 200, Buenos Aires', dirLog: 'Puerto Buenos Aires', tipo: 'Distribuidor',  certificaciones: 'FOOD',       contPrincipal: 'María García', formaPago: 75,  email: 'ventas@sojaglobal.com',movil: '+54 9 11 5555', incoterm: 'EXW', observaciones: 'Proveedor habitual', documentacion: 'Sí' },
  { id: 4, nombre: 'BioOils S.A.',         cifNif: 'D55667788', telefono: '+33 1 23 45 67 89',web: 'www.biooils.fr',     actividad: 'Aceites ecológicos',  dirFact: 'Rue de la Paix 8, París',    dirLog: 'Port de Dunkerque',       tipo: 'Fabricante',    certificaciones: 'BIO',        contPrincipal: 'Pierre Dupont', formaPago: 60, email: 'info@biooils.fr',      movil: '+33 6 12 34 56',  incoterm: 'CIP', observaciones: '-',              documentacion: 'No' },
  { id: 5, nombre: 'KosherFats Ltd.',      cifNif: 'E99001122', telefono: '+972 3 456 7890',  web: 'www.kosherfats.il',  actividad: 'Grasas y aceites',    dirFact: 'Herzl St. 50, Tel Aviv',     dirLog: 'Port of Haifa, Israel',   tipo: 'Fabricante',    certificaciones: 'KOSHER',     contPrincipal: 'David Cohen',  formaPago: 30,  email: 'sales@kosherfats.il',  movil: '+972 50 111 222', incoterm: 'CIF', observaciones: '-',              documentacion: 'Sí' },
]

const tipoStyle = {
  'Fabricante':    'bg-primary-container/20 text-primary',
  'Distribuidor':  'bg-secondary-container text-secondary',
}

export default function ProvidersPage() {
  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Proveedores</h2>
          <p className="text-body-sm text-slate-500 mt-1">{proveedores.length} proveedores registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-base">add</span>
          Nuevo Proveedor
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E4D9] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">CIF/NIF</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Actividad</th>
                <th className="px-6 py-4">Certificaciones</th>
                <th className="px-6 py-4">Cont. Principal</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Forma Pago</th>
                <th className="px-6 py-4">Incoterm</th>
                <th className="px-6 py-4">Doc.</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4D9]">
              {proveedores.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center font-bold text-primary text-sm">{p.nombre[0]}</div>
                      <div>
                        <p className="font-label-md text-on-surface">{p.nombre}</p>
                        <p className="text-body-sm text-slate-400">{p.telefono}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body-sm font-mono text-slate-500">{p.cifNif}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${tipoStyle[p.tipo]}`}>{p.tipo}</span>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.actividad}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.certificaciones}</td>
                  <td className="px-6 py-4 text-body-sm">{p.contPrincipal}</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.email}</td>
                  <td className="px-6 py-4 text-body-sm">{p.formaPago} días</td>
                  <td className="px-6 py-4 text-body-sm text-slate-500">{p.incoterm}</td>
                  <td className="px-6 py-4 text-body-sm">{p.documentacion}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
