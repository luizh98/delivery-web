"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getMarketingConsent,
  saveMarketingConsent,
  subscribeMarketingConsent,
  type MarketingConsent,
} from "@/services/consent";

type MarketingConsentContextValue = {
  marketingConsent: MarketingConsent;
  hasDecision: boolean;
  setMarketingConsent: (consent: Exclude<MarketingConsent, null>) => void;
};

const MarketingConsentContext = createContext<MarketingConsentContextValue | null>(null);

export function MarketingConsentProvider({ children }: { children: ReactNode }) {
  const marketingConsent = useSyncExternalStore(
    subscribeMarketingConsent,
    getMarketingConsent,
    () => null,
  );
  const value = useMemo(
    () => ({
      marketingConsent,
      hasDecision: marketingConsent !== null,
      setMarketingConsent: (consent: Exclude<MarketingConsent, null>) => {
        saveMarketingConsent(consent);
      },
    }),
    [marketingConsent],
  );

  return (
    <MarketingConsentContext.Provider value={value}>
      {children}
    </MarketingConsentContext.Provider>
  );
}

export function useMarketingConsent() {
  const context = useContext(MarketingConsentContext);

  if (!context) {
    throw new Error("useMarketingConsent must be used within MarketingConsentProvider");
  }

  return context;
}
