"use client";

import { ArrowLeft, BellRing, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { clientApi } from "@/services/api/client";
import type { PublicTableConsumption, PublicTableResponse } from "@/types/api";
import { money, statusLabel } from "@/utils/format";
import { tableMenuPath } from "@/utils/productAvailability";
import { Actions, Back, Dialog, Empty, Footer, Header, HoldProgress, Identity, Item, Meta, Notice, Orders, Root, Round, Row, StateBadge, Total, holdProgressKeyframes } from "./styles";

export function HoldToCallButton({ disabled, called, onConfirm }: { disabled: boolean; called: boolean; onConfirm: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }, []);

  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState !== "visible") cancel(); };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancel();
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [cancel, disabled]);

  function start() {
    if (disabled || timer.current !== null) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      onConfirm();
    }, 3000);
  }

  return <Button type="button" variant="outline" disabled={disabled}
    style={{ position: "relative", overflow: "hidden", touchAction: "pan-y", userSelect: "none" }}
    onPointerDown={(event) => { if (event.isPrimary && event.button === 0) start(); }}
    onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} onBlur={cancel}
    onContextMenu={(event) => event.preventDefault()}
    onKeyDown={(event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (!event.repeat) start();
      }
    }}
    onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); cancel(); } }}
    aria-label={called ? "Garçom chamado" : "Segure por 3 segundos para chamar o garçom"}>
    <style>{holdProgressKeyframes}</style>
    {holding && !disabled ? <HoldProgress aria-hidden="true" /> : null}
    <BellRing size={18} aria-hidden="true" />{called ? "Garçom chamado" : holding && !disabled ? "Continue segurando…" : "Segure 3s para chamar garçom"}
  </Button>;
}

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
  const router = useRouter();
  const [data, setData] = useState<PublicTableConsumption | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [sentService, setSentService] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  // Bind polling to the visit that was active when this page opened.
  const participationId = table.session?.participationId ?? "";
  const base = `public/tables/${encodeURIComponent(token)}`;
  const load = useCallback(async () => {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    try {
      const result = await clientApi<PublicTableConsumption>(`${base}/orders?${new URLSearchParams({ participationId })}`, { signal: controller.signal });
      if (!controller.signal.aborted) { setData(result); setError(""); }
    } catch {
      if (!controller.signal.aborted) setError("Não foi possível atualizar o consumo. Confira a conexão; tentaremos novamente automaticamente.");
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, [base, participationId]);

  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => { if (!disposed) void load(); });
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 5000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { disposed = true; window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); activeRequest.current?.abort(); activeRequest.current = null; };
  }, [load]);

  async function request(type: "SERVICE" | "CLOSURE") {
    setSending(true); setError(""); setNotice(""); setConfirmClose(false);
    try {
      await clientApi(`${base}/service-requests`, { method: "POST", body: JSON.stringify({ type, participationId }) });
      if (type === "SERVICE" && !data?.session) setSentService(true);
      setNotice(type === "SERVICE" ? "Garçom chamado para tirar sua dúvida. Aguarde o atendimento." : "");
      activeRequest.current?.abort();
      activeRequest.current = null;
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
    <Header><h1><ReceiptText size={28} aria-hidden="true" /> Comanda</h1><Row><Identity>Mesa {table.number}</Identity>{data?.session ? <StateBadge>{closing ? "Em fechamento" : "Conta aberta"}</StateBadge> : null}</Row><Meta>Consumo e atendimento da sua mesa. Atualização automática.</Meta></Header>
    {error ? <Notice role="alert">{error}</Notice> : null}
    {notice && !ended && !closing ? <Notice role="status">{notice}</Notice> : null}
    {!data && !error ? <Meta role="status">Carregando pedidos da mesa…</Meta> : null}
    {closing ? <Notice role="status">Fechamento solicitado. Aguarde a equipe para conferir a conta e realizar o pagamento.</Notice> : null}
    {data?.session ? <Total aria-label="Total do consumo"><Row><span>Total da comanda</span><strong>{money(total)}</strong></Row><p>Pagamento com a equipe do restaurante.</p></Total> : null}
    <Actions aria-label="Atendimento e fechamento">
      <HoldToCallButton disabled={sending || !data || ended || !!servicePending || sentService} called={!!servicePending || sentService} onConfirm={() => void request("SERVICE")} />
      <Button disabled={sending || !data?.session || closing} onClick={() => setConfirmClose(true)}><ReceiptText size={18} aria-hidden="true" />{closing ? "Fechamento solicitado" : "Pedir fechamento"}</Button>
    </Actions>
    {data?.orders.length ? <>
      <Orders aria-label="Pedidos da comanda">{data.orders.map((order) => <Round key={order.id}>
        <Row><h2>Pedido #{order.orderNumber ?? order.id.slice(-6)}</h2><StateBadge>{statusLabel(order.status, "TABLE")}</StateBadge></Row>
        {order.createdAt ? <Meta>{new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Meta> : null}
        {order.items.map((item, index) => <Item key={index}><Row><span>{item.quantity} × {item.name}</span><strong>{money(item.totalCents)}</strong></Row>{item.options?.length ? <Meta>{item.options.map((option) => option.itemName).join(", ")}</Meta> : null}{item.observations ? <Meta>{item.observations}</Meta> : null}</Item>)}
        {order.tableItemCancellations?.map((entry, index) => <Meta key={index}>Cancelado: {entry.item.quantity} × {entry.item.name}</Meta>)}
        <Row><Meta>{order.status === "CANCELED" ? "Cancelado · não entra no total" : "Subtotal"}</Meta><strong>{money(order.totals.totalCents)}</strong></Row>
      </Round>)}</Orders>
    </> : data ? <Empty><ReceiptText size={56} strokeWidth={1.3} aria-hidden="true" /><h2>{ended ? "Atendimento encerrado" : "Nenhum pedido por aqui"}</h2><Meta>{ended ? "A conta desta visita foi encerrada. Os pedidos anteriores não aparecem mais aqui." : "Os pedidos deste atendimento aparecerão aqui."}</Meta></Empty> : null}
    <Footer><Button type="button" variant="outline" onClick={() => router.push(tableMenuPath(token))}><ArrowLeft size={18} aria-hidden="true" />Voltar ao cardápio</Button></Footer>
    {confirmClose ? <CloseConfirmation onClose={() => setConfirmClose(false)} onConfirm={() => void request("CLOSURE")} /> : null}
  </Root>;
}
