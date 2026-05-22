import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../app/AuthContext'
import { sendMessage } from '../../features/chat/services/chatService'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─── Agentes del sistema ─────────────────────────────────────────────────────
const PRIMARY_AGENT = {
  id: 'default',
  name: 'SRM',
  color: '#1a237e',
  tagline: 'Asistente principal',
  description:
    'Coordino el sistema multiagente: analizo tu consulta y te conecto con el especialista adecuado. Puedes escribirme directamente o elegir un agente secundario para ver en qué puede ayudarte.',
}

const SPECIALIST_AGENTS = [
  {
    id: 'carmen',
    name: 'Carmen',
    color: '#276c00',
    shortLabel: 'Proveedores',
    description:
      'Soy **Carmen**, especialista en **proveedores y contratos**.\n\nPuedo ayudarte a:\n- Buscar y filtrar proveedores (tipo, certificación, forma de pago…)\n- Ver contratos vigentes, caducados o próximos a vencer\n- Calcular cantidades pendientes y alertar caducidades\n- Crear o editar proveedores y contratos *(según tu rol)*\n\nPregúntame, por ejemplo: *«¿Qué contratos caducan este mes?»*',
  },
  {
    id: 'rafa',
    name: 'Rafa',
    color: '#655880',
    shortLabel: 'Ofertas',
    description:
      'Soy **Rafa**, especialista en **ofertas y pedidos**.\n\nPuedo ayudarte a:\n- Listar y comparar ofertas por producto, precio, moneda o incoterm\n- Comparar ofertas con el precio del contrato vigente\n- Identificar ofertas con muestra solicitada\n- Crear o editar ofertas *(según tu rol)*\n\nPregúntame, por ejemplo: *«¿Tenemos ofertas de ácido cítrico?»*',
  },
  {
    id: 'noa',
    name: 'Noa',
    color: '#006874',
    shortLabel: 'Importaciones',
    description:
      'Soy **Noa**, especialista en **importaciones y logística**.\n\nPuedo ayudarte a:\n- Consultar importaciones por proveedor, producto o fechas\n- Calcular el coste real por kg (aranceles, flete, despacho…)\n- Comparar tipos de cambio entre importaciones\n- Registrar o actualizar importaciones *(según tu rol)*\n\nPregúntame, por ejemplo: *«¿Cuánto nos costó la última importación de vainilla?»*',
  },
  {
    id: 'iris',
    name: 'Iris',
    color: '#656100',
    shortLabel: 'Muestras',
    description:
      'Soy **Iris**, especialista en **muestras y calidad**.\n\nPuedo ayudarte a:\n- Listar muestras por estado (Pendiente, Análisis, Compra)\n- Buscar por proveedor, producto, lote o certificación (BIO, HALAL…)\n- Ver el historial de muestras de un proveedor\n- Registrar muestras y actualizar su estado\n\nPregúntame, por ejemplo: *«¿Qué muestras hay en análisis ahora?»*',
  },
  {
    id: 'alex',
    name: 'Alex',
    color: '#8b4513',
    shortLabel: 'Administración',
    adminOnly: true,
    description:
      'Soy **Alex**, especialista en **administración y sistema**.\n\nPuedo ayudarte a:\n- Listar usuarios, roles y permisos\n- Consultar estadísticas generales del sistema\n- Crear o editar usuarios *(según tu rol)*\n\nPregúntame, por ejemplo: *«¿Cuántos contratos activos hay?»* o *«Lista los usuarios admin»*',
  },
]

// ─── Persistencia ────────────────────────────────────────────────────────────
const STORAGE_KEY_PREFIX = 'srm_chat_history'
const LEGACY_STORAGE_KEY = 'srm_chat_history'

function storageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : LEGACY_STORAGE_KEY
}

function buildWelcomeMessage() {
  return {
    role: 'assistant',
    content:
      '¡Hola! Soy **SRM**, tu asistente principal de SRM Compras. Analizo tu consulta y te conecto con el especialista adecuado.\n\nElige un agente secundario para ver qué puede hacer, o escríbeme directamente tu pregunta.',
    agent: { name: PRIMARY_AGENT.name, id: PRIMARY_AGENT.id },
    showAgentPicker: true,
  }
}

function loadMessages(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    // Migrar clave antigua si el usuario acaba de iniciar sesión
    if (userId) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.removeItem(LEGACY_STORAGE_KEY)
          return parsed
        }
      }
    }
  } catch { /* ignorar */ }
  return [buildWelcomeMessage()]
}

function saveMessages(msgs, userId) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(msgs))
  } catch { /* ignorar */ }
}

