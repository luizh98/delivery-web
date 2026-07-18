"use client";

import { useState } from "react";
import { Ban, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Select, Textarea } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import { money, statusLabel } from "@/utils/format";
import type { OrderResponse, OrderStatus } from "@/types/api";
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
  StatusBadge,
  Subtitle,
  Title,
  Toolbar,
  Total,
} from "./styles";

const nextStatuses: OrderStatus[] = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

export function OrdersManager({ initialOrders, title, compact }: OrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [printText, setPrintText] = useState("");
  const { showToast } = useToast();

  async function updateStatus(order: OrderResponse, status: OrderStatus) {
    try {
      const updated = await clientApi<OrderResponse>(`admin/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      showToast("Pedido atualizado com sucesso");
    } catch {
      showToast("Nao foi possivel atualizar pedido.", "error");
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
      showToast("Nao foi possivel cancelar pedido.", "error");
    }
  }

  async function printOrder(order: OrderResponse) {
    const response = await fetch(`/api/backend/admin/orders/${order.id}/print`);
    setPrintText(await response.text());
  }

  return (
    <Root>
      <Toolbar>
        <div>
          <Title>{title}</Title>
          <Subtitle>{orders.length} pedido(s)</Subtitle>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
          Atualizar
        </Button>
      </Toolbar>

      {orders.length === 0 ? (
        <Empty>
          Nenhum pedido encontrado.
        </Empty>
      ) : null}

      <List>
        {orders.map((order) => (
          <Card key={order.id}>
            <CardGrid>
              <OrderInfo>
                <OrderHeader>
                  <CustomerName>{order.customer.name}</CustomerName>
                  <StatusBadge>{statusLabel(order.status)}</StatusBadge>
                  <MutedTiny>{order.deliveryType}</MutedTiny>
                </OrderHeader>
                <MutedText>{order.customer.phone}</MutedText>
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
                    {nextStatuses.map((status) => (
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
          <PrintTitle>Impressao</PrintTitle>
          <PrintBody>
            {printText}
          </PrintBody>
        </PrintSection>
      ) : null}
    </Root>
  );
}
