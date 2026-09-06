"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { useMarketingConsent } from "@/components/MarketingConsentProvider";
import { TrackingService, type TrackingWindow } from "@/services/tracking";
import type { RestaurantConfigResponse } from "@/types/api";

const TrackingContext = createContext<TrackingService | null>(null);

function serverTrackingWindow(): TrackingWindow {
  return {
    document: {
      getElementById: () => null,
      createElement: () => ({}) as HTMLElement,
      head: { appendChild: (element) => element },
    },
  };
}

type TrackingProviderProps = {
  tenantSlug: string;
  config: RestaurantConfigResponse | null;
  children: ReactNode;
};

export function TrackingProvider({
  tenantSlug,
  config,
  children,
}: TrackingProviderProps) {
  const { marketingConsent } = useMarketingConsent();
  const [service] = useState(
    () => new TrackingService(
      typeof window === "undefined" ? serverTrackingWindow() : window,
    ),
  );
  const pixel = config?.integrations?.metaPixel;
  const pixelId = pixel?.pixelId;
  const pixelEnabled = pixel?.enabled;

  useLayoutEffect(() => {
    service.configure(
      tenantSlug,
      marketingConsent === "granted"
        ? { pixelId, enabled: pixelEnabled }
        : null,
    );

    if (marketingConsent === "granted") {
      service.pageView();
    }
  }, [marketingConsent, pixelEnabled, pixelId, service, tenantSlug]);

  return (
    <TrackingContext.Provider value={service}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const service = useContext(TrackingContext);

  if (!service) {
    throw new Error("useTracking must be used within TrackingProvider");
  }

  return service;
}
