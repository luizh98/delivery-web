"use client";

import { DateRangeFilter, getPresetDateRange } from "@/components/DateRangeFilter";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Banknote,
  ClipboardList,
  DollarSign,
  Percent,
  ReceiptText,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Button } from "@/components/Button";
import { clientApi } from "@/services/api/client";
import type {
  AdminDashboardPerformance,
  AdminDashboardPerformancePage,
  AdminDashboardResponse,
} from "@/types/api";
import { money } from "@/utils/format";
import {
  MetricChart,
  OrderHeatmap,
  PaymentMethodChart,
  PerformanceTable,
  SalesCalendar,
  StatusTimeChart,
  type DashboardMetricKey,
} from "./charts";
import {
  Feedback,
  FullSection,
  Header,
  MetricButton,
  MetricHint,
  MetricIcon,
  MetricLabel,
  MetricsGrid,
  MetricTop,
  MetricValue,
  ReportGrid,
  Root,
  Section,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  Subtitle,
  Title,
  ToggleButton,
  ToggleGroup,
} from "./styles";

type PerformanceMode = "items" | "options";

const PERFORMANCE_PAGE_SIZE = 20;

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

const metrics: {
  key: DashboardMetricKey;
  label: string;
  icon: typeof DollarSign;
  currency: boolean;
}[] = [
  { key: "revenueCents", label: "Faturamento", icon: DollarSign, currency: true },
  { key: "orders", label: "Pedidos", icon: ClipboardList, currency: false },
  { key: "averageTicketCents", label: "Ticket médio", icon: ReceiptText, currency: true },
  { key: "discountsCents", label: "Descontos", icon: Percent, currency: true },
  { key: "deliveryFeesCents", label: "Taxa de entrega", icon: Truck, currency: true },
];

