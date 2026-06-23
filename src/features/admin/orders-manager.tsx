"use client";

import { useState } from "react";
import { Ban, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { clientApi } from "@/lib/api/client";
import { money, statusLabel } from "@/lib/format";
import type { OrderResponse, OrderStatus } from "@/types/api";

const nextStatuses: OrderStatus[] = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

type OrdersManagerProps = {
  initialOrders: OrderResponse[];
  title: string;
  compact?: boolean;
};

export function OrdersManager({ initialOrders, title, compact }: OrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [printText, setPrintText] = useState("");

  async function updateStatus(order: OrderResponse, status: OrderStatus) {
    const updated = await clientApi<OrderResponse>(`admin/orders/${order.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function cancelOrder(order: OrderResponse) {
    if (!cancelReason.trim()) {
      return;
    }
    const updated = await clientApi<OrderResponse>(`admin/orders/${order.id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: cancelReason }),
    });
    setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedOrderId("");
    setCancelReason("");
  }

  async function printOrder(order: OrderResponse) {
    const response = await fetch(`/api/backend/admin/orders/${order.id}/print`);
    setPrintText(await response.text());
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted">{orders.length} pedido(s)</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
          Atualizar
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-6 text-sm text-muted">
          Nenhum pedido encontrado.
        </div>
      ) : null}

      <section className="grid gap-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-md border border-border bg-surface p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">{order.customer.name}</h2>
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {statusLabel(order.status)}
                  </span>
                  <span className="text-xs text-muted">{order.deliveryType}</span>
                </div>
                <p className="text-sm text-muted">{order.customer.phone}</p>
                <div className="grid gap-1">
                  {order.items.map((item) => (
                    <p key={`${order.id}-${item.productId}-${item.name}`} className="text-sm">
                      {item.quantity}x {item.name} · {money(item.totalCents)}
                    </p>
                  ))}
                </div>
                {!compact ? (
                  <p className="text-sm font-bold text-primary">
                    Total {money(order.totals.totalCents)}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
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
                <div className="flex gap-2">
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
                </div>
                {selectedOrderId === order.id ? (
                  <div className="grid gap-2">
                    <Textarea
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      placeholder="Motivo"
                    />
                    <Button variant="danger" onClick={() => cancelOrder(order)}>
                      Confirmar cancelamento
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      {printText ? (
        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="font-bold">Impressao</h2>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md bg-surface-muted p-3 text-sm">
            {printText}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
