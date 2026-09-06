"use client";

import { Settings2, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/Button";
import { useMarketingConsent } from "@/components/MarketingConsentProvider";
import {
  BannerActions,
  BannerRoot,
  BannerText,
  BannerTitle,
  PreferencesButton,
} from "./styles";

export function MarketingConsentBanner() {
  const pathname = usePathname();
  const {
    hasDecision,
    preferencesOpen,
    setMarketingConsent,
    openPreferences,
  } = useMarketingConsent();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (hasDecision && !preferencesOpen) {
    return (
      <PreferencesButton type="button" onClick={openPreferences}>
        <Settings2 size={16} aria-hidden="true" />
        Preferências de privacidade
      </PreferencesButton>
    );
  }

  return (
    <BannerRoot
      role="dialog"
      aria-labelledby="marketing-consent-title"
      aria-describedby="marketing-consent-description"
    >
      <ShieldCheck size={22} aria-hidden="true" />
      <BannerTitle id="marketing-consent-title">
        {hasDecision ? "Preferências de privacidade" : "Sua privacidade importa"}
      </BannerTitle>
      <BannerText id="marketing-consent-description">
        Usamos cookies de marketing para entender o uso do cardápio e melhorar sua
        experiência. O Meta Pixel só será ativado com sua permissão.
      </BannerText>
      <BannerActions>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMarketingConsent("denied")}
        >
          Recusar marketing
        </Button>
        <Button
          type="button"
          onClick={() => setMarketingConsent("granted")}
        >
          Permitir marketing
        </Button>
      </BannerActions>
    </BannerRoot>
  );
}
