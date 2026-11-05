"use client";

import { ArrowLeft, BellRing, ReceiptText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { clientApi } from "@/services/api/client";
import type { PublicTableConsumption, PublicTableResponse } from "@/types/api";
import { money, statusLabel } from "@/utils/format";
import { tableMenuPath } from "@/utils/productAvailability";
import { TableIdentity } from "@/views/Home/styles";
import { Actions, Back, Dialog, Empty, Header, Item, Meta, Notice, Orders, Root, Round, Row, Total } from "./styles";

function CloseConfirmation({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = ref.current; element?.showModal(); return () => element?.close(); }, []);
  return <Dialog ref={ref} onCancel={onClose} aria-labelledby="close-title" aria-describedby="close-description">
    <h2 id="close-title">Solicitar fechamento da conta?</h2>
    <p id="close-description">Vamos avisar a equipe. Novos pedidos ficarão bloqueados enquanto a conta estiver em fechamento. O pagamento será feito com a equipe do restaurante.</p>
    <Actions><Button variant="outline" onClick={onClose}>Continuar consumindo</Button><Button onClick={onConfirm}>Pedir fechamento</Button></Actions>
  </Dialog>;
}

export function TableOrders({ token, table }: { token: string; table: PublicTableResponse }) {
  const [data, setData] = useState<PublicTableConsumption | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [sentService, setSentService] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  // Bind polling to the visit that was active when this page opened.
  const participationId = table.session?.participationId ?? "";
  const base = `public/tables/${encodeURIComponent(token)}`;
  const load = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    try {
      const result = await clientApi<PublicTableConsumption>(`${base}/orders?${new URLSearchParams({ participationId })}`, { signal: controller.signal });
      if (!controller.signal.aborted) { setData(result); setError(""); }
    } catch {
      if (!controller.signal.aborted) setError("Não foi possível atualizar o consumo. Confira a conexão e tente novamente.");
    }
  }, [base, participationId]);

  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => { if (!disposed) void load(); });
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 5000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => { disposed = true; window.clearInterval(interval); window.removeEventListener("focus", onVisible); document.removeEventListener("visibilitychange", onVisible); activeRequest.current?.abort(); };
  }, [load]);

  async function request(type: "SERVICE" | "CLOSURE") {
    setSending(true); setError(""); setNotice(""); setConfirmClose(false);
    try {
      await clientApi(`${base}/service-requests`, { method: "POST", body: JSON.stringify({ type, participationId }) });
      if (type === "SERVICE" && !data?.session) setSentService(true);
      setNotice(type === "SERVICE" ? "Garçom chamado para tirar sua dúvida. Aguarde o atendimento." : "Fechamento solicitado. A equipe foi avisada e virá até sua mesa.");
      await load();
    } catch { setError("Não foi possível enviar o chamado. Atualize a página e tente novamente."); }
    finally { setSending(false); }
  }

  const closing = data?.session?.status === "CLOSING";
  const servicePending = data?.requests.some((item) => item.type === "SERVICE");
  const total = data?.orders.reduce((sum, order) => sum + (order.status === "CANCELED" ? 0 : order.totals.totalCents), 0) ?? 0;
  const ended = Boolean(table.session && data && !data.session);

  return <Root>
    <Back as={Link} href={tableMenuPath(token)}><ArrowLeft size={20} aria-hidden="true" />Cardápio</Back>
    <Header><h1>Pedidos da mesa</h1><Row><TableIdentity>Mesa {table.number}</TableIdentity>{data?.session ? <strong>{closing ? "Conta em fechamento" : "Conta aberta"}</strong> : null}</Row><Meta>Pedidos deste atendimento</Meta></Header>
    <Button variant="outline" disabled={refreshing} onClick={async () => { setRefreshing(true); await load(); setRefreshing(false); }}><RefreshCw size={16} aria-hidden="true" />{refreshing ? "Atualizando…" : "Atualizar pedidos"}</Button>
    {error ? <Notice role="alert">{error}</Notice> : null}
    {notice && !ended && !closing ? <Notice role="status">{notice}</Notice> : null}
    {!data && !error ? <Meta role="status">Carregando pedidos da mesa…</Meta> : null}
    {closing ? <Notice role="status">Fechamento solicitado. Aguarde a equipe para conferir a conta e realizar o pagamento.</Notice> : null}
    {data?.orders.length ? <>
      <Orders>{data.orders.map((order) => <Round key={order.id}>
        <Row><h2>Pedido #{order.orderNumber ?? order.id.slice(-6)}</h2><strong>{statusLabel(order.status, "TABLE")}</strong></Row>
        {order.createdAt ? <Meta>{new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Meta> : null}
        {order.items.map((item, index) => <Item key={index}><Row><span>{item.quantity} × {item.name}</span><strong>{money(item.totalCents)}</strong></Row>{item.options?.length ? <Meta>{item.options.map((option) => option.itemName).join(", ")}</Meta> : null}{item.observations ? <Meta>{item.observations}</Meta> : null}</Item>)}
        {order.tableItemCancellations?.map((entry, index) => <Meta key={index}>Cancelado: {entry.item.quantity} × {entry.item.name}</Meta>)}
        <Row><Meta>{order.status === "CANCELED" ? "Cancelado · não entra no total" : "Subtotal"}</Meta><strong>{money(order.totals.totalCents)}</strong></Row>
      </Round>)}</Orders>
      <Total aria-label="Total do consumo"><Row><span>Total do consumo</span><strong>{money(total)}</strong></Row><Meta>Pagamento com a equipe do restaurante.</Meta></Total>
    </> : data ? <Empty><ReceiptText size={56} strokeWidth={1.3} aria-hidden="true" /><h2>{ended ? "Atendimento encerrado" : "Nenhum pedido por aqui"}</h2><Meta>{ended ? "A conta desta visita foi encerrada. Os pedidos anteriores não aparecem mais aqui." : "Os pedidos deste atendimento aparecerão aqui."}</Meta></Empty> : null}
    <Actions>
      <Button variant="outline" disabled={sending || !data || ended || !!servicePending || sentService} onClick={() => void request("SERVICE")}><BellRing size={18} aria-hidden="true" />{servicePending || sentService ? "Garçom chamado" : "Chamar garçom · dúvida"}</Button>
      <Button disabled={sending || !data?.session || closing} onClick={() => setConfirmClose(true)}><ReceiptText size={18} aria-hidden="true" />{closing ? "Fechamento solicitado" : "Fechar conta da mesa"}</Button>
    </Actions>
    <Back as={Link} href={tableMenuPath(token)}>Voltar ao cardápio</Back>
    {confirmClose ? <CloseConfirmation onClose={() => setConfirmClose(false)} onConfirm={() => void request("CLOSURE")} /> : null}
  </Root>;
}
