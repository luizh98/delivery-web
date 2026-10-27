"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/Button";
import { StoreLoadEvents } from "@/services/storeLoadEvents";
import { ConnectionRoot, ConnectionContent, ConnectionIcon, ConnectionTitle, ConnectionText } from "./styles";
import { clearRetries, getRetryDelay, registerRetry, subscribeRetryDelay } from "./retry";

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
  const remaining = useSyncExternalStore(
    useCallback((onChange: () => void) => failed ? subscribeRetryDelay(onChange) : () => {}, [failed]),
    useCallback(() => failed ? getRetryDelay(tenantSlug) : 0, [failed, tenantSlug]),
    () => 0,
  );

  useEffect(() => {
    if (available) clearRetries(tenantSlug);
    if (failed && !recorded.current) {
      events.recordFailure();
      recorded.current = true;
    }
    if (!failed) recorded.current = false;
    return events.start();
  }, [available, events, failed, tenantSlug]);

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
          disabled={retrying || remaining > 0}
          aria-busy={retrying}
          onClick={() => {
            if (!registerRetry(tenantSlug)) return;
            setRetrying(true);
            window.location.reload();
          }}
        >
          <RefreshCw size={18} aria-hidden="true" />
          {retrying ? "Tentando novamente…" : remaining > 0 ? `Tentar novamente em ${remaining}s` : "Tentar novamente"}
        </Button>
      </ConnectionContent>
    </ConnectionRoot>
  );
}
