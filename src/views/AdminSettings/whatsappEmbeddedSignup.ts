export type MetaSignupMessage =
  | { event: "FINISH"; wabaId: string; phoneNumberId: string; businessId: string }
  | { event: "CANCEL" | "ERROR" | "UNSUPPORTED" };

const allowedOrigins = new Set([
  "https://www.facebook.com",
  "https://web.facebook.com",
  "https://business.facebook.com",
  "https://facebook.com",
]);

export function parseMetaSignupMessage(origin: string, value: unknown): MetaSignupMessage | null {
  if (!allowedOrigins.has(origin)) return null;
  let message: unknown = value;
  if (typeof value === "string") {
    try { message = JSON.parse(value); } catch { return null; }
  }
  if (!message || typeof message !== "object" || !("type" in message) || message.type !== "WA_EMBEDDED_SIGNUP" || !("event" in message)) return null;
  if (message.event === "CANCEL" || message.event === "ERROR") return { event: message.event };
  if (typeof message.event === "string" && message.event.startsWith("FINISH") && message.event !== "FINISH") return { event: "UNSUPPORTED" };
  if (message.event !== "FINISH" || !("data" in message) || !message.data || typeof message.data !== "object") return null;
  const data = message.data;
  if (!("waba_id" in data) || typeof data.waba_id !== "string" || !/^\d{1,30}$/.test(data.waba_id) || !("phone_number_id" in data) || typeof data.phone_number_id !== "string" || !/^\d{1,30}$/.test(data.phone_number_id)) return null;
  const businessId = "business_id" in data && typeof data.business_id === "string" ? data.business_id : "";
  if (businessId && !/^\d{1,30}$/.test(businessId)) return null;
  return { event: "FINISH", wabaId: data.waba_id, phoneNumberId: data.phone_number_id, businessId };
}

export type MetaSDK = {
  init: (options: { appId: string; version: string; xfbml: boolean; autoLogAppEvents: boolean }) => void;
  login: (callback: (response: { authResponse?: { code?: string } }) => void, options: { config_id: string; response_type: "code"; override_default_response_type: boolean; extras: { setup: Record<string, never> } }) => void;
};

declare global {
  interface Window { FB?: MetaSDK; fbAsyncInit?: () => void }
}

let sdkPromise: Promise<MetaSDK> | null = null;

export function loadMetaSDK(appId: string, version: string): Promise<MetaSDK> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<MetaSDK>((resolve, reject) => {
    let settled = false;
    const previousAsyncInit = window.fbAsyncInit;
    const cleanup = () => {
      window.clearTimeout(timeout);
      if (window.fbAsyncInit === onReady) window.fbAsyncInit = previousAsyncInit;
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("SDK indisponível"));
    };
    const initialize = () => {
      // sdk.js first exposes a buffered stub; login on that stub loses user activation.
      if (settled || !window.FB || "__buffer" in window.FB) return;
      try { window.FB.init({ appId, version, xfbml: false, autoLogAppEvents: false }); }
      catch { fail(); return; }
      settled = true;
      cleanup();
      resolve(window.FB);
    };
    const onReady = () => {
      try { previousAsyncInit?.(); } finally { initialize(); }
    };
    window.fbAsyncInit = onReady;
    const timeout = window.setTimeout(fail, 15000);
    if (window.FB && !("__buffer" in window.FB)) { initialize(); return; }
    const previous = document.getElementById("whatsapp-meta-sdk");
    previous?.remove();
    const script = document.createElement("script");
    script.id = "whatsapp-meta-sdk";
    script.src = "https://connect.facebook.net/pt_BR/sdk.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = initialize;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error: unknown) => { sdkPromise = null; throw error; });
  return sdkPromise;
}

export function connectionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    try {
      const parsed: unknown = JSON.parse(error.message);
      if (parsed && typeof parsed === "object" && "message" in parsed && typeof parsed.message === "string") return parsed.message;
    } catch { /* Network failures have no API message. */ }
  }
  return "Não foi possível concluir esta etapa. Tente novamente; sua configuração atual foi preservada.";
}

export function templateStatusLabel(status?: string): string {
  const labels: Record<string, string> = {
    APPROVED: "Aprovado",
    PENDING: "Em análise na Meta",
    REJECTED: "Revisar na Meta",
    PAUSED: "Pausado na Meta",
    DISABLED: "Desativado na Meta",
    SUBMISSION_UNCERTAIN: "Conferir envio na Meta",
  };
  return (status && labels[status]) || "Aguardando verificação";
}
