"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import { ptBR } from "@daypicker/react/locale";
import {
  BadgeCheck,
  Banknote,
  Ban,
  BellRing,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  CookingPot,
  CreditCard,
  ExternalLink,
  Hash,
  Inbox,
  MapPin,
  Maximize2,
  Minimize2,
  Phone,
  Printer,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useAdminOrderEvents } from "@/components/AdminOrderEvents";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import { getSelectedPrinter, printTextWithQz } from "@/services/printing/qz";
import { money, statusLabel } from "@/utils/format";
import type {
  DeliveryType,
  OrderResponse,
  OrderStatus,
  PaymentMethod,
} from "@/types/api";
import type { OrdersManagerProps } from "./types";
import {
  ActionsPanel,
  ButtonRow,
  CalendarPanel,
  CancelBox,
  Card,
  CardFooter,
  CardGrid,
  CardTotal,
  CustomerOrderBadge,
  CustomerName,
  DetailRow,
  DateFilterWrap,
  DateModalActions,
  DatePopover,
  DatePopoverBody,
  DatePopoverHeader,
  DateRangeText,
  Empty,
  Item,
  ItemList,
  List,
  MapsLink,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalInfo,
  ModalInfoGrid,
  ModalLabel,
  ModalOverlay,
  ModalProductHeader,
  ModalProductMeta,
  ModalSection,
  ModalSectionTitle,
  OrderHeader,
  OrderInfo,
  Root,
  ReceivedTime,
  SearchFilter,
  StatusCount,
  StatusFilter,
  StatusFilterLabel,
  StatusFilters,
  StatusBadge,
  Subtitle,
  Title,
  Toolbar,
  ToolbarActions,
  TotalRow,
  Totals,
} from "./styles";

type DatePreset = "last7" | "yesterday" | "today" | "thisMonth" | "custom";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");
const automaticPrintedOrdersKey = "delivery:auto-printed-orders";

async function getPrintContent(order: OrderResponse) {
  const response = await fetch(`/api/backend/admin/orders/${order.id}/print`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar impressão do pedido.");
  }

  return response.text();
}

function renderPrintContent(printWindow: Window, content: string) {
  const printBody = printWindow.document.createElement("pre");

  printWindow.document.title = "Impressão do pedido";
  printWindow.document.documentElement.lang = "pt-BR";
  printWindow.document.body.replaceChildren(printBody);
  printWindow.document.body.style.margin = "0";
  printWindow.document.body.style.padding = "1rem";
  printBody.style.margin = "0";
  printBody.style.whiteSpace = "pre-wrap";
  printBody.style.fontFamily = "monospace";
  printBody.textContent = content;
}

function claimAutomaticPrint(orderId: string) {
  try {
    const printedOrderIds = (window.localStorage.getItem(automaticPrintedOrdersKey) ?? "")
      .split(",")
      .filter(Boolean);

    if (printedOrderIds.includes(orderId)) {
      return false;
    }

    window.localStorage.setItem(
      automaticPrintedOrdersKey,
      [orderId, ...printedOrderIds].slice(0, 200).join(","),
    );
    return true;
  } catch {
    return true;
  }
}

function releaseAutomaticPrint(orderId: string) {
  try {
    const printedOrderIds = (window.localStorage.getItem(automaticPrintedOrdersKey) ?? "")
      .split(",")
      .filter((id) => id && id !== orderId);

    window.localStorage.setItem(automaticPrintedOrdersKey, printedOrderIds.join(","));
  } catch {
    // Falha de storage não deve bloquear nova tentativa de impressão.
  }
}

async function printOrderDirectly(order: OrderResponse, automatic = false) {
  if (automatic && !claimAutomaticPrint(order.id)) {
    return;
  }

  let printFrame: HTMLIFrameElement | null = null;

  try {
    const content = await getPrintContent(order);
    const selectedPrinter = getSelectedPrinter();
    if (selectedPrinter) {
      await printTextWithQz(content, selectedPrinter);
      return;
    }

    printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.position = "fixed";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const printWindow = printFrame.contentWindow;
    if (!printWindow) {
      throw new Error("Janela de impressão indisponível.");
    }

    renderPrintContent(printWindow, content);
    const cleanup = () => printFrame?.remove();
    printWindow.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 60_000);
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    printFrame?.remove();
    if (automatic) {
      releaseAutomaticPrint(order.id);
    }
    throw error;
  }
}

