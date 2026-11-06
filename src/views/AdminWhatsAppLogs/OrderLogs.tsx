"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { clientApi } from "@/services/api/client";
import { deliveryStatuses, errorLabel, logTime, notificationStatus, orderNumber, orderStatuses, sendStatuses, stages, webhookResults } from "./format";
import type { OrderLogs, Page, WebhookEvent } from "./types";
import { Actions, Detail, DetailHeading, LogTable, Muted, Notice, Pagination, Result, SectionTitle, StageHeader, StageSection, SubTitle, TechnicalDetails } from "./styles";

function EventTimes({ at, receivedAt }: { at: string; receivedAt?: string }) {
  return <><small>Na Meta</small><time dateTime={at}>{logTime(at)}</time><small>Recebido na plataforma</small><time dateTime={receivedAt}>{logTime(receivedAt)}</time></>;
}

export function WebhookList({ page, onPage, label }: { page: Page<WebhookEvent>; onPage: (page: number) => void; label: string }) {
  return <>
    {page.items.length ? <LogTable aria-label={label}>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Evento e processamento</th><th scope="col">Horários</th></tr></thead>
      <tbody>{page.items.map(event => <tr key={event.id}>
        <td><strong>{deliveryStatuses[event.status] ?? event.status}</strong>
          {event.stage ? <p>{stages[event.stage] ?? event.stage}</p> : null}
          <Muted>{webhookResults[event.result] ?? event.result}</Muted>
          {event.errorCodes?.length ? <p>Códigos Meta: {event.errorCodes.join(", ")}</p> : null}
          <TechnicalDetails><summary>ID da mensagem</summary><p>{event.messageId}</p></TechnicalDetails>
        </td>
        <td><EventTimes at={event.at} receivedAt={event.receivedAt} /></td>
      </tr>)}</tbody>
    </LogTable> : <Notice>Nenhum webhook registrado. Ausência de registro não confirma entrega nem falha.</Notice>}
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
      <DetailHeading><SectionTitle>WhatsApp do Pedido #{orderNumber(state.data.order)}</SectionTitle><Muted>{orderStatuses[state.data.order.status] ?? state.data.order.status} · Criado em {logTime(state.data.order.createdAt)}</Muted></DetailHeading>
      {state.data.order.notifications.length === 0 ? <StageSection><Notice>Nenhum envio de WhatsApp registrado para este pedido.</Notice></StageSection> : state.data.order.notifications.map(notification => <StageSection key={notification.id} aria-label={stages[notification.stage] ?? notification.stage}>
        <StageHeader><SubTitle>{stages[notification.stage] ?? notification.stage}</SubTitle><Result>{notificationStatus(notification)}</Result></StageHeader>
        <Muted>{notification.attempts} tentativa(s) · Criado em {logTime(notification.createdAt)}</Muted>
        {notification.errorCode ? <Notice>Motivo: {errorLabel(notification.errorCode)}</Notice> : null}
        {notification.status === "pending" && notification.nextAttemptAt ? <Muted>Próxima tentativa prevista: {logTime(notification.nextAttemptAt)}</Muted> : null}
        <LogTable aria-label={`Tentativas: ${stages[notification.stage] ?? notification.stage}`}>
          <caption>Tentativas de envio</caption>
          <thead><tr><th scope="col">Tentativa e resultado</th><th scope="col">Data e hora</th></tr></thead>
          <tbody>{notification.history?.length ? notification.history.map((attempt, index) => <tr key={index}>
            <td><strong>Tentativa {attempt.attempt}</strong><p>{sendStatuses[attempt.status] ?? attempt.status}</p>{attempt.errorCode ? <Muted>{errorLabel(attempt.errorCode)}</Muted> : null}</td>
            <td><time dateTime={attempt.at}>{logTime(attempt.at)}</time></td>
          </tr>) : <tr><td><strong>Último resultado registrado</strong><p>{sendStatuses[notification.status] ?? notification.status}</p><Muted>Registro anterior ao histórico de tentativas.</Muted></td><td><time dateTime={notification.updatedAt}>{logTime(notification.updatedAt)}</time></td></tr>}</tbody>
        </LogTable>
        {Object.keys(notification.delivery ?? {}).length ? <LogTable aria-label={`Retornos: ${stages[notification.stage] ?? notification.stage}`}>
          <caption>Retornos de entrega da Meta</caption>
          <thead><tr><th scope="col">Status e códigos</th><th scope="col">Horários</th></tr></thead>
          <tbody>{Object.entries(notification.delivery ?? {}).sort((a, b) => a[1].at.localeCompare(b[1].at)).map(([status, receipt]) => <tr key={status}>
            <td><strong>{deliveryStatuses[status] ?? status}</strong>{receipt.errorCodes?.length ? <p>Códigos Meta: {receipt.errorCodes.join(", ")}</p> : null}</td>
            <td><EventTimes at={receipt.at} receivedAt={receipt.receivedAt} /></td>
          </tr>)}</tbody>
        </LogTable> : <Notice>Sem confirmação de entrega ou leitura por webhook.</Notice>}
        {notification.messageId || notification.deliveryMessageId ? <TechnicalDetails><summary>Dados técnicos da mensagem</summary><dl><dt>ID da mensagem na Meta</dt><dd>{notification.messageId || notification.deliveryMessageId}</dd>{notification.messageId && notification.deliveryMessageId && notification.messageId !== notification.deliveryMessageId ? <><dt>ID recebido no webhook</dt><dd>{notification.deliveryMessageId}</dd></> : null}</dl></TechnicalDetails> : null}
      </StageSection>)}
      <StageSection aria-label="Histórico de webhooks do pedido"><SectionTitle>Histórico de webhooks do pedido</SectionTitle><Muted>Ocorrências recebidas, incluindo repetições e resultado do processamento.</Muted><WebhookList page={state.data.webhooks} onPage={page => setRequest(value => ({ ...value, page }))} label="Webhooks do pedido" /></StageSection>
    </> : null}
  </Detail>;
}
