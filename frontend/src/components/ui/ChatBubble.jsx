import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../app/AuthContext'
import { sendMessage } from '../../features/chat/services/chatService'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─── Persistencia ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'srm_chat_history'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de SRM Compras. ¿En qué puedo ayudarte hoy?',
  agent: { name: 'SRM', id: 'default' },
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignorar */ }
  return [INITIAL_MESSAGE]
}

function saveMessages(msgs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)) } catch { /* ignorar */ }
}

// ─── Paleta de colores por agente ────────────────────────────────────────────
const AGENT_COLORS = [
  { bg: '#276c00', text: '#ffffff' },
  { bg: '#655880', text: '#ffffff' },
  { bg: '#656100', text: '#ffffff' },
  { bg: '#006874', text: '#ffffff' },
  { bg: '#8b4513', text: '#ffffff' },
  { bg: '#1a237e', text: '#ffffff' },
]

const agentColorCache = {}

function getAgentColor(agentId) {
  if (!agentColorCache[agentId]) {
    const idx = Object.keys(agentColorCache).length % AGENT_COLORS.length
    agentColorCache[agentId] = AGENT_COLORS[idx]
  }
  return agentColorCache[agentId]
}

function AgentAvatar({ agent }) {
  const color = getAgentColor(agent.id)
  return (
    <div
      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold select-none"
      style={{ background: color.bg, color: color.text }}
      title={agent.name}
    >
      {agent.name.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── Componente de markdown para burbujas de agente ──────────────────────────
function MdBubble({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Párrafos sin margen extra dentro de la burbuja
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        // Negrita
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        // Cursiva
        em: ({ children }) => <em className="italic">{children}</em>,
        // Código inline
        code: ({ inline, children }) =>
          inline ? (
            <code className="px-1 py-0.5 rounded text-xs font-mono"
              style={{ background: 'rgba(0,0,0,0.1)' }}>
              {children}
            </code>
          ) : (
            <pre className="my-1 p-2 rounded text-xs font-mono overflow-x-auto"
              style={{ background: 'rgba(0,0,0,0.1)' }}>
              <code>{children}</code>
            </pre>
          ),
        // Listas con bullets
        ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-snug">{children}</li>,
        // Títulos
        h1: ({ children }) => <h1 className="font-bold text-base mt-1 mb-0.5">{children}</h1>,
        h2: ({ children }) => <h2 className="font-bold text-sm mt-1 mb-0.5">{children}</h2>,
        h3: ({ children }) => <h3 className="font-semibold text-sm mt-1 mb-0.5">{children}</h3>,
        // Tablas GFM
        table: ({ children }) => (
          <div className="overflow-x-auto my-1">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ background: 'rgba(0,0,0,0.12)' }}>{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1 text-left font-semibold border"
            style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1 border" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
            {children}
          </td>
        ),
        // Separador
        hr: () => <hr className="my-1 opacity-20" />,
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 pl-2 opacity-80 my-1"
            style={{ borderColor: 'currentColor' }}>
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ChatBubble() {
  const { token, user } = useAuth()
  const location = useLocation()

  const [open, setOpen] = useState(false)
  // Cargar historial desde localStorage al montar
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Persistir mensajes en localStorage cada vez que cambien
  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  // Cerrar el panel al cerrar/recargar la pestaña (pero conservar el historial)
  useEffect(() => {
    const handleUnload = () => setOpen(false)
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  // Scroll al final cuando llegue un mensaje nuevo
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Foco en el input al abrir
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Limpiar conversación
  const handleClear = useCallback(() => {
    setMessages([INITIAL_MESSAGE])
  }, [])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    setLoading(true)

    try {
      const context = {
        userId: user?.id ?? null,
        userRole: user?.tipo ?? 'normal',
        currentPage: location.pathname.replace('/', '') || 'dashboard',
      }
      const { reply, agent } = await sendMessage(text, nextHistory, token, context)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, agent }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ No se pudo conectar con el agente. Intenta más tarde.',
          agent: { name: 'SRM', id: 'default' },
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Número de mensajes reales (excluye el inicial)
  const msgCount = messages.length - 1

  return (
    <>
      {/* ── Panel de chat ─────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden"
          style={{ height: '520px', background: 'var(--color-surface-container-lowest)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Asistente SRM</p>
              <p className="text-xs opacity-75">Sistema multiagente</p>
            </div>

            {/* Botón limpiar conversación */}
            {msgCount > 0 && (
              <button
                onClick={handleClear}
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Limpiar conversación"
                title="Limpiar conversación"
              >
                <span className="material-symbols-outlined text-xl">delete_sweep</span>
              </button>
            )}

            {/* Botón cerrar */}
            <button
              onClick={() => setOpen(false)}
              className="opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Cerrar chat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar del agente */}
                {msg.role === 'assistant' && msg.agent && (
                  <AgentAvatar agent={msg.agent} />
                )}

                <div className="flex flex-col gap-0.5 max-w-[78%]">
                  {/* Nombre del agente */}
                  {msg.role === 'assistant' && msg.agent && (
                    <span
                      className="text-xs font-semibold px-1"
                      style={{ color: getAgentColor(msg.agent.id).bg }}
                    >
                      {msg.agent.name}
                    </span>
                  )}

                  <div
                    className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'var(--color-primary)',
                            color: 'var(--color-on-primary)',
                            borderBottomRightRadius: '4px',
                          }
                        : {
                            background: 'var(--color-surface-container-high)',
                            color: 'var(--color-on-surface)',
                            borderBottomLeftRadius: '4px',
                          }
                    }
                  >
                    {msg.role === 'assistant' ? (
                      <MdBubble content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {loading && (
              <div className="flex justify-start gap-2">
                <div
                  className="px-4 py-2 rounded-2xl text-sm"
                  style={{
                    background: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface-variant)',
                    borderBottomLeftRadius: '4px',
                  }}
                >
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-end gap-2 px-3 py-3 border-t flex-shrink-0"
            style={{
              borderColor: 'var(--color-outline-variant, #c8c8c0)',
              background: 'var(--color-surface-container-low)',
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje… (Enter para enviar)"
              disabled={loading}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none disabled:opacity-50"
              style={{
                background: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                maxHeight: '96px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
              }}
              aria-label="Enviar mensaje"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Botón burbuja flotante ─────────────────────────────────── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 hover:shadow-xl"
        style={{
          background: open ? 'var(--color-secondary)' : 'var(--color-primary)',
          color: open ? 'var(--color-on-secondary)' : 'var(--color-on-primary)',
        }}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        {/* Badge con número de mensajes cuando está cerrado */}
        {!open && msgCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ background: 'var(--color-error)', color: '#fff' }}>
            {msgCount > 99 ? '99+' : msgCount}
          </span>
        )}
        <span className="material-symbols-outlined text-2xl">
          {open ? 'close' : 'chat'}
        </span>
      </button>
    </>
  )
}

