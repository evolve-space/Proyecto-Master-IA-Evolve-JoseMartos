const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

function backendOrigin() {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return "";
  }
}

/**
 * Abre Microsoft OAuth en popup; el callback del backend hace postMessage al opener.
 * Si el popup está bloqueado, redirige la ventana actual.
 */
export function openOutlookOAuth(url, { onConnected, onError, onDismiss } = {}) {
  const popup = window.open(
    url,
    "outlook-oauth",
    "width=520,height=720,menubar=no,toolbar=no,location=yes,status=yes,resizable=yes,scrollbars=yes",
  );

  if (!popup) {
    window.location.href = url;
    return;
  }

  const expectedOrigin = backendOrigin();
  let finished = false;

  const cleanup = () => {
    window.removeEventListener("message", onMessage);
    clearInterval(timer);
  };

  const onMessage = (event) => {
    if (expectedOrigin && event.origin !== expectedOrigin) return;
    const data = event.data;
    if (!data || data.type !== "outlook-oauth") return;

    finished = true;
    cleanup();

    if (data.status === "connected") {
      onConnected?.(data);
    } else {
      onError?.(data.message || "No se pudo conectar Outlook.");
    }
  };

  window.addEventListener("message", onMessage);

  const timer = setInterval(() => {
    if (!popup.closed) return;
    cleanup();
    if (!finished) onDismiss?.();
  }, 500);
}
