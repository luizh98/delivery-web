"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import { ptBR } from "@daypicker/react/locale";
import {
  Banknote,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Percent,
  ReceiptText,
  RefreshCw,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Select } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import type { AdminDashboardResponse } from "@/types/api";
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
  CalendarPanel,
  DateFilterWrap,
  DateModalActions,
  DatePopover,
  DatePopoverBody,
  DatePopoverHeader,
  DateRangeText,
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

type DatePreset = "last7" | "yesterday" | "today" | "thisMonth" | "custom";
type PerformanceMode = "items" | "options";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const datePresetLabels: Record<DatePreset, string> = {
  last7: "Últimos 7 dias",
  yesterday: "Ontem",
  today: "Hoje",
  thisMonth: "Este mês",
  custom: "Personalizado",
};

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

export function AdminDashboardView() {
  const datePopoverRef = useRef<HTMLDivElement>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [{ startDate, endDate }, setDateRange] = useState(() => getPresetDateRange("today"));
  const [draftDateRange, setDraftDateRange] = useState<DateRange>();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetricKey>("revenueCents");
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>("items");
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
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
    if (!isDatePopoverOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!datePopoverRef.current?.contains(event.target as Node)) setIsDatePopoverOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsDatePopoverOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDatePopoverOpen]);

  function selectDatePreset(preset: DatePreset) {
    if (preset === "custom") {
      setDraftDateRange({ from: dateFromKey(startDate), to: dateFromKey(endDate) });
      setIsDatePopoverOpen(true);
      return;
    }
    setDatePreset(preset);
    setDateRange(getPresetDateRange(preset));
  }

  function applyCustomDateRange() {
    if (!draftDateRange?.from || !draftDateRange.to) return;
    setDatePreset("custom");
    setDateRange({ startDate: dateKey(draftDateRange.from), endDate: dateKey(draftDateRange.to) });
    setIsDatePopoverOpen(false);
  }

  const selectedPerformance = performanceMode === "items" ? data?.items ?? [] : data?.options ?? [];
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
        <DateFilterWrap ref={datePopoverRef}>
          <Field label={`Período: ${formatDateRange(startDate, endDate)}`}>
            <Select value="" onChange={(event) => selectDatePreset(event.target.value as DatePreset)}>
              <option value="" disabled>{datePresetLabels[datePreset]}</option>
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="last7">Últimos 7 dias</option>
              <option value="thisMonth">Este mês</option>
              <option value="custom">Personalizado</option>
            </Select>
          </Field>
          {isDatePopoverOpen ? (
            <DatePopover role="dialog" aria-labelledby="dashboard-date-title">
              <DatePopoverHeader>
                <div>
                  <strong id="dashboard-date-title">Período personalizado</strong>
                  <Subtitle>Selecione início e fim.</Subtitle>
                </div>
                <Button type="button" variant="outline" aria-label="Fechar período" onClick={() => setIsDatePopoverOpen(false)}>
                  <X size={16} />
                </Button>
              </DatePopoverHeader>
              <DatePopoverBody>
                <CalendarPanel>
                  <DayPicker
                    mode="range"
                    locale={ptBR}
                    selected={draftDateRange}
                    onSelect={setDraftDateRange}
                    defaultMonth={draftDateRange?.from}
                    resetOnSelect
                  />
                </CalendarPanel>
                <DateRangeText>
                  <CalendarDays size={16} aria-hidden="true" />
                  {draftDateRange?.from && draftDateRange.to
                    ? formatDateRange(dateKey(draftDateRange.from), dateKey(draftDateRange.to))
                    : "Selecione o início e o fim do período"}
                </DateRangeText>
                <DateModalActions>
                  <Button type="button" variant="outline" onClick={() => setIsDatePopoverOpen(false)}>Cancelar</Button>
                  <Button type="button" disabled={!draftDateRange?.from || !draftDateRange.to} onClick={applyCustomDateRange}>
                    Aplicar período
                  </Button>
                </DateModalActions>
              </DatePopoverBody>
            </DatePopover>
          ) : null}
        </DateFilterWrap>
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
                <SectionSubtitle>Top 10 por valor vendido</SectionSubtitle>
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
            <PerformanceTable values={selectedPerformance} />
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

function getPresetDateRange(preset: Exclude<DatePreset, "custom">) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  if (preset === "last7") start.setDate(start.getDate() - 6);
  else if (preset === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset === "thisMonth") start.setDate(1);
  return { startDate: dateKey(start), endDate: dateKey(end) };
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateRange(startDate: string, endDate: string) {
  return `${dateFormatter.format(dateFromKey(startDate))} a ${dateFormatter.format(dateFromKey(endDate))}`;
}
