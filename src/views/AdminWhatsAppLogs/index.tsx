"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Filter, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { DateRangeFilter, getPresetDateRange } from "@/components/DateRangeFilter";
import { Field, Input, Select } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import type { WhatsAppConnectionResponse } from "@/types/api";
import { logQuery, logTime, notificationStatus, orderNumber, orderStatuses, stages } from "./format";
import { OrderLogsDetail, WebhookList } from "./OrderLogs";
import type { Filters, LogOrder, Page, WebhookEvent } from "./types";
import { Actions, ConnectionInfo, FiltersForm, Header, List, Muted, Notice, OrderButton, Pagination, Root, Row, RowHeading, Tag, Title } from "./styles";

export function AdminWhatsAppLogsView() {
  const [request, setRequest] = useState(() => ({ filters: { ...getPresetDateRange("today"), search: "", status: "" }, page: 0, mode: "orders", refresh: 0 }));
  const { register, handleSubmit, reset, getValues } = useForm({ defaultValues: { search: "", status: "" } });
  const [orders, setOrders] = useState<Page<LogOrder> | null>(null);
  const [webhooks, setWebhooks] = useState<Page<WebhookEvent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [connection, setConnection] = useState<WhatsAppConnectionResponse | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void clientApi<WhatsAppConnectionResponse>("admin/whatsapp/connection", { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setConnection(value); }).catch(() => { if (!controller.signal.aborted) setConnection(null); });
    return () => controller.abort();
  }, [request.refresh]);
  useEffect(() => {
    const controller = new AbortController();
    const path = `admin/whatsapp/logs${request.mode === "webhooks" ? "/webhooks" : ""}?${logQuery(request.filters, request.page)}`;
    const done = () => { if (!controller.signal.aborted) setLoading(false); };
    if (request.mode === "webhooks") {
      void clientApi<Page<WebhookEvent>>(path, { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setWebhooks(value); }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(done);
    } else {
      void clientApi<Page<LogOrder>>(path, { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setOrders(value); }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(done);
    }
    return () => controller.abort();
  }, [request]);
  function load(filters: Filters, page = 0, mode = request.mode) {
    setLoading(true); setError(false); setSelected(null);
    setRequest(value => ({ filters, page, mode, refresh: value.refresh + 1 }));
  }
  const events = request.mode === "webhooks";
  return <Root>
    <Header><div><Link href="/admin/settings"><ArrowLeft size={14} aria-hidden="true" /> Voltar às configurações</Link><Title>Logs do WhatsApp</Title><Muted>Acompanhe tentativas de envio e retornos da Meta por pedido.</Muted></div><Button type="button" variant="outline" disabled={loading} onClick={() => load(request.filters, request.page)}><RefreshCw size={16} aria-hidden="true" />Atualizar</Button></Header>
    <ConnectionInfo><summary>Conexão e recebimento de webhooks</summary><Muted>{connection ? `Autorização salva: ${connection.integration?.tokenConfigured ? "sim" : "não"}. Avisos dos pedidos: ${connection.notificationsEnabled ? "ativados" : "desativados"}.` : "Não foi possível consultar a conexão atual. Consulte Configurações ou clique em Atualizar."}</Muted><Muted>O histórico mostra retornos assinados da Meta e reconhecidos para este restaurante. Eventos antigos não salvos não podem ser recuperados aqui. Requisições com assinatura inválida não são atribuídas a um restaurante.</Muted></ConnectionInfo>
    <Actions role="group" aria-label="Tipo de histórico"><Button type="button" variant={events ? "outline" : "primary"} aria-pressed={!events} onClick={() => { reset({ search: "", status: "" }); load({ ...request.filters, search: "", status: "" }, 0, "orders"); }}>Por pedido</Button><Button type="button" variant={events ? "primary" : "outline"} aria-pressed={events} onClick={() => { reset({ search: "", status: "" }); load({ ...request.filters, search: "", status: "" }, 0, "webhooks"); }}>Webhooks sem pedido</Button></Actions>
    <FiltersForm onSubmit={handleSubmit(values => load({ ...request.filters, ...values }))} aria-label="Filtros dos logs do WhatsApp">
      <Field label={events ? "ID da mensagem na Meta" : "Buscar pedido"}><Input type="search" {...register("search")} maxLength={120} placeholder={events ? "ID exato da mensagem" : "Número ou ID do pedido"} /></Field>
      <DateRangeFilter value={request.filters} maxDays={366} onChange={range => load({ ...request.filters, ...getValues(), ...range })} />
      {!events ? <Field label="Status do pedido"><Select {...register("status")}><option value="">Todos os status</option>{Object.entries(orderStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field> : null}
      <Actions><Button type="submit" disabled={loading}><Filter size={16} aria-hidden="true" />Filtrar</Button><Button type="button" variant="outline" onClick={() => { reset({ search: "", status: "" }); load({ ...getPresetDateRange("today"), search: "", status: "" }); }}>Limpar</Button></Actions>
    </FiltersForm>
    <Muted>{events ? "Período considera o recebimento do webhook na plataforma." : "Período considera a criação do pedido. Abra um pedido para consultar todas as etapas."}</Muted>
    <div aria-live="polite" aria-busy={loading}>
      {loading ? <Notice role="status">Carregando logs do WhatsApp…</Notice> : error ? <Notice role="alert">Não foi possível carregar os logs. Tente novamente em Atualizar.</Notice> : events ? webhooks ? <WebhookList page={webhooks} label="Webhooks sem pedido" onPage={page => load(request.filters, page)} /> : null : orders?.items.length ? <List>{orders.items.map(order => <Row key={order.id}>
        <OrderButton type="button" aria-expanded={selected === order.id} aria-controls={selected === order.id ? `whatsapp-order-${order.id}` : undefined} onClick={() => setSelected(value => value === order.id ? null : order.id)}>
          <RowHeading><strong>Pedido #{orderNumber(order)}</strong><Tag>{orderStatuses[order.status] ?? order.status}</Tag>{selected === order.id ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}</RowHeading>
          <Tag>{logTime(order.createdAt)} · {order.notifications.length} aviso(s)</Tag>
          {order.notifications.length ? order.notifications.map(notification => <Tag key={notification.id}>{stages[notification.stage] ?? notification.stage}: {notificationStatus(notification)}</Tag>) : <Tag>Nenhum envio registrado</Tag>}
        </OrderButton>
        {selected === order.id ? <OrderLogsDetail key={order.id} orderId={order.id} refresh={request.refresh} /> : null}
      </Row>)}</List> : <Notice>Nenhum pedido encontrado neste período. Altere os filtros para consultar outros pedidos.</Notice>}
    </div>
    {!events && orders && !loading && !error && orders.totalElements > 0 ? <Pagination aria-label="Paginação dos pedidos"><span>{orders.totalElements} pedidos · Página {orders.page + 1} de {orders.totalPages}</span><Actions><Button type="button" variant="outline" disabled={orders.page === 0} onClick={() => load(request.filters, orders.page - 1)}>Anterior</Button><Button type="button" variant="outline" disabled={orders.page + 1 >= orders.totalPages} onClick={() => load(request.filters, orders.page + 1)}>Próxima</Button></Actions></Pagination> : null}
  </Root>;
}
