import type { WhatsAppConnectionResponse } from "../../types/api";
import type { MetaSignupMessage } from "./whatsappEmbeddedSignup";

export type CentralSignupConfig = { origin: string | null; tenantDomain: string };
export type SignupProvider = WhatsAppConnectionResponse["provider"];
export type CentralSignupResult = { event: "CANCEL" | "ERROR" | "UNSUPPORTED" } | (Extract<MetaSignupMessage, { wabaId: string }> & { code: string });
export const CENTRAL_SIGNUP_PATH = "/integrations/whatsapp";
const statePattern = /^[a-f0-9]{64}$/;

function secureOrigin(value: string) {
  const url = new URL(value);
  const local = url.hostname === "localhost" || url.hostname.endsWith(".localhost");
  if (url.username || url.password || (url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.origin !== value) throw new Error("Origem de conexão inválida.");
  return url;
}

export function centralSignupConfig(origin = "", tenantDomain = ""): CentralSignupConfig {
  origin = origin.trim().replace(/\/$/, "");
  if (!origin) return { origin: null, tenantDomain: "" };
  secureOrigin(origin);
  tenantDomain = tenantDomain.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(tenantDomain)) throw new Error("Domínio dos restaurantes inválido.");
  return { origin, tenantDomain };
}

export function centralSignupContext(hash: string, config: CentralSignupConfig) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const origin = params.get("origin") ?? "";
  const state = params.get("state") ?? "";
  try {
    const url = secureOrigin(origin);
    if (!config.origin || !statePattern.test(state) || (url.hostname !== config.tenantDomain && !url.hostname.endsWith(`.${config.tenantDomain}`))) return null;
    return { origin, state };
  } catch { return null; }
}

export function validSignupProvider(value: unknown): value is SignupProvider {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return p.enabled === true && typeof p.appId === "string" && /^\d{1,30}$/.test(p.appId) && typeof p.configId === "string" && /^\d{1,30}$/.test(p.configId) && typeof p.apiVersion === "string" && /^v\d{1,3}\.0$/.test(p.apiVersion);
}

export function validCentralResult(value: unknown): value is CentralSignupResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.event === "CANCEL" || v.event === "ERROR" || v.event === "UNSUPPORTED") return true;
  if (v.event !== "FINISH" && v.event !== "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING") return false;
  return typeof v.code === "string" && v.code.length > 0 && v.code.length <= 8192 && !/[\r\n]/.test(v.code) && typeof v.wabaId === "string" && /^\d{1,30}$/.test(v.wabaId) && typeof v.phoneNumberId === "string" && (/^\d{1,30}$/.test(v.phoneNumberId) || (v.event !== "FINISH" && v.phoneNumberId === "")) && typeof v.businessId === "string" && (v.businessId === "" || /^\d{1,30}$/.test(v.businessId));
}

export function openCentralSignup(origin: string, provider: SignupProvider, signal: AbortSignal): Promise<CentralSignupResult> {
  secureOrigin(origin);
  if (!validSignupProvider(provider)) throw new Error("Configuração de conexão inválida.");
  if (signal.aborted) return Promise.resolve({ event: "CANCEL" });
  const state = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join("");
  const url = new URL(CENTRAL_SIGNUP_PATH, origin);
  url.hash = new URLSearchParams({ origin: window.location.origin, state }).toString();
  // The opener is required; no cookies or persistent credentials cross origins.
  const popup = window.open(url.href, "_blank", "popup,width=560,height=720");
  if (!popup) throw new Error("Permita pop-ups para conectar o WhatsApp e tente novamente.");
  return new Promise((resolve, reject) => {
    let done = false;
    function settle(result: CentralSignupResult, error?: Error) {
      if (done) return;
      done = true;
      window.removeEventListener("message", receive);
      signal.removeEventListener("abort", cancel);
      clearTimeout(timeout);
      clearInterval(closed);
      popup?.close();
      if (error) reject(error); else resolve(result);
    }
    function cancel() { settle({ event: "CANCEL" }); }
    function receive(event: MessageEvent) {
      if (event.origin !== origin || event.source !== popup || !event.data || event.data.state !== state) return;
      if (event.data.type === "FLYFOODS_WHATSAPP_READY") popup?.postMessage({ type: "FLYFOODS_WHATSAPP_INIT", state, provider }, origin);
      if (event.data.type === "FLYFOODS_WHATSAPP_RESULT" && validCentralResult(event.data.result)) settle(event.data.result);
    }
    const timeout = setTimeout(() => settle({ event: "ERROR" }, new Error("A conexão expirou. Clique em Conectar WhatsApp para tentar novamente.")), 5 * 60 * 1000);
    const closed = setInterval(() => { if (popup.closed) cancel(); }, 500);
    window.addEventListener("message", receive);
    signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel();
  });
}
