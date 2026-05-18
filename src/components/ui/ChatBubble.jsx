import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../app/AuthContext'
import { sendMessage } from '../../features/chat/services/chatService'

// Paleta de colores para distinguir agentes visualmente
const AGENT_COLORS = [
  { bg: '#276c00', text: '#ffffff' }, // primary
  { bg: '#655880', text: '#ffffff' }, // secondary
  { bg: '#656100', text: '#ffffff' }, // tertiary
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

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de SRM Compras. ¿En qué puedo ayudarte hoy?',
  agent: { name: 'SRM', id: 'default' },
}

export default function ChatBubble() {
  const { token, user } = useAuth()
  const location = useLocation()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll al final cuando llegue un mensaje nuevo
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  // Foco en el input al abrir
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

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
        { role: 'assistant', content: '⚠️ No se pudo conectar con el agente. Intenta más tarde.', agent: { name: 'SRM', id: 'default' } },
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

  return (
    <>
      {/* Panel de chat */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden"
          style={{ height: '480px', background: 'var(--color-surface-container-lowest)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">Asistente SRM</p>
              <p className="text-xs opacity-75">Sistema multiagente</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Cerrar chat"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar del agente (solo mensajes de agente) */}
                {msg.role === 'assistant' && msg.agent && (
                  <AgentAvatar agent={msg.agent} />
                )}

                <div className="flex flex-col gap-0.5 max-w-[78%]">
                  {/* Nombre del agente encima del burbuja */}
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
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
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
            className="flex items-end gap-2 px-3 py-3 border-t"
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
              placeholder="Escribe un mensaje…"
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

      {/* Botón burbuja flotante */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 hover:shadow-xl"
        style={{
          background: open ? 'var(--color-secondary)' : 'var(--color-primary)',
          color: open ? 'var(--color-on-secondary)' : 'var(--color-on-primary)',
        }}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        <span className="material-symbols-outlined text-2xl">
          {open ? 'close' : 'chat'}
        </span>
      </button>
    </>
  )
}
