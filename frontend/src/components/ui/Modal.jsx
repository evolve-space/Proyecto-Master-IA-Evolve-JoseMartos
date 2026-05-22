import { createPortal } from 'react-dom'

export default function Modal({ title, onClose, children, size = 'md' }) {
  const maxW = { sm: '28rem', md: '42rem', lg: '56rem' }
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'white', borderRadius: '1rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: maxW[size], maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E4D9] flex-shrink-0">
          <h3 className="font-semibold text-lg text-on-surface">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}