function clearChatStorage(userId) {
  try {
    if (userId) localStorage.removeItem(storageKey(userId))
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch { /* ignorar */ }
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

const AGENT_COLOR_MAP = {
  default: { bg: PRIMARY_AGENT.color, text: '#ffffff' },
  carmen: { bg: '#276c00', text: '#ffffff' },
  rafa: { bg: '#655880', text: '#ffffff' },
  noa: { bg: '#006874', text: '#ffffff' },
  iris: { bg: '#656100', text: '#ffffff' },
  alex: { bg: '#8b4513', text: '#ffffff' },
}

const agentColorCache = {}

function getAgentColor(agentId) {
  if (AGENT_COLOR_MAP[agentId]) return AGENT_COLOR_MAP[agentId]
  if (!agentColorCache[agentId]) {
    const idx = Object.keys(agentColorCache).length % AGENT_COLORS.length
    agentColorCache[agentId] = AGENT_COLORS[idx]
  }
  return agentColorCache[agentId]
}

function AgentPicker({ specialists, onSelect, disabled }) {
  return (
    <div className="flex flex-col gap-2 mt-1 w-full max-w-[92%]">
      {/* Agente principal */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border-2"
        style={{
          borderColor: PRIMARY_AGENT.color,
          background: `${PRIMARY_AGENT.color}14`,
          color: 'var(--color-on-surface)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: PRIMARY_AGENT.color, color: '#fff' }}
        >
          S
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight">{PRIMARY_AGENT.name}</p>
          <p className="opacity-75 leading-snug">{PRIMARY_AGENT.tagline}</p>
        </div>
        <span
          className="ml-auto text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ background: PRIMARY_AGENT.color, color: '#fff' }}
        >
          Principal
        </span>
      </div>

      {/* Agentes secundarios */}
      <p className="text-xs px-1 opacity-70">Especialistas — pulsa para ver qué hace cada uno:</p>
      <div className="flex flex-wrap gap-1.5">
        {specialists.map((agent) => (
          <button
            key={agent.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(agent)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{
              background: `${agent.color}22`,
              color: agent.color,
              border: `1px solid ${agent.color}55`,
            }}
            title={`Ver qué hace ${agent.name}`}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: agent.color, color: '#fff' }}
            >
              {agent.name.charAt(0)}
            </span>
            {agent.name}
            <span className="opacity-70 font-normal">· {agent.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  )
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
  const { token, user, isSuperAdmin } = useAuth()
  const location = useLocation()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [buildWelcomeMessage()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const lastUserIdRef = useRef(null)

  const isAdmin = user?.tipo === 'admin' || user?.tipo === 'superadmin' || isSuperAdmin
  const visibleSpecialists = SPECIALIST_AGENTS.filter(
    (a) => !a.adminOnly || isAdmin,
  )

  // Cargar historial al identificar al usuario
  useEffect(() => {
    if (!user?.id) return
    lastUserIdRef.current = user.id
    setMessages(loadMessages(user.id))
  }, [user?.id])

  // Reiniciar chat al cerrar sesión
  useEffect(() => {
    if (token) return
    const uid = lastUserIdRef.current
    if (uid) clearChatStorage(uid)
    lastUserIdRef.current = null
    setMessages([buildWelcomeMessage()])
    setOpen(false)
    setInput('')
    setLoading(false)
  }, [token])

  // Persistir mensajes en localStorage cada vez que cambien
  useEffect(() => {
    if (user?.id) saveMessages(messages, user.id)
  }, [messages, user?.id])

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
    } catch (err) {
      let content =
        '⚠️ No se pudo conectar con el agente. Comprueba que el backend esté en marcha (`http://localhost:8000`) e inténtalo de nuevo.'

      if (err?.code === 'network') {
        content =
          '⚠️ No hay conexión con el servidor. ¿Está arrancado el backend en el puerto 8000?'
      } else if (err?.code === 'unauthorized' || err?.status === 401) {
        content =
          '⚠️ Tu sesión ha caducado o no estás autenticado. Cierra sesión, vuelve a iniciar sesión y prueba otra vez.'
      } else if (!token) {
        content = '⚠️ Debes iniciar sesión para usar el asistente.'
      } else if (err?.code === 'server' || err?.status >= 500) {
        const detail = typeof err?.message === 'string' ? err.message : ''
        const openAi =
          /openai|401.*completions|OPENAI_API_KEY/i.test(detail)
        content = openAi
          ? '⚠️ El asistente no está configurado: falta una **API key de OpenAI** válida en el backend (`OPENAI_API_KEY` en `.env`). Contacta con quien administre el servidor.'
          : '⚠️ El servidor del asistente devolvió un error. Revisa los logs del backend o inténtalo más tarde.'
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content,
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

