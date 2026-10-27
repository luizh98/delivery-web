const STORAGE_KEY = "flyfoods:store-load-retry:";
const COOLDOWN_MS = 10000;
type RetryState = { attempts: number; blockedUntil: number };
const fallback = new Map<string, RetryState>();

function read(tenantSlug: string): RetryState {
  if (fallback.has(tenantSlug)) return fallback.get(tenantSlug)!;
  try {
    const state = JSON.parse(window.localStorage.getItem(STORAGE_KEY + tenantSlug) ?? "null");
    if (state && Number.isInteger(state.attempts) && state.attempts >= 0 && state.attempts <= 3 &&
      typeof state.blockedUntil === "number" && Number.isFinite(state.blockedUntil) &&
      state.blockedUntil >= 0 && state.blockedUntil <= Date.now() + COOLDOWN_MS) return state;
  } catch { /* Disabled or invalid storage must not prevent retrying. */ }
  return { attempts: 0, blockedUntil: 0 };
}

export function getRetryDelay(tenantSlug: string) {
  return Math.max(0, Math.ceil((read(tenantSlug).blockedUntil - Date.now()) / 1000));
}

export function registerRetry(tenantSlug: string) {
  const state = read(tenantSlug);
  if (state.blockedUntil > Date.now()) return false;
  const attempts = Math.min(state.attempts + 1, 3);
  const next = { attempts, blockedUntil: attempts >= 3 ? Date.now() + COOLDOWN_MS : 0 };
  try {
    window.localStorage.setItem(STORAGE_KEY + tenantSlug, JSON.stringify(next));
    fallback.delete(tenantSlug);
  } catch { fallback.set(tenantSlug, next); }
  return true;
}

export function clearRetries(tenantSlug: string) {
  try {
    window.localStorage.removeItem(STORAGE_KEY + tenantSlug);
    fallback.delete(tenantSlug);
  } catch { fallback.set(tenantSlug, { attempts: 0, blockedUntil: 0 }); }
}

export function subscribeRetryDelay(onChange: () => void) {
  const timer = window.setInterval(onChange, 1000);
  window.addEventListener("storage", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("storage", onChange);
  };
}
