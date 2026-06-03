const STORAGE_KEY = "srm_email_excluded_message_ids";

export function getExcludedMessageIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

export function addExcludedMessageId(messageId) {
  const id = String(messageId ?? "").trim();
  if (!id) return;
  const set = getExcludedMessageIds();
  set.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function filterExcludedEmails(emails) {
  const excluded = getExcludedMessageIds();
  if (excluded.size === 0) return emails ?? [];
  return (emails ?? []).filter((e) => !excluded.has(e.messageId));
}
