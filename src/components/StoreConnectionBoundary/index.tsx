"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/Button";
import { StoreLoadEvents } from "@/services/storeLoadEvents";
import { ConnectionRoot, ConnectionContent, ConnectionIcon, ConnectionTitle, ConnectionText } from "./styles";

export function StoreConnectionBoundary({
  available,
  tenantSlug,
  children,
}: {
  available: boolean;
  tenantSlug: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const failed = !available && pathname !== "/admin" && !pathname.startsWith("/admin/");
  const events = useMemo(() => new StoreLoadEvents(tenantSlug), [tenantSlug]);
  const recorded = useRef(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (failed && !recorded.current) {
      events.recordFailure();
      recorded.current = true;
    }
    if (!failed) recorded.current = false;
    return events.start();
  }, [events, failed]);

  if (!failed) return children;

  return (
    <ConnectionRoot aria-labelledby="store-connection-title">
      <ConnectionContent>
        <ConnectionIcon><WifiOff size={32} aria-hidden="true" /></ConnectionIcon>
        <ConnectionTitle id="store-connection-title">Não conseguimos conectar à loja</ConnectionTitle>
        <ConnectionText>
          Verifique sua conexão ou tente outra rede, como Wi-Fi ou dados móveis, e tente novamente.
        </ConnectionText>
        <Button
          type="button"
          disabled={retrying}
          aria-busy={retrying}
          onClick={() => {
            setRetrying(true);
            window.location.reload();
          }}
        >
          <RefreshCw size={18} aria-hidden="true" />
          {retrying ? "Tentando novamente…" : "Tentar novamente"}
        </Button>
      </ConnectionContent>
    </ConnectionRoot>
  );
}
