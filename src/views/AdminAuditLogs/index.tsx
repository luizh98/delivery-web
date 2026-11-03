"use client";

import { ArrowLeft, ArrowRight, Filter, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import { auditActions, auditCollections, auditFieldName, auditQuery, auditStatuses, auditValue } from "./format";
import type { AuditFilters, AuditLogPage } from "./types";
import { Actions, ChangeList, Entry, Filters, Header, List, Muted, Notice, Pagination, Root, Status, Summary, SummaryHeading, Time, Title, Value, Values } from "./styles";

const emptyFilters: AuditFilters = { actor: "", collection: "", documentId: "", action: "", status: "", from: "", to: "" };

export function AdminAuditLogsView() {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<AuditFilters>({ defaultValues: emptyFilters });
  const [request, setRequest] = useState({ filters: emptyFilters, page: 0 });
  const [data, setData] = useState<AuditLogPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    clientApi<AuditLogPage>(`admin/audit-logs?${auditQuery(request.filters, request.page)}`, { signal: controller.signal })
      .then((page) => { if (!controller.signal.aborted) { setData(page); setLoadError(false); } })
      .catch(() => { if (!controller.signal.aborted) { setData(null); setLoadError(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [request]);

  function load(filters: AuditFilters, page = 0) {
    setLoading(true);
    setLoadError(false);
    setRequest({ filters, page });
  }

  function applyFilters(filters: AuditFilters) {
    if (filters.from && filters.to && filters.from > filters.to) {
      setError("to", { message: "Data final deve ser igual ou posterior à inicial." });
      return;
    }
    load(filters);
  }

  return (
    <Root>
      <Header>
        <div><Title>Histórico de alterações</Title><Muted>Veja o que sua equipe alterou, quando e quais valores mudaram. Alterações mais recentes primeiro.</Muted></div>
        <Button type="button" variant="primary" disabled={loading} onClick={() => load(request.filters)}><RefreshCw size={16} aria-hidden="true" />Atualizar</Button>
      </Header>
      <Filters onSubmit={handleSubmit(applyFilters)} aria-label="Filtros do histórico de alterações">
        <Field label="Usuário"><Input {...register("actor")} maxLength={120} placeholder="Nome, e-mail ou ID" /></Field>
        <Field label="Ação"><Select {...register("action")}><option value="">Todas as ações</option>{Object.entries(auditActions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        <Field label="Recurso"><Select {...register("collection")}><option value="">Todos os recursos</option>{Object.entries(auditCollections).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        <Field label="ID do registro"><Input {...register("documentId")} maxLength={200} placeholder="ID exato do registro" /></Field>
        <Field label="Data inicial"><Input type="date" {...register("from")} /></Field>
        <Field label="Data final" error={errors.to?.message}><Input type="date" {...register("to")} aria-invalid={!!errors.to} /></Field>
        <Field label="Situação"><Select {...register("status")}><option value="">Todas as situações</option>{Object.entries(auditStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
        <Actions><Button type="submit" disabled={loading}><Filter size={16} aria-hidden="true" />Filtrar</Button><Button type="button" variant="outline" disabled={loading} onClick={() => { reset(emptyFilters); load(emptyFilters); }}>Limpar</Button></Actions>
      </Filters>
      <div aria-live="polite" aria-busy={loading}>
        {loading ? <Notice role="status">Carregando histórico de alterações...</Notice> : error ? <Notice role="alert">Não foi possível carregar o histórico de alterações. Tente novamente em Atualizar.</Notice> : data?.items.length === 0 ? <Notice>Nenhuma alteração encontrada. Altere os filtros ou aguarde novas alterações da equipe.</Notice> : (
          <List>
            {data?.items.map((entry) => {
              const changes = entry.changes ?? [];
              const primary = changes.find((change) => !["updatedAt", "createdAt", "tenantId"].includes(change.field));
              const uncertain = entry.status === "PENDING" || entry.status === "UNCONFIRMED";
              return (
                <Entry key={entry.id}>
                  <Summary>
                    <SummaryHeading><strong>{entry.actor.name || entry.actor.email || entry.actor.id}</strong><span>{auditActions[entry.action]} · {auditCollections[entry.collection] ?? entry.collection}</span><Status>{auditStatuses[entry.status]}</Status></SummaryHeading>
                    <Muted>{entry.actor.email} · {entry.actor.roles.join(", ")}</Muted>
                    <Time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString("pt-BR")}</Time>
                    {entry.source ? <Muted>Origem: {entry.source}</Muted> : null}
                    {uncertain ? <Notice>Conclusão não confirmada. A operação pode ter alterado os dados; confira o registro antes de repetir.</Notice> : primary ? <Muted>{auditFieldName(primary.field)}: {auditValue(primary.before, primary.beforeExists).slice(0, 140)} → {auditValue(primary.after, primary.afterExists).slice(0, 140)}</Muted> : <Muted>Nenhum campo mudou.</Muted>}
                  </Summary>
                  <details>
                    <summary>Ver detalhes{changes.length ? ` · ${changes.length} campos` : ""}</summary>
                    <Muted>{entry.method} {entry.path}</Muted>
                    <Muted>Registros: {entry.documentIds.join(", ") || "Nenhum identificado"}</Muted>
                    <Muted>Operação: {entry.requestId}</Muted>
                    <ChangeList>{changes.map((change, index) => (
                      <div key={`${change.documentId}-${change.field}-${index}`}>
                        <dt>{auditFieldName(change.field)} <span>· {change.documentId}</span></dt>
                        <Values><Value><small>Antes</small><pre>{auditValue(change.before, change.beforeExists)}</pre></Value><Value><small>Depois</small><pre>{auditValue(change.after, change.afterExists)}</pre></Value></Values>
                      </div>
                    ))}</ChangeList>
                  </details>
                </Entry>
              );
            })}
          </List>
        )}
      </div>
      {data && !loading && !error && data.totalElements > 0 ? <Pagination aria-label="Paginação do histórico de alterações"><span>{data.totalElements} registros · Página {data.page + 1} de {data.totalPages}</span><Actions><Button type="button" variant="outline" disabled={data.page === 0} onClick={() => load(request.filters, data.page - 1)}><ArrowLeft size={16} aria-hidden="true" />Anterior</Button><Button type="button" variant="outline" disabled={data.page + 1 >= data.totalPages} onClick={() => load(request.filters, data.page + 1)}>Próxima<ArrowRight size={16} aria-hidden="true" /></Button></Actions></Pagination> : null}
    </Root>
  );
}
