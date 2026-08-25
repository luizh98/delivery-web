import type {
  AdminDashboardMetricPoint,
  AdminDashboardPerformance,
  AdminDashboardResponse,
} from "@/types/api";
import { money, statusLabel } from "@/utils/format";
import {
  CalendarDate,
  CalendarDay,
  CalendarGrid,
  CalendarOrders,
  CalendarSpacer,
  CalendarValue,
  CalendarWeekday,
  Empty,
  HeatmapCell,
  HeatmapDay,
  HeatmapRow,
  HeatmapRows,
  HeatmapViewport,
  Legend,
  LegendColor,
  LegendItem,
  LineBaseline,
  LineChart,
  LineLabel,
  LinePath,
  LinePoint,
  LineValue,
  LineViewport,
  Participation,
  ParticipationFill,
  ParticipationTrack,
  PaymentFill,
  PaymentHeader,
  PaymentList,
  PaymentMeta,
  PaymentRow,
  PaymentTrack,
  StatusFill,
  StatusLabel,
  StatusList,
  StatusRow,
  StatusTrack,
  StatusValue,
  Table,
  TableViewport,
} from "./styles";

export type DashboardMetricKey = keyof Pick<
  AdminDashboardMetricPoint,
  "revenueCents" | "orders" | "averageTicketCents" | "discountsCents" | "deliveryFeesCents"
>;

const currencyMetrics = new Set<DashboardMetricKey>([
  "revenueCents", "averageTicketCents", "discountsCents", "deliveryFeesCents",
]);

const paymentLabels = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
} as const;

export function MetricChart({
  points,
  metric,
}: {
  points: AdminDashboardMetricPoint[];
  metric: DashboardMetricKey;
}) {
  const maximum = Math.max(...points.map((point) => point[metric]), 0);
  const chartWidth = Math.max((points.length - 1) * 88 + 64, 544);
  const chartHeight = 240;
  const horizontalPadding = 32;
  const topPadding = 32;
  const bottomPadding = 44;
  const plotHeight = chartHeight - topPadding - bottomPadding;
  const plotWidth = chartWidth - horizontalPadding * 2;
  const coordinates = points.map((point, index) => ({
    point,
    x: points.length === 1
      ? chartWidth / 2
      : horizontalPadding + (index / Math.max(points.length - 1, 1)) * plotWidth,
    y: topPadding + (1 - (maximum === 0 ? 0 : point[metric] / maximum)) * plotHeight,
  }));

  return (
    <LineViewport>
      <LineChart
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Evolução do indicador selecionado"
        style={{ minWidth: `${chartWidth}px` }}
      >
        <LineBaseline
          x1={horizontalPadding}
          y1={chartHeight - bottomPadding}
          x2={chartWidth - horizontalPadding}
          y2={chartHeight - bottomPadding}
        />
        {coordinates.length > 1 && (
          <LinePath points={coordinates.map(({ x, y }) => `${x},${y}`).join(" ")} />
        )}
        {coordinates.map(({ point, x, y }) => {
          const formatted = formatMetric(metric, point[metric]);
          return (
            <g key={point.key}>
              <title>{`${point.label}: ${formatted}`}</title>
              <LineValue x={x} y={Math.max(y - 12, 12)}>{formatted}</LineValue>
              <LinePoint cx={x} cy={y} r={5} />
              <LineLabel x={x} y={chartHeight - 14}>{point.label}</LineLabel>
            </g>
          );
        })}
      </LineChart>
    </LineViewport>
  );
}

export function StatusTimeChart({
  values,
}: {
  values: AdminDashboardResponse["averageStatusTimes"];
}) {
  const maximum = Math.max(...values.map((item) => item.averageSeconds), 0);
  if (values.length === 0) {
    return <Empty>Sem transições de status no período.</Empty>;
  }
  return (
    <StatusList>
      {values.map((item) => (
        <StatusRow key={item.status}>
          <StatusLabel>{statusLabel(item.status)}</StatusLabel>
          <StatusTrack title={`${item.samples} amostra(s)`}>
            <StatusFill style={{ width: `${maximum ? (item.averageSeconds / maximum) * 100 : 0}%` }} />
          </StatusTrack>
          <StatusValue>{formatDuration(item.averageSeconds)}</StatusValue>
        </StatusRow>
      ))}
    </StatusList>
  );
}

