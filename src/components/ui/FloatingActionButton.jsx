export default function FloatingActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 hover:shadow-xl transition-all z-50"
      aria-label="Crear nuevo"
    >
      <span className="material-symbols-outlined">add</span>
    </button>
  )
}