const nextStatuses: OrderStatus[] = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

const orderStatuses: OrderStatus[] = [
  "RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELED",
];

const kitchenStatuses: OrderStatus[] = [
  "RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "READY",
];

const statusIcons = {
  RECEIVED: Inbox,
  CONFIRMED: BadgeCheck,
  PREPARING: CookingPot,
  READY: BellRing,
  OUT_FOR_DELIVERY: Truck,
  COMPLETED: CircleCheck,
  CANCELED: CircleX,
} satisfies Record<OrderStatus, typeof Inbox>;

const paymentLabels: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
};

const deliveryLabels: Record<DeliveryType, string> = {
  DELIVERY: "Entrega",
  PICKUP: "Retirada",
};

const nextStatusLabels: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Confirmar",
  PREPARING: "Preparando",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  COMPLETED: "Concluir",
};

const datePresetLabels: Record<DatePreset, string> = {
  last7: "Últimos 7 dias",
  yesterday: "Ontem",
  today: "Hoje",
  thisMonth: "Este mês",
  custom: "Personalizado",
};

export function OrdersManager({
  initialOrders,
  visibleStatuses,
  title,
  compact,
  automaticOrderConfirmation,
  overdueOrderAlertEnabled,
  overdueOrderAlertMinutes = 30,
}: OrdersManagerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);
  const knownOrderIdsRef = useRef(new Set(initialOrders.map((order) => order.id)));
  const subscribeToOrderEvents = useAdminOrderEvents();
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [{ startDate, endDate }, setDateRange] = useState(
    () => getPresetDateRange("today"),
  );
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [draftDateRange, setDraftDateRange] = useState<DateRange>();
  const [now, setNow] = useState(() => Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const { showToast } = useToast();
  const availableStatuses = compact ? kitchenStatuses : orderStatuses;
  const matchingOrders = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);
    const idSearch = normalizedSearch.replace(/^#/, "");
    const phoneSearch = search.replace(/\D/g, "");

    return orders.filter((order) => {
      const receivedAt = getReceivedAt(order);
      const receivedDate = receivedAt ? localDateKey(receivedAt) : null;

      if ((startDate || endDate) && !receivedDate) {
        return false;
      }

      if (startDate && receivedDate && receivedDate < startDate) {
        return false;
      }

      if (endDate && receivedDate && receivedDate > endDate) {
        return false;
      }

      return !normalizedSearch || (
        normalizeSearch(order.customer.name).includes(normalizedSearch) ||
        normalizeSearch(order.id).includes(idSearch) ||
        (phoneSearch.length > 0 &&
          order.customer.phone.replace(/\D/g, "").includes(phoneSearch))
      );
    });
  }, [endDate, orders, search, startDate]);
  const filteredOrders = useMemo(
    () => statusFilter
      ? matchingOrders.filter((order) => order.status === statusFilter)
      : matchingOrders,
    [matchingOrders, statusFilter],
  );
  const customerOrderNumbers = useMemo(
    () => buildCustomerOrderNumbers(orders),
    [orders],
  );
  const detailsOrder = detailsOrderId
    ? orders.find((order) => order.id === detailsOrderId) ?? null
    : null;
  const detailsOverdueMinutes = detailsOrder
    ? getOverdueMinutes(
      detailsOrder,
      now,
      overdueOrderAlertEnabled,
      overdueOrderAlertMinutes,
    )
    : null;
  const detailsNextStatus = detailsOrder ? getNextOrderStatus(detailsOrder) : null;
  const detailsAddress = detailsOrder
    ? formatAddress(detailsOrder.deliveryAddress)
    : "";
  const mapsUrl = detailsOrder?.deliveryType === "DELIVERY" && detailsAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detailsAddress)}`
    : null;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => subscribeToOrderEvents((order) => {
    const isNewOrder = !knownOrderIdsRef.current.has(order.id);
    knownOrderIdsRef.current.add(order.id);
    const isVisible = !visibleStatuses || visibleStatuses.includes(order.status);
    setOrders((items) => isVisible
      ? [order, ...items.filter((item) => item.id !== order.id)]
      : items.filter((item) => item.id !== order.id));

    if (automaticOrderConfirmation && isNewOrder && order.status === "CONFIRMED") {
      void printOrderDirectly(order, true).catch(() => {
        showToast("Não foi possível imprimir pedido automaticamente.", "error");
      });
    }
  }), [automaticOrderConfirmation, showToast, subscribeToOrderEvents, visibleStatuses]);

  useEffect(() => {
    if (!detailsOrderId && !isDatePopoverOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDetailsOrderId("");
        setIsDatePopoverOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [detailsOrderId, isDatePopoverOpen]);

  useEffect(() => {
    if (!isDatePopoverOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!datePopoverRef.current?.contains(event.target as Node)) {
        setIsDatePopoverOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isDatePopoverOpen]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function selectDatePreset(preset: DatePreset) {
    if (preset === "custom") {
      setDraftDateRange({
        from: dateFromKey(startDate),
        to: dateFromKey(endDate),
      });
      setIsDatePopoverOpen(true);
      return;
    }

    const range = getPresetDateRange(preset);
    setDatePreset(preset);
    setDateRange(range);
  }

  function applyCustomDateRange() {
    if (!draftDateRange?.from || !draftDateRange.to) {
      return;
    }

    setDatePreset("custom");
    setDateRange({
      startDate: dateKey(draftDateRange.from),
      endDate: dateKey(draftDateRange.to),
    });
    setIsDatePopoverOpen(false);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === rootRef.current) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen();
      }
    } catch {
      showToast("Não foi possível alterar o modo de tela cheia.", "error");
    }
  }

  async function updateStatus(order: OrderResponse, status: OrderStatus) {
    try {
      const updated = await clientApi<OrderResponse>(`admin/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      showToast("Pedido atualizado com sucesso");
      if (status === "CONFIRMED") {
        void printOrderDirectly(updated).catch(() => {
          showToast("Pedido confirmado, mas não foi possível imprimir.", "error");
        });
      }
    } catch {
      showToast("Não foi possível atualizar pedido.", "error");
    }
  }

  async function cancelOrder(order: OrderResponse) {
    if (!cancelReason.trim()) {
      return;
    }
    try {
      const updated = await clientApi<OrderResponse>(`admin/orders/${order.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: cancelReason }),
      });
      setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedOrderId("");
      setCancelReason("");
      showToast("Pedido cancelado com sucesso");
    } catch {
      showToast("Não foi possível cancelar pedido.", "error");
    }
  }

  async function printOrder(order: OrderResponse) {
    const selectedPrinter = getSelectedPrinter();
    if (selectedPrinter) {
      try {
        const content = await getPrintContent(order);
        await printTextWithQz(content, selectedPrinter);
        showToast("Pedido enviado para a impressora");
      } catch {
        showToast("Não foi possível imprimir via QZ Tray.", "error");
      }
      return;
    }

    const printWindow = window.open("", "_blank", "popup,width=480,height=640");

    if (!printWindow) {
      showToast("Permita pop-ups para imprimir o pedido.", "error");
      return;
    }

    printWindow.document.body.textContent = "Preparando impressão...";

    try {
      const content = await getPrintContent(order);
      renderPrintContent(printWindow, content);
      printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
      printWindow.focus();
      printWindow.print();
    } catch {
      printWindow.close();
      showToast("Não foi possível imprimir pedido.", "error");
    }
  }

  return (
    <Root ref={rootRef} data-fullscreen={isFullscreen ? "true" : undefined}>
      <Toolbar>
        <div>
          <Title>{title}</Title>
          <Subtitle>{filteredOrders.length} pedido(s) encontrado(s)</Subtitle>
        </div>
        <ToolbarActions>
          <Button
            variant="outline"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Sair da tela cheia" : "Expandir tela"}
            title={isFullscreen ? "Sair da tela cheia" : "Expandir tela"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            Atualizar
          </Button>
        </ToolbarActions>
      </Toolbar>

      <StatusFilters aria-label="Filtrar pedidos por status">
        {availableStatuses.map((status) => {
          const active = statusFilter === status;
          const StatusIcon = statusIcons[status];

          return (
            <StatusFilter
              key={status}
              type="button"
              active={active}
              aria-pressed={active}
              onClick={() => setStatusFilter(active ? null : status)}
            >
              <StatusIcon size={17} aria-hidden="true" />
              <StatusFilterLabel>
                {status === "OUT_FOR_DELIVERY" ? "Entrega" : statusLabel(status)}
              </StatusFilterLabel>
              <StatusCount>
                {matchingOrders.filter((order) => order.status === status).length}
              </StatusCount>
            </StatusFilter>
          );
        })}
      </StatusFilters>

      <SearchFilter>
        <Field label="Buscar pedido">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, ID do pedido ou celular"
          />
        </Field>
        <DateFilterWrap ref={datePopoverRef}>
          <Field label={`Período: ${formatDateRange(startDate, endDate)}`}>
            <Select
              value=""
              onChange={(event) => selectDatePreset(event.target.value as DatePreset)}
            >
              <option value="" disabled>{datePresetLabels[datePreset]}</option>
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="last7">Últimos 7 dias</option>
              <option value="thisMonth">Este mês</option>
              <option value="custom">Personalizado</option>
            </Select>
          </Field>

          {isDatePopoverOpen ? (
            <DatePopover
              role="dialog"
              aria-labelledby="date-range-title"
            >
              <DatePopoverHeader>
                <div>
                  <strong id="date-range-title">Período personalizado</strong>
                  <Subtitle>Selecione início e fim.</Subtitle>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Fechar seleção de período"
                  onClick={() => setIsDatePopoverOpen(false)}
                >
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDatePopoverOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={!draftDateRange?.from || !draftDateRange.to}
                    onClick={applyCustomDateRange}
                  >
                    Aplicar período
                  </Button>
                </DateModalActions>
              </DatePopoverBody>
            </DatePopover>
          ) : null}
        </DateFilterWrap>
      </SearchFilter>

      {filteredOrders.length === 0 ? (
        <Empty>
          Nenhum pedido encontrado.
        </Empty>
      ) : null}

      <List>
        {filteredOrders.map((order) => {
          const customerOrderNumber = customerOrderNumbers.get(order.id) ?? 1;
          const overdueMinutes = getOverdueMinutes(
            order,
            now,
            overdueOrderAlertEnabled,
            overdueOrderAlertMinutes,
          );
          const isOverdue = overdueMinutes !== null;

          return (
            <Card
              key={order.id}
              overdue={isOverdue}
              data-overdue={isOverdue}
              aria-label={isOverdue
                ? `Pedido ${order.id.slice(-6).toUpperCase()} em atraso`
                : undefined}
            >
              <CardGrid>
                <OrderInfo
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalhes do pedido ${order.id.slice(-6).toUpperCase()}`}
                  onClick={() => setDetailsOrderId(order.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setDetailsOrderId(order.id);
                    }
                  }}
                >
                <OrderHeader>
                  <DetailRow>
                    <Hash size={16} aria-hidden="true" />
                    <strong>Pedido #{order.id.slice(-6).toUpperCase()}</strong>
                  </DetailRow>
                  <StatusBadge>{statusLabel(order.status)}</StatusBadge>
                </OrderHeader>
                <DetailRow>
                  <UserRound size={16} aria-hidden="true" />
                  <CustomerName>{order.customer.name}</CustomerName>
                  <CustomerOrderBadge
                    title={`Este é o ${customerOrderNumber}º pedido de ${order.customer.name}.`}
                    aria-label={`Este é o ${customerOrderNumber}º pedido de ${order.customer.name}.`}
                  >
                    {customerOrderNumber}º
                  </CustomerOrderBadge>
                </DetailRow>
                <DetailRow>
                  <Truck size={16} aria-hidden="true" />
                  <span>{deliveryLabels[order.deliveryType]}</span>
                </DetailRow>
                <DetailRow>
                  <CreditCard size={16} aria-hidden="true" />
                  <span>
                    {order.paymentMethod
                      ? paymentLabels[order.paymentMethod]
                      : "Pagamento não informado"}
                  </span>
                </DetailRow>
                {hasCashChange(order) ? (
                  <DetailRow>
                    <Banknote size={16} aria-hidden="true" />
                    <span>Troco para {money(order.changeForCents!)}</span>
                  </DetailRow>
                ) : null}
                <CardFooter>
                  <ReceivedTime overdue={isOverdue}>
                    <Clock3 size={14} aria-hidden="true" />
                    {formatReceivedAgo(order, now, overdueMinutes)}
                  </ReceivedTime>
                  <CardTotal>{money(order.totals.totalCents)}</CardTotal>
                </CardFooter>
              </OrderInfo>

              <ActionsPanel>
                <Field label="Status">
                  <Select
                    value={order.status}
                    onChange={(event) =>
                      updateStatus(order, event.target.value as OrderStatus)
                    }
                    disabled={order.status === "CANCELED"}
                  >
                    <option value={order.status}>{statusLabel(order.status)}</option>
                    {nextStatuses.filter((status) => status !== order.status).map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <ButtonRow>
                  <Button variant="outline" onClick={() => printOrder(order)}>
                    <Printer size={16} />
                    Imprimir
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setSelectedOrderId(order.id)}
                    disabled={order.status === "CANCELED"}
                  >
                    <Ban size={16} />
                    Cancelar
                  </Button>
                </ButtonRow>
                {selectedOrderId === order.id ? (
                  <CancelBox>
                    <Textarea
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      placeholder="Motivo"
                    />
                    <Button variant="danger" onClick={() => cancelOrder(order)}>
                      Confirmar cancelamento
                    </Button>
                  </CancelBox>
                ) : null}
                </ActionsPanel>
              </CardGrid>
            </Card>
          );
        })}
      </List>

      {detailsOrder ? (
        <ModalOverlay
          role="presentation"
          onClick={() => setDetailsOrderId("")}
        >
          <Modal
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <div>
                <Title id="order-details-title">
                  Pedido #{detailsOrder.id.slice(-6).toUpperCase()}
                </Title>
                <Subtitle>{statusLabel(detailsOrder.status)}</Subtitle>
                {detailsOverdueMinutes !== null ? (
                  <ReceivedTime overdue>
                    <Clock3 size={14} aria-hidden="true" />
                    {formatReceivedAgo(detailsOrder, now, detailsOverdueMinutes)}
                  </ReceivedTime>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                aria-label="Fechar detalhes"
                title="Fechar detalhes"
                onClick={() => setDetailsOrderId("")}
              >
                <X size={16} />
              </Button>
            </ModalHeader>

            <ModalBody>
              <ModalSection>
                <ModalSectionTitle>
                  <UserRound size={18} aria-hidden="true" />
                  Cliente
                </ModalSectionTitle>
                <ModalInfoGrid>
                  <ModalInfo>
                    <UserRound size={16} aria-hidden="true" />
                    <div>
                      <ModalLabel>Nome</ModalLabel>
                      <strong>{detailsOrder.customer.name}</strong>
                    </div>
                  </ModalInfo>
                  <ModalInfo>
                    <Phone size={16} aria-hidden="true" />
                    <div>
                      <ModalLabel>Celular</ModalLabel>
                      <strong>{detailsOrder.customer.phone}</strong>
                    </div>
                  </ModalInfo>
                  <ModalInfo>
                    <Truck size={16} aria-hidden="true" />
                    <div>
                      <ModalLabel>Entrega</ModalLabel>
                      <strong>{deliveryLabels[detailsOrder.deliveryType]}</strong>
                    </div>
                  </ModalInfo>
                  <ModalInfo>
                    <CreditCard size={16} aria-hidden="true" />
                    <div>
                      <ModalLabel>Pagamento</ModalLabel>
                      <strong>
                        {detailsOrder.paymentMethod
                          ? paymentLabels[detailsOrder.paymentMethod]
                          : "Pagamento não informado"}
                      </strong>
                    </div>
                  </ModalInfo>
                  {hasCashChange(detailsOrder) ? (
                    <ModalInfo>
                      <Banknote size={16} aria-hidden="true" />
                      <div>
                        <ModalLabel>Troco para</ModalLabel>
                        <strong>{money(detailsOrder.changeForCents!)}</strong>
                      </div>
                    </ModalInfo>
                  ) : null}
                </ModalInfoGrid>
              </ModalSection>

              <ModalSection>
                <ModalSectionTitle>
                  <MapPin size={18} aria-hidden="true" />
                  Endereço de entrega
                </ModalSectionTitle>
                <p>
                  {detailsOrder.deliveryType === "PICKUP"
                    ? "Retirada no restaurante"
                    : detailsAddress || "Endereço não informado"}
                </p>
                {mapsUrl ? (
                  <MapsLink href={mapsUrl} target="_blank" rel="noreferrer">
                    Ver no Google Maps
                    <ExternalLink size={14} aria-hidden="true" />
                  </MapsLink>
                ) : null}
              </ModalSection>

              <ModalSection>
                <ModalSectionTitle>
                  <ShoppingBag size={18} aria-hidden="true" />
                  Produtos
                </ModalSectionTitle>
                <ItemList>
                  {detailsOrder.items.map((item, index) => (
                    <Item key={`${detailsOrder.id}-${item.productId}-${index}`}>
                      <ModalProductHeader>
                        <strong>{item.quantity}x {item.name}</strong>
                        <strong>{money(item.totalCents)}</strong>
                      </ModalProductHeader>
                      {item.options.length > 0 ? (
                        <ModalProductMeta>
                          {item.options.map((option) => option.itemName).join(", ")}
                        </ModalProductMeta>
                      ) : null}
                      {item.observations ? (
                        <ModalProductMeta>Observação: {item.observations}</ModalProductMeta>
                      ) : null}
                    </Item>
                  ))}
                </ItemList>
              </ModalSection>

              <ModalSection>
                <ModalSectionTitle>
                  <ReceiptText size={18} aria-hidden="true" />
                  Valores
                </ModalSectionTitle>
                <Totals>
                  <TotalRow>
                    <span>Subtotal</span>
                    <strong>{money(detailsOrder.totals.subtotalCents)}</strong>
                  </TotalRow>
                  <TotalRow>
                    <span>Frete</span>
                    <strong>{money(detailsOrder.totals.deliveryFeeCents)}</strong>
                  </TotalRow>
                  <TotalRow>
                    <span>Desconto</span>
                    <strong>{money(detailsOrder.totals.discountCents)}</strong>
                  </TotalRow>
                  <TotalRow emphasis>
                    <span>Total</span>
                    <strong>{money(detailsOrder.totals.totalCents)}</strong>
                  </TotalRow>
                </Totals>
              </ModalSection>
            </ModalBody>
            <ModalFooter>
              <ButtonRow>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => printOrder(detailsOrder)}
                >
                  <Printer size={16} />
                  Imprimir
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={detailsOrder.status === "CANCELED" || detailsOrder.status === "COMPLETED"}
                  onClick={() => {
                    setSelectedOrderId((current) => current === detailsOrder.id ? "" : detailsOrder.id);
                    setCancelReason("");
                  }}
                >
                  <Ban size={16} />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={!detailsNextStatus}
                  onClick={() => {
                    if (detailsNextStatus) {
                      updateStatus(detailsOrder, detailsNextStatus);
                    }
                  }}
                >
                  {detailsNextStatus
                    ? nextStatusLabels[detailsNextStatus]
                    : detailsOrder.status === "CANCELED" ? "Pedido cancelado" : "Pedido concluído"}
                </Button>
              </ButtonRow>
              {selectedOrderId === detailsOrder.id ? (
                <CancelBox>
                  <Field label="Motivo do cancelamento">
                    <Textarea
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                    />
                  </Field>
                  <Button variant="danger" onClick={() => cancelOrder(detailsOrder)}>
                    Confirmar cancelamento
                  </Button>
                </CancelBox>
              ) : null}
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      ) : null}

    </Root>
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getReceivedAt(order: OrderResponse) {
  return order.statusHistory.find((history) => history.status === "RECEIVED")?.changedAt
    ?? order.createdAt;
}

function getOverdueMinutes(
  order: OrderResponse,
  now: number,
  enabled = false,
  minutes = 30,
) : number | null {
  if (!enabled || !["RECEIVED", "CONFIRMED", "PREPARING"].includes(order.status)) {
    return null;
  }

  const receivedAt = getReceivedAt(order);
  const timestamp = receivedAt ? new Date(receivedAt).getTime() : Number.NaN;
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const elapsedMinutes = Math.floor((now - timestamp) / 60_000);
  const overdueMinutes = elapsedMinutes - minutes;
  return overdueMinutes > 0 ? overdueMinutes : null;
}

function localDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return dateKey(date);
}

