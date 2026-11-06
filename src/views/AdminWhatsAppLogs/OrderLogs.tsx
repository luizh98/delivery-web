"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { clientApi } from "@/services/api/client";
import { deliveryStatuses, errorLabel, logTime, notificationStatus, orderNumber, sendStatuses, stages, webhookResults } from "./format";
import type { OrderLogs, Page, WebhookEvent } from "./types";
import { Actions, Detail, Muted, Notice, Pagination, SectionTitle, SubTitle, Timeline } from "./styles";

export function WebhookList({ page, onPage, label }: { page: Page<WebhookEvent>; onPage: (page: number) => void; label: string }) {
  return <>
    {page.items.length ? <Timeline aria-label={label}>{page.items.map(event => <li key={event.id}>
      <strong>{deliveryStatuses[event.status] ?? event.status} · {webhookResults[event.result] ?? event.result}</strong>
      <Muted>Recebido: <time dateTime={event.receivedAt}>{logTime(event.receivedAt)}</time> · Na Meta: {logTime(event.at)}</Muted>
      {event.stage ? <Muted>{stages[event.stage] ?? event.stage}</Muted> : null}
      {event.errorCodes?.length ? <p>Códigos Meta: {event.errorCodes.join(", ")}</p> : null}
      <details><summary>ID da mensagem</summary><Muted>{event.messageId}</Muted></details>
    </li>)}</Timeline> : <Notice>Nenhum webhook registrado. Ausência de registro não confirma entrega nem falha.</Notice>}
    {page.totalPages > 1 ? <Pagination aria-label={`Paginação: ${label}`}>
      <span>{page.totalElements} eventos · Página {page.page + 1} de {page.totalPages}</span>
      <Actions><Button type="button" variant="outline" disabled={page.page === 0} onClick={() => onPage(page.page - 1)}>Anterior</Button><Button type="button" variant="outline" disabled={page.page + 1 >= page.totalPages} onClick={() => onPage(page.page + 1)}>Próxima</Button></Actions>
    </Pagination> : null}
  </>;
}

export function OrderLogsDetail({ orderId, refresh }: { orderId: string; refresh: number }) {
  const [request, setRequest] = useState({ page: 0, reload: 0 });
  const [state, setState] = useState<{ data?: OrderLogs; error?: boolean; key: string }>({ key: "" });
  const key = `${orderId}:${request.page}:${request.reload}:${refresh}`;
  useEffect(() => {
    const controller = new AbortController();
    clientApi<OrderLogs>(`admin/whatsapp/logs/orders/${encodeURIComponent(orderId)}?page=${request.page}&size=25`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setState({ data, key }); })
      .catch(() => { if (!controller.signal.aborted) setState({ error: true, key }); });
    return () => controller.abort();
  }, [orderId, request, key]);
  const loading = state.key !== key;
  return <Detail id={`whatsapp-order-${orderId}`} aria-label="Detalhes do WhatsApp do pedido" aria-busy={loading}>
    {loading ? <Notice role="status">Carregando logs do pedido…</Notice> : state.error ? <div role="alert"><Notice>Não foi possível carregar os logs deste pedido.</Notice><Button type="button" variant="outline" onClick={() => setRequest(value => ({ ...value, reload: value.reload + 1 }))}>Tentar novamente</Button></div> : state.data ? <>
      <SectionTitle>WhatsApp do Pedido #{orderNumber(state.data.order)}</SectionTitle>
      {state.data.order.notifications.length === 0 ? <Notice>Nenhum envio de WhatsApp registrado para este pedido.</Notice> : state.data.order.notifications.map(notification => <section key={notification.id} aria-label={stages[notification.stage] ?? notification.stage}>
        <SubTitle>{stages[notification.stage] ?? notification.stage}</SubTitle>
        <p>{notificationStatus(notification)}</p>
        <Muted>{notification.attempts} tentativa(s) · Criado em {logTime(notification.createdAt)}</Muted>
        {notification.errorCode ? <Notice>Motivo: {errorLabel(notification.errorCode)}</Notice> : null}
        {notification.status === "pending" && notification.nextAttemptAt ? <Muted>Próxima tentativa prevista: {logTime(notification.nextAttemptAt)}</Muted> : null}
        <Timeline aria-label="Tentativas e retornos de entrega">
          {notification.history?.length ? notification.history.map((attempt, index) => <li key={index}><time dateTime={attempt.at}>{logTime(attempt.at)}</time> · Tentativa {attempt.attempt}: {sendStatuses[attempt.status] ?? attempt.status}{attempt.errorCode ? ` · ${errorLabel(attempt.errorCode)}` : ""}</li>) : <li>Registro anterior ao histórico de tentativas. Último resultado: {sendStatuses[notification.status] ?? notification.status} · {logTime(notification.updatedAt)}</li>}
          {Object.entries(notification.delivery ?? {}).sort((a, b) => a[1].at.localeCompare(b[1].at)).map(([status, receipt]) => <li key={status}><strong>{deliveryStatuses[status] ?? status}</strong> · Na Meta: {logTime(receipt.at)}<Muted>Recebido: {logTime(receipt.receivedAt)}{receipt.errorCodes?.length ? ` · Códigos Meta: ${receipt.errorCodes.join(", ")}` : ""}</Muted></li>)}
        </Timeline>
        {!Object.keys(notification.delivery ?? {}).length ? <Muted>Sem confirmação de entrega ou leitura por webhook.</Muted> : null}
        {notification.messageId || notification.deliveryMessageId ? <details><summary>ID da mensagem na Meta</summary><Muted>{notification.messageId || notification.deliveryMessageId}</Muted></details> : null}
      </section>)}
      <section><SectionTitle>Histórico de webhooks do pedido</SectionTitle><WebhookList page={state.data.webhooks} onPage={page => setRequest(value => ({ ...value, page }))} label="Webhooks do pedido" /></section>
    </> : null}
  </Detail>;
}
