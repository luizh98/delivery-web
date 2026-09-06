"use client";

import { ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/Button";
import { useMarketingConsent } from "@/components/MarketingConsentProvider";
import {
  BannerActions,
  BannerRoot,
  BannerText,
  BannerTitle,
} from "./styles";

export function MarketingConsentBanner() {
  const pathname = usePathname();
  const {
    hasDecision,
    setMarketingConsent,
  } = useMarketingConsent();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (hasDecision) {
    return null;
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
        Utilizamos cookies para melhorar sua experiência de navegação, entender como
        o cardápio é utilizado e aprimorar nossos serviços. Escolha se deseja aceitar
        ou recusar cookies opcionais.
      </BannerText>
      <BannerActions>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMarketingConsent("denied")}
        >
          Recusar
        </Button>
        <Button
          type="button"
          onClick={() => setMarketingConsent("granted")}
        >
          Aceitar cookies
        </Button>
      </BannerActions>
    </BannerRoot>
  );
}
