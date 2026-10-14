"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { DateRangeFilter, getPresetDateRange, type DateFilterRange } from "@/components/DateRangeFilter";
import { Button } from "@/components/Button";
import { Field, Select } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import type { UpsellReport } from "@/types/api";
import { money } from "@/utils/format";
import { MetricChart } from "@/views/AdminDashboard/charts";
import { Empty, Feedback, Header, PerformancePageActions, PerformancePagination, Section, SectionHeader, SectionSubtitle, SectionTitle, Subtitle, TableViewport, Title, ToggleButton, ToggleGroup } from "@/views/AdminDashboard/styles";
import { BarFill, BarTrack, ContextLine, Filters, Ranking, RankingLabel, RankingRow, RankingValue, ReportLinks, ReportNote, ReportRoot, ReportTable, Summary, Warning } from "./report.styles";

type ReportFilters = DateFilterRange & { campaignId: string };
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const pageSize = 10;

function initialFilters(): ReportFilters { return { ...getPresetDateRange("thisMonth"), campaignId: "" }; }

export function UpsellReportView() {
  const [filters, setFilters] = useState(initialFilters);
  const [report, setReport] = useState<UpsellReport | null>(null);
  const [campaigns, setCampaigns] = useState<UpsellReport["campaigns"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [mode, setMode] = useState<"units" | "revenueCents">("units");
  const [page, setPage] = useState(0);
  const query = new URLSearchParams({ ...filters, timezone: "America/Sao_Paulo" }).toString();

  useEffect(() => {
    const controller = new AbortController();
    void clientApi<UpsellReport>(`admin/upsell-report?${query}`, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setReport(data);
        setCampaigns(data.campaigns);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, retry]);

  function applyFilters(values: ReportFilters) {
    setReport(null);
    setLoading(true);
    setError(false);
    setPage(0);
    setFilters(values);
    setRetry((value) => value + 1);
  }

  const sorted = [...(report?.items ?? [])].sort((a, b) => b[mode] - a[mode] || b.units - a.units || a.campaignId.localeCompare(b.campaignId) || a.productId.localeCompare(b.productId));
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const ranking = sorted.slice(0, 10);
  const maximum = ranking[0]?.[mode] ?? 0;
  const summary = report?.summary;
  const missingOriginal = (summary?.missingOriginalPriceUnits ?? 0) > 0;
  const period = `${date.format(new Date(`${filters.startDate}T12:00:00Z`))} a ${date.format(new Date(`${filters.endDate}T12:00:00Z`))}`;

  return (
    <ReportRoot>
      <Header>
        <div><Title>Resultado dos upsells</Title><Subtitle>Veja quais ofertas vendem e quanto geram após os descontos.</Subtitle></div>
        <ReportLinks><Link href="/admin/catalog/upsell"><ArrowLeft size={16} aria-hidden="true" />Campanhas</Link></ReportLinks>
      </Header>
      <Filters aria-label="Filtros do relatório">
        <DateRangeFilter value={filters} onChange={(range) => applyFilters({ ...filters, ...range })} maxDays={366} />
        <Field label="Campanha"><Select aria-label="Campanha" value={filters.campaignId} onChange={(event) => applyFilters({ ...filters, campaignId: event.target.value })}><option value="">Todas as campanhas</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}{filters.campaignId && !campaigns.some((campaign) => campaign.id === filters.campaignId) ? <option value={filters.campaignId}>Campanha selecionada sem registros no período</option> : null}</Select></Field>
      </Filters>
      <ReportNote>Período: {period} · Fuso de Brasília · Data de criação do pedido. Apenas pedidos concluídos compõem as vendas.</ReportNote>
      {loading ? <Feedback role="status">Carregando resultado dos upsells…</Feedback> : error ? <Feedback role="alert"><span>Não foi possível carregar o relatório. Tente novamente.</span><Button type="button" variant="outline" onClick={() => applyFilters(filters)}><RefreshCw size={16} aria-hidden="true" />Tentar novamente</Button></Feedback> : summary && report ? <>
        <Summary aria-label="Resumo das vendas de upsell">
          <div><dt>Valor sem desconto</dt><dd>{missingOriginal ? "—" : money(summary.originalCents)}</dd></div>
          <div><dt>Descontos dos produtos</dt><dd>{missingOriginal ? "—" : money(summary.discountCents)}</dd></div>
          <div><dt>Valor vendido</dt><dd>{money(summary.revenueCents)}</dd></div>
          <div><dt>Unidades vendidas</dt><dd>{number.format(summary.units)}</dd></div>
        </Summary>
        <ContextLine>
          <span><strong>{number.format(summary.orders)}</strong> pedidos com upsell</span>
          <span><strong>{number.format(summary.participationPercent)}%</strong> dos {number.format(summary.completedOrders)} pedidos concluídos</span>
          <span><strong>{money(summary.averagePerOrderCents)}</strong> de upsell por pedido com upsell</span>
        </ContextLine>
        <ReportNote>Valores dos produtos, sem adicionais, frete ou cupons gerais do pedido. Descontos podem incluir promoções do produto. Valor vendido não é lucro: faltam os custos para avaliar a margem.</ReportNote>
        {missingOriginal ? <Warning role="status">{number.format(summary.missingOriginalPriceUnits)} unidades sem preço original registrado. Valor original e desconto aparecem como “—” nos totais afetados; o valor vendido permanece disponível.</Warning> : null}
        <ContextLine><span><strong>{number.format(summary.canceledOrders)}</strong> pedidos cancelados com upsell ({money(summary.canceledRevenueCents)} excluídos das vendas)</span><span><strong>{number.format(summary.pendingOrders)}</strong> pedidos com upsell em andamento, fora do resultado</span></ContextLine>
        {report.items.length === 0 ? <Feedback><SectionTitle>Nenhuma venda de upsell neste período</SectionTitle><span>Amplie o período ou selecione outra campanha. Os resultados aparecem quando os pedidos são concluídos.</span></Feedback> : <>
          <Section>
            <SectionHeader><div><SectionTitle>Upsells mais vendidos</SectionTitle><SectionSubtitle>Até 10 combinações de produto e campanha</SectionSubtitle></div><ToggleGroup aria-label="Ordenar ranking"><ToggleButton type="button" active={mode === "units"} aria-pressed={mode === "units"} onClick={() => { setMode("units"); setPage(0); }}>Unidades</ToggleButton><ToggleButton type="button" active={mode === "revenueCents"} aria-pressed={mode === "revenueCents"} onClick={() => { setMode("revenueCents"); setPage(0); }}>Valor vendido</ToggleButton></ToggleGroup></SectionHeader>
            <Ranking aria-label={mode === "units" ? "Ranking por unidades vendidas" : "Ranking por valor vendido"}>{ranking.map((item) => <RankingRow key={`${item.campaignId}:${item.productId}`}><RankingLabel><strong>{item.productName}</strong><small>{item.campaignName}</small></RankingLabel><BarTrack aria-hidden="true"><BarFill style={{ width: `${maximum > 0 ? item[mode] / maximum * 100 : 0}%` }} /></BarTrack><RankingValue>{mode === "units" ? `${number.format(item.units)} un.` : money(item.revenueCents)}</RankingValue></RankingRow>)}</Ranking>
          </Section>
          <Section>
            <SectionHeader><div><SectionTitle>Detalhes das vendas</SectionTitle><SectionSubtitle>Preços registrados no pedido, mesmo após alterações na campanha</SectionSubtitle></div></SectionHeader>
            <TableViewport tabIndex={0} role="region" aria-label="Detalhes de upsells; role horizontalmente para ver todas as colunas">
              <ReportTable><caption>{sorted.length} combinações de produto e campanha · {period}</caption><thead><tr><th scope="col">Produto / campanha</th><th scope="col">Unidades</th><th scope="col">Pedidos</th><th scope="col">Sem desconto</th><th scope="col">Desconto</th><th scope="col">Valor vendido</th><th scope="col">Preço médio vendido</th></tr></thead><tbody>{sorted.slice(page * pageSize, (page + 1) * pageSize).map((item) => <tr key={`${item.campaignId}:${item.productId}`}><th scope="row"><RankingLabel><strong>{item.productName}</strong><small>{item.campaignName}</small></RankingLabel></th><td>{number.format(item.units)}</td><td>{number.format(item.orders)}</td><td>{item.missingOriginalPriceUnits ? "—" : money(item.originalCents)}</td><td>{item.missingOriginalPriceUnits ? "—" : money(item.discountCents)}</td><td>{money(item.revenueCents)}</td><td>{money(Math.round(item.revenueCents / item.units))}</td></tr>)}</tbody></ReportTable>
            </TableViewport>
            <PerformancePagination aria-label="Paginação dos upsells"><span role="status">Página {page + 1} de {pages}</span><PerformancePageActions><Button type="button" variant="outline" disabled={page === 0} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} aria-hidden="true" />Anterior</Button><Button type="button" variant="outline" disabled={page + 1 >= pages} onClick={() => setPage((value) => value + 1)}>Próxima<ChevronRight size={16} aria-hidden="true" /></Button></PerformancePageActions></PerformancePagination>
          </Section>
          <Section>
            <SectionHeader><div><SectionTitle>Evolução diária</SectionTitle><SectionSubtitle>Valor vendido em upsells por dia, após descontos dos produtos</SectionSubtitle></div></SectionHeader>
            {report.series.length ? <>
              <MetricChart points={report.series} metric="revenueCents" />
              <details>
                <summary style={{ cursor: "pointer", padding: "0.875rem 0", fontSize: "0.875rem" }}>Ver valores por dia</summary>
                <TableViewport tabIndex={0} role="region" aria-label="Valores de upsell por dia">
                  <ReportTable css={{ minWidth: "20rem" }}>
                    <caption>Valor vendido em upsells por dia · {period}</caption>
                    <thead><tr><th scope="col">Data</th><th scope="col">Valor vendido</th></tr></thead>
                    <tbody>{report.series.map((point) => <tr key={point.key}><th scope="row"><time dateTime={point.key}>{date.format(new Date(`${point.key}T12:00:00Z`))}</time></th><td>{money(point.revenueCents)}</td></tr>)}</tbody>
                  </ReportTable>
                </TableViewport>
              </details>
            </> : <Empty>Sem vendas no período.</Empty>}
          </Section>
        </>}
      </> : null}
    </ReportRoot>
  );
}
