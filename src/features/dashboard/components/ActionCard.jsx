export default function ActionCard() {
  return (
    <div className="bg-primary p-lg rounded-xl text-white relative overflow-hidden group">
      {/* Blob decorativo */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />

      <h4 className="font-h3 text-h3 mb-2">Nueva Oferta</h4>
      <p className="text-body-sm font-body-sm mb-6 text-white/80">
        Registra una nueva oferta de proveedor o solicitud de precio.
      </p>
      <button className="w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-[#FCFDF7] active:scale-95 transition-all">
        Crear Oferta
      </button>
    </div>
  )
}
