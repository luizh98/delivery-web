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
import styles from "./styles.module.css";

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
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{orders.length} pedido(s)</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
          Atualizar
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          Nenhum pedido encontrado.
        </div>
      ) : null}

      <section className={styles.list}>
        {orders.map((order) => (
          <article key={order.id} className={styles.card}>
            <div className={styles.cardGrid}>
              <div className={styles.orderInfo}>
                <div className={styles.orderHeader}>
                  <h2 className={styles.customerName}>{order.customer.name}</h2>
                  <span className={styles.statusBadge}>
                    {statusLabel(order.status)}
                  </span>
                  <span className={styles.mutedTiny}>{order.deliveryType}</span>
                </div>
                <p className={styles.mutedText}>{order.customer.phone}</p>
                <div className={styles.itemList}>
                  {order.items.map((item) => (
                    <p key={`${order.id}-${item.productId}-${item.name}`} className={styles.item}>
                      {item.quantity}x {item.name} · {money(item.totalCents)}
                    </p>
                  ))}
                </div>
                {!compact ? (
                  <p className={styles.total}>
                    Total {money(order.totals.totalCents)}
                  </p>
                ) : null}
              </div>

              <div className={styles.actionsPanel}>
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
                <div className={styles.buttonRow}>
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
                  <div className={styles.cancelBox}>
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
        <section className={styles.printSection}>
          <h2 className={styles.printTitle}>Impressao</h2>
          <pre className={styles.printBody}>
            {printText}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