function LegacyAdminDashboardView() {
  const performanceSentinelRef = useRef<HTMLDivElement>(null);
  const performanceRequestRef = useRef<AbortController | null>(null);
  const [{ startDate, endDate }, setDateRange] = useState(() => getPresetDateRange("today"));
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetricKey>("revenueCents");
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>("items");
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [performance, setPerformance] = useState<AdminDashboardPerformance[]>([]);
  const [performancePage, setPerformancePage] = useState<AdminDashboardPerformancePage | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState(false);
  const [performanceRetry, setPerformanceRetry] = useState(0);

  useEffect(() => {
    performanceRequestRef.current?.abort();
    const controller = new AbortController();
    performanceRequestRef.current = controller;
    async function loadDashboard() {
      setLoading(true);
      setError(false);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
      const params = new URLSearchParams({ startDate, endDate, timezone });
      try {
        const response = await clientApi<AdminDashboardResponse>(`admin/dashboard?${params}`, {
          signal: controller.signal,
        });
        setData(response);
      } catch (requestError) {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadDashboard();
    return () => controller.abort();
  }, [endDate, retry, startDate]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPerformance() {
      setPerformance([]);
      setPerformancePage(null);
      setPerformanceLoading(true);
      setPerformanceError(false);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
      const params = new URLSearchParams({
        startDate,
        endDate,
        timezone,
        type: performanceMode,
        page: "0",
        size: String(PERFORMANCE_PAGE_SIZE),
      });
      try {
        const response = await clientApi<AdminDashboardPerformancePage>(`admin/dashboard/performance?${params}`, {
          signal: controller.signal,
        });
        setPerformance(response.items);
        setPerformancePage(response);
      } catch (requestError) {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
          setPerformanceError(true);
        }
      } finally {
        if (performanceRequestRef.current === controller) setPerformanceLoading(false);
      }
    }
    void loadPerformance();
    return () => controller.abort();
  }, [endDate, performanceMode, performanceRetry, startDate]);

  const loadMorePerformance = useCallback(async () => {
    if (performanceLoading || !performancePage || performancePage.page + 1 >= performancePage.totalPages) return;

    const controller = new AbortController();
    performanceRequestRef.current?.abort();
    performanceRequestRef.current = controller;
    setPerformanceLoading(true);
    setPerformanceError(false);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
    const params = new URLSearchParams({
      startDate,
      endDate,
      timezone,
      type: performanceMode,
      page: String(performancePage.page + 1),
      size: String(PERFORMANCE_PAGE_SIZE),
    });
    try {
      const response = await clientApi<AdminDashboardPerformancePage>(`admin/dashboard/performance?${params}`, {
        signal: controller.signal,
      });
      if (performanceRequestRef.current !== controller) return;
      setPerformance((current) => [...current, ...response.items]);
      setPerformancePage(response);
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
        setPerformanceError(true);
      }
    } finally {
      if (performanceRequestRef.current === controller) setPerformanceLoading(false);
    }
  }, [endDate, performanceLoading, performanceMode, performancePage, startDate]);

  const hasMorePerformance = performancePage !== null
    && performancePage.page + 1 < performancePage.totalPages;

  useEffect(() => {
    const sentinel = performanceSentinelRef.current;
    if (!sentinel || !hasMorePerformance || performanceLoading) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMorePerformance();
    }, { rootMargin: "160px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMorePerformance, loadMorePerformance, performanceLoading]);

  const monthLabel = data
    ? monthFormatter.format(new Date(data.monthlySales.year, data.monthlySales.month - 1, 1))
    : "mês selecionado";

  return (
    <Root>
      <Header>
        <div>
          <Title>Análises</Title>
          <Subtitle>
            Desempenho do restaurante{loading && data ? " · Atualizando…" : ""}
          </Subtitle>
        </div>
        <DateRangeFilter value={{ startDate, endDate }} onChange={setDateRange} maxDays={366} />
      </Header>

      <MetricsGrid aria-label="Indicadores do período">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const active = selectedMetric === metric.key;
          const value = data?.summary[metric.key] ?? 0;
          return (
            <MetricButton
              key={metric.key}
              type="button"
              active={active}
              aria-pressed={active}
              onClick={() => setSelectedMetric(metric.key)}
            >
              <MetricTop>
                <MetricLabel>{metric.label}</MetricLabel>
                <MetricIcon><Icon size={16} aria-hidden="true" /></MetricIcon>
              </MetricTop>
              <MetricValue>{metric.currency ? money(value) : value.toLocaleString("pt-BR")}</MetricValue>
              <MetricHint>Clique para atualizar o gráfico</MetricHint>
            </MetricButton>
          );
        })}
      </MetricsGrid>

      {loading && !data ? (
        <Feedback>Carregando relatórios…</Feedback>
      ) : error || !data ? (
        <Feedback>
          <span>Não foi possível carregar os relatórios.</span>
          <Button type="button" onClick={() => setRetry((value) => value + 1)}>
            <RefreshCw size={16} /> Tentar novamente
          </Button>
        </Feedback>
      ) : (
        <ReportGrid>
          <FullSection>
            <SectionHeader>
              <div>
                <SectionTitle>{metrics.find((metric) => metric.key === selectedMetric)?.label}</SectionTitle>
                <SectionSubtitle>
                  {data.seriesGranularity === "HOUR" ? "Picos por hora do dia" : "Resultado diário por dia da semana"}
                </SectionSubtitle>
              </div>
            </SectionHeader>
            <MetricChart points={data.metricSeries} metric={selectedMetric} />
          </FullSection>

          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Tempo médio em cada status</SectionTitle>
                <SectionSubtitle>Tempo até a próxima etapa</SectionSubtitle>
              </div>
            </SectionHeader>
            <StatusTimeChart values={data.averageStatusTimes} />
          </Section>

          <Section>
            <SectionHeader>
              <div>
                <SectionTitle>Formas de pagamento</SectionTitle>
                <SectionSubtitle>Quantidade, valor e participação no faturamento</SectionSubtitle>
              </div>
              <Banknote size={18} aria-hidden="true" />
            </SectionHeader>
            <PaymentMethodChart values={data.paymentMethods} />
          </Section>

          <FullSection>
            <SectionHeader>
              <div>
                <SectionTitle>Desempenho de itens e opcionais</SectionTitle>
                  <SectionSubtitle>Carregamento gradual por valor vendido</SectionSubtitle>
              </div>
              <ToggleGroup aria-label="Tipo de desempenho">
                <ToggleButton
                  type="button"
                  active={performanceMode === "items"}
                  aria-pressed={performanceMode === "items"}
                  onClick={() => setPerformanceMode("items")}
                >
                  Itens
                </ToggleButton>
                <ToggleButton
                  type="button"
                  active={performanceMode === "options"}
                  aria-pressed={performanceMode === "options"}
                  onClick={() => setPerformanceMode("options")}
                >
                  Opcionais
                </ToggleButton>
              </ToggleGroup>
            </SectionHeader>
            <PerformanceTable values={performance} loading={performanceLoading} />
            {performanceError ? (
              <Feedback>
                <span>Não foi possível carregar o ranking.</span>
                <Button type="button" variant="outline" onClick={() => setPerformanceRetry((current) => current + 1)}>
                  Tentar novamente
                </Button>
              </Feedback>
            ) : null}
            {hasMorePerformance ? (
              <div ref={performanceSentinelRef} aria-live="polite">
                {performanceLoading ? "Carregando mais itens…" : "Role para carregar mais itens."}
              </div>
            ) : null}
          </FullSection>

          <FullSection>
            <SectionHeader>
              <div>
                <SectionTitle>Horários com mais pedidos</SectionTitle>
                <SectionSubtitle>Dias da semana × hora cheia</SectionSubtitle>
              </div>
            </SectionHeader>
            <OrderHeatmap cells={data.orderHeatmap} schedules={data.heatmapSchedules} />
          </FullSection>

          <FullSection>
            <SectionHeader>
              <div>
                <SectionTitle>Relatório de vendas de {monthLabel}</SectionTitle>
                <SectionSubtitle>Melhor dia em verde; menor dia com venda em vermelho</SectionSubtitle>
              </div>
            </SectionHeader>
            <SalesCalendar report={data.monthlySales} />
          </FullSection>
        </ReportGrid>
      )}

    </Root>
  );
}

export { AdminDashboardView } from "./LazyAdminDashboard";