function getPresetDateRange(preset: Exclude<DatePreset, "custom">) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);

  if (preset === "last7") {
    start.setDate(start.getDate() - 6);
  } else if (preset === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset === "thisMonth") {
    start.setDate(1);
  }

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

function hasCashChange(order: OrderResponse) {
  return order.paymentMethod === "CASH"
    && order.changeForCents != null
    && order.changeForCents > 0;
}

function getNextOrderStatus(order: OrderResponse): OrderStatus | null {
  if (order.status === "RECEIVED") return "CONFIRMED";
  if (order.status === "CONFIRMED") return "PREPARING";
  if (order.status === "PREPARING") return "READY";
  if (order.status === "READY") {
    return order.deliveryType === "DELIVERY" ? "OUT_FOR_DELIVERY" : "COMPLETED";
  }
  if (order.status === "OUT_FOR_DELIVERY") return "COMPLETED";
  return null;
}

function formatReceivedAgo(order: OrderResponse, now: number, overdueMinutes: number | null = null) {
  if (overdueMinutes !== null) {
    return `⚠ Atrasado há ${formatOverdueDuration(overdueMinutes)}`;
  }

  const receivedAt = getReceivedAt(order);

  if (!receivedAt) {
    return "Horário de recebimento indisponível";
  }

  const timestamp = new Date(receivedAt).getTime();

  if (Number.isNaN(timestamp)) {
    return "Horário de recebimento indisponível";
  }

  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));

  if (minutes < 1) {
    return "Recebido agora";
  }

  if (minutes < 60) {
    return `Recebido há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Recebido há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  const days = Math.floor(hours / 24);
  return `Recebido há ${days} ${days === 1 ? "dia" : "dias"}`;
}

function formatOverdueDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${String(remainingMinutes).padStart(2, "0")} min`;
}

