"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { styled } from "styles";
import { clientApi } from "@/services/api/client";
import type { StaffTable } from "@/types/api";
import { pendingTableCalls } from "@/utils/tableService";

const Banner = styled("aside", {
  padding: "1rem", marginBottom: "1rem", border: "2px solid var(--color-primary-text)", borderRadius: "0.75rem", background: "var(--color-surface)", display: "grid", gap: "0.75rem",
  "& h2": { display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 },
  "& ul": { display: "flex", gap: "0.5rem 1.5rem", flexWrap: "wrap" },
  "& a, & button": { display: "inline-flex", minHeight: "2.75rem", alignItems: "center", gap: "0.5rem", color: "var(--color-foreground)", textDecoration: "underline", textUnderlineOffset: "0.2em", textAlign: "left" },
  "& :is(a, button):focus-visible": { outline: "2px solid var(--color-primary-text)", outlineOffset: "3px" },
});

export function TableServiceAlerts({ tables, onSelect, disabled = false }: { tables?: StaffTable[] | null; onSelect?: (id: string) => void; disabled?: boolean }) {
  const [loaded, setLoaded] = useState<StaffTable[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (tables !== undefined) return;
    let current: AbortController | undefined;
    let disposed = false;
    const refresh = async () => {
      current?.abort(); current = new AbortController();
      const signal = current.signal;
      try {
        const result = await clientApi<StaffTable[]>("admin/table-operations", { signal });
        if (!signal.aborted && !disposed) { setLoaded(result); setFailed(false); }
      } catch { if (!signal.aborted && !disposed) setFailed(true); }
    };
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh();
    const events = new EventSource("/api/backend/admin/table-operations/events");
    events.addEventListener("table-operation", onVisible);
    events.addEventListener("open", onVisible);
    const timer = window.setInterval(onVisible, 10000);
    document.addEventListener("visibilitychange", onVisible);
    return () => { disposed = true; current?.abort(); events.close(); window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [tables]);

  const calls = pendingTableCalls(tables ?? loaded);
  if (!calls.length) return failed ? <p role="status">Sem atualização dos chamados de mesa. Confira o salão.</p> : null;
  return <Banner className="table-service-pending" aria-label="Chamados das mesas">
    <h2 aria-live="polite"><BellRing size={20} aria-hidden="true" />{calls.length} {calls.length === 1 ? "mesa aguardando atendimento" : "chamados aguardando atendimento"}</h2>
    <ul>{calls.map((call) => <li key={call.id}>{onSelect
      ? <button type="button" disabled={disabled} onClick={() => onSelect(call.tableId)}>{call.kind === "COMMAND" ? "Comanda" : "Mesa"} {call.tableNumber} · {call.label}</button>
      : <Link href={`/hall?table=${encodeURIComponent(call.tableId)}`}>{call.kind === "COMMAND" ? "Comanda" : "Mesa"} {call.tableNumber} · {call.label}</Link>}</li>)}</ul>
    {failed ? <p role="status">Sem atualização dos chamados. Confira a conexão.</p> : null}
  </Banner>;
}
