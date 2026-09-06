export type MarketingConsent = "granted" | "denied" | null;

export const MARKETING_CONSENT_STORAGE_KEY = "delivery:marketing-consent-v1";

const MARKETING_CONSENT_CHANGE_EVENT = "delivery-marketing-consent-change";

let memoryConsent: MarketingConsent = null;
let cachedRaw: string | null | undefined;
let cachedConsent: MarketingConsent = null;

function parseConsent(raw: string | null): MarketingConsent {
  if (raw === JSON.stringify("granted") || raw === JSON.stringify("denied")) {
    return JSON.parse(raw) as Exclude<MarketingConsent, null>;
  }

  return null;
}

export function getMarketingConsent(): MarketingConsent {
  if (typeof window === "undefined") {
    return memoryConsent;
  }

  try {
    const raw = window.localStorage.getItem(MARKETING_CONSENT_STORAGE_KEY);

    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedConsent = parseConsent(raw);
      memoryConsent = cachedConsent;
    }

    return cachedConsent;
  } catch {
    return memoryConsent;
  }
}

export function saveMarketingConsent(consent: Exclude<MarketingConsent, null>) {
  const raw = JSON.stringify(consent);
  memoryConsent = consent;
  cachedRaw = raw;
  cachedConsent = consent;

  try {
    window.localStorage.setItem(MARKETING_CONSENT_STORAGE_KEY, raw);
  } catch {
    // Consent should not block the customer journey when storage is unavailable.
  }

  window.dispatchEvent(new Event(MARKETING_CONSENT_CHANGE_EVENT));
}

export function subscribeMarketingConsent(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(MARKETING_CONSENT_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(MARKETING_CONSENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
