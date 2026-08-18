"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Ban,
  BellRing,
  CircleCheck,
  CircleX,
  Clock3,
  CookingPot,
  Inbox,
  Maximize2,
  Minimize2,
  Printer,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input, Select, Textarea } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
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
  CancelBox,
  Card,
  CardGrid,
  CustomerName,
  Empty,
  Item,
  ItemList,
  List,
  MutedText,
  MutedTiny,
  OrderHeader,
  OrderInfo,
  PrintBody,
  PrintSection,
  PrintTitle,
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
  Total,
} from "./styles";

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

export function OrdersManager({ initialOrders, title, compact }: OrdersManagerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [printText, setPrintText] = useState("");
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

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
    const printWindow = window.open("", "_blank", "popup,width=480,height=640");

    if (!printWindow) {
      showToast("Permita pop-ups para imprimir o pedido.", "error");
      return;
    }

    printWindow.document.body.textContent = "Preparando impressão...";

    try {
      const response = await fetch(`/api/backend/admin/orders/${order.id}/print`);

      if (!response.ok) {
        throw new Error("Não foi possível carregar impressão do pedido.");
      }

      const content = await response.text();
      const printBody = printWindow.document.createElement("pre");

      setPrintText(content);
      printWindow.document.title = "Impressão do pedido";
      printWindow.document.documentElement.lang = "pt-BR";
      printWindow.document.body.replaceChildren(printBody);
      printWindow.document.body.style.margin = "0";
      printWindow.document.body.style.padding = "1rem";
      printBody.style.margin = "0";
      printBody.style.whiteSpace = "pre-wrap";
      printBody.style.fontFamily = "monospace";
      printBody.textContent = content;
      printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
      printWindow.focus();
      printWindow.print();
    } catch {
      printWindow.close();
      showToast("Não foi possível imprimir pedido.", "error");
    }
  }

  return (
    <Root ref={rootRef}>
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
              <StatusFilterLabel>{statusLabel(status)}</StatusFilterLabel>
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
        <Field label="Data inicial">
          <Input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </Field>
        <Field label="Data final">
          <Input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </Field>
      </SearchFilter>

      {filteredOrders.length === 0 ? (
        <Empty>
          Nenhum pedido encontrado.
        </Empty>
      ) : null}

      <List>
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardGrid>
              <OrderInfo>
                <OrderHeader>
                  <CustomerName>{order.customer.name}</CustomerName>
                  <StatusBadge>{statusLabel(order.status)}</StatusBadge>
                  <MutedTiny>{deliveryLabels[order.deliveryType]}</MutedTiny>
                  <MutedTiny>
                    {order.paymentMethod
                      ? paymentLabels[order.paymentMethod]
                      : "Pagamento não informado"}
                  </MutedTiny>
                </OrderHeader>
                <MutedText>
                  Pedido #{order.id.slice(-6).toUpperCase()} · {order.customer.phone}
                </MutedText>
                <ReceivedTime>
                  <Clock3 size={14} aria-hidden="true" />
                  {formatReceivedAgo(order, now)}
                </ReceivedTime>
                <ItemList>
                  {order.items.map((item) => (
                    <Item key={`${order.id}-${item.productId}-${item.name}`}>
                      {item.quantity}x {item.name} - {money(item.totalCents)}
                    </Item>
                  ))}
                </ItemList>
                {!compact ? (
                  <Total>
                    Total {money(order.totals.totalCents)}
                  </Total>
                ) : null}
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
        ))}
      </List>

      {printText ? (
        <PrintSection>
          <PrintTitle>Impressão</PrintTitle>
          <PrintBody>
            {printText}
          </PrintBody>
        </PrintSection>
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

function localDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatReceivedAgo(order: OrderResponse, now: number) {
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