function buildCustomerOrderNumbers(orders: OrderResponse[]) {
  const groupedOrders = new Map<string, OrderResponse[]>();

  for (const order of orders) {
    const phone = order.customer.phone.replace(/\D/g, "");
    const customerKey = phone || normalizeSearch(order.customer.name);
    const customerOrders = groupedOrders.get(customerKey) ?? [];
    customerOrders.push(order);
    groupedOrders.set(customerKey, customerOrders);
  }

  const orderNumbers = new Map<string, number>();

  for (const customerOrders of groupedOrders.values()) {
    customerOrders
      .sort((left, right) => orderTimestamp(left) - orderTimestamp(right)
        || left.id.localeCompare(right.id))
      .forEach((order, index) => orderNumbers.set(order.id, index + 1));
  }

  return orderNumbers;
}

function orderTimestamp(order: OrderResponse) {
  const value = getReceivedAt(order);

  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function formatAddress(address: OrderResponse["deliveryAddress"]) {
  const street = [address?.street?.trim(), address?.number?.trim()]
    .filter(Boolean)
    .join(", ");
  const cityState = [address?.city?.trim(), address?.state?.trim()]
    .filter(Boolean)
    .join(" - ");

  return [
    street,
    address?.complement?.trim(),
    address?.neighborhood?.trim(),
    cityState,
    address?.zipCode?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}