export function PerformanceTable({ values }: { values: AdminDashboardPerformance[] }) {
  if (values.length === 0) {
    return <Empty>Sem vendas para montar o ranking.</Empty>;
  }
  return (
    <TableViewport>
      <Table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Qtd.</th>
            <th>Preço unitário</th>
            <th>Total vendido</th>
            <th>Participação</th>
          </tr>
        </thead>
        <tbody>
          {values.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong></td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{money(item.unitPriceCents)}</td>
              <td>{money(item.totalSoldCents)}</td>
              <td>
                <Participation>
                  <span>{formatPercent(item.salesSharePercent)}</span>
                  <ParticipationTrack>
                    <ParticipationFill style={{ width: `${Math.min(item.salesSharePercent, 100)}%` }} />
                  </ParticipationTrack>
                </Participation>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableViewport>
  );
}

export function OrderHeatmap({
  cells,
  schedules,
}: {
  cells: AdminDashboardResponse["orderHeatmap"];
  schedules: AdminDashboardResponse["heatmapSchedules"];
}) {
  const byKey = new Map(cells.map((cell) => [`${cell.dayOfWeek}:${cell.hour}`, cell]));
  if (cells.length === 0 || schedules.length === 0) {
    return <Empty>Configure os horários de funcionamento para visualizar este relatório.</Empty>;
  }
  return (
    <>
      <HeatmapViewport>
        <HeatmapRows role="table" aria-label="Pedidos por dia da semana e horário de funcionamento">
          {schedules.map((schedule) => {
            const dayCells = cells.filter((cell) => cell.dayOfWeek === schedule.dayOfWeek);
            const hours = Array.from(new Set(dayCells.map((cell) => cell.hour))).sort((first, second) => first - second);
            return (
              <HeatmapRow
                key={schedule.dayOfWeek}
                role="row"
                style={{ gridTemplateColumns: `minmax(10rem, auto) repeat(${Math.max(hours.length, 1)}, minmax(1.8rem, 1fr))` }}
              >
                <HeatmapDay role="rowheader">
                  {schedule.dayLabel}: {formatScheduleTime(schedule.openTime)}–{formatScheduleTime(schedule.closeTime)}
                </HeatmapDay>
                {hours.map((hour) => {
                  const total = byKey.get(`${schedule.dayOfWeek}:${hour}`)?.orders ?? 0;
                  return (
                    <HeatmapCell
                      key={`${schedule.dayOfWeek}-${hour}`}
                      role="cell"
                      level={heatLevel(total)}
                      title={`${schedule.dayLabel}, ${hour}h: ${total} pedido(s)`}
                    >
                      <span>{hour}h</span>
                      <strong>{total}</strong>
                    </HeatmapCell>
                  );
                })}
              </HeatmapRow>
            );
          })}
        </HeatmapRows>
      </HeatmapViewport>
      <Legend>
        <LegendItem><LegendColor level="low" />Poucos pedidos (1–3)</LegendItem>
        <LegendItem><LegendColor level="medium" />Volume moderado (4–6)</LegendItem>
        <LegendItem><LegendColor level="high" />Muitos pedidos (7+)</LegendItem>
      </Legend>
    </>
  );
}

function formatScheduleTime(value: string) {
  return value.slice(0, 5);
}

export function PaymentMethodChart({
  values,
}: {
  values: AdminDashboardResponse["paymentMethods"];
}) {
  const maximum = Math.max(...values.map((item) => item.totalSoldCents), 0);
  if (values.length === 0) {
    return <Empty>Sem pagamentos no período.</Empty>;
  }
  return (
    <PaymentList>
      {values.map((item) => (
        <PaymentRow key={item.paymentMethod}>
          <PaymentHeader>
            <strong>{paymentLabels[item.paymentMethod]}</strong>
            <PaymentMeta>
              {item.orders} pedido(s) · {money(item.totalSoldCents)} · {formatPercent(item.revenueSharePercent)}
            </PaymentMeta>
          </PaymentHeader>
          <PaymentTrack>
            <PaymentFill style={{ width: `${maximum ? (item.totalSoldCents / maximum) * 100 : 0}%` }} />
          </PaymentTrack>
        </PaymentRow>
      ))}
    </PaymentList>
  );
}

export function SalesCalendar({ report }: { report: AdminDashboardResponse["monthlySales"] }) {
  const salesDays = report.days.filter((day) => day.totalSoldCents > 0);
  const best = salesDays.length ? Math.max(...salesDays.map((day) => day.totalSoldCents)) : -1;
  const worst = salesDays.length ? Math.min(...salesDays.map((day) => day.totalSoldCents)) : -1;
  const firstWeekday = report.days.length
    ? (new Date(`${report.days[0].date}T12:00:00`).getDay() + 6) % 7
    : 0;
  return (
    <CalendarGrid>
      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
        <CalendarWeekday key={day}>{day}</CalendarWeekday>
      ))}
      {Array.from({ length: firstWeekday }, (_, index) => <CalendarSpacer key={`space-${index}`} />)}
      {report.days.map((day) => {
        const tone = day.totalSoldCents > 0 && day.totalSoldCents === best
          ? "best"
          : day.totalSoldCents > 0 && day.totalSoldCents === worst
            ? "worst"
            : "neutral";
        return (
          <CalendarDay key={day.date} tone={tone} title={`${day.date}: ${money(day.totalSoldCents)}`}>
            <CalendarDate>{Number(day.date.slice(-2))}</CalendarDate>
            <CalendarValue>{money(day.totalSoldCents)}</CalendarValue>
            <CalendarOrders>{day.orders} pedido(s)</CalendarOrders>
          </CalendarDay>
        );
      })}
    </CalendarGrid>
  );
}

function formatMetric(metric: DashboardMetricKey, value: number) {
  return currencyMetrics.has(metric) ? money(value) : value.toLocaleString("pt-BR");
}

function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

function heatLevel(total: number): "none" | "low" | "medium" | "high" {
  if (total === 0) return "none";
  if (total <= 3) return "low";
  if (total <= 6) return "medium";
  return "high";
}
