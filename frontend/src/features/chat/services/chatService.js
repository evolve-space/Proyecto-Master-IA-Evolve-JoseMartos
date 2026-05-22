/**
 * chatService.js
 * Conector con el endpoint POST /api/chat del backend SRM.
 *
 * El backend responde con:
 *   { reply: string, agent: { name: string, id: string } }
 *
 * La URL base se toma de VITE_API_URL (misma que usa apiClient.js).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const CHAT_ENDPOINT = `${BASE_URL}/chat`;

/**
 * Envía un mensaje al sistema multiagente.
 *
 * @param {string} message           - Mensaje del usuario
 * @param {Array}  history           - Historial [{role, content}]
 * @param {string} token             - JWT del usuario (Bearer)
 * @param {{ userId?, userRole?, currentPage? }} context - Contexto del usuario
 * @returns {Promise<{ reply: string, agent: { name: string, id: string } }>}
 */
export async function sendMessage(
  message,
  history = [],
  token = null,
  context = {},
) {
  // Solo enviar role + content al backend
  const cleanHistory = history.map(({ role, content }) => ({ role, content }));

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, history: cleanHistory, context }),
  });

  if (!response.ok) {
    throw new Error(`Error del agente: ${response.status}`);
  }

  const data = await response.json();

  return {
    reply: data.reply ?? data.message ?? "Sin respuesta del agente.",
    agent: data.agent ?? { name: "Agente", id: "default" },
  };
}
