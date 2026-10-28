import type { OrderResponse } from "@/types/api";

export function stalledOrderHours(order: OrderResponse, now: number): number | null {
  if (order.status === "COMPLETED" || order.status === "CANCELED") return null;
  const changedAt = order.statusHistory.findLast((entry) => entry.status === order.status)?.changedAt
    ?? order.createdAt;
  const elapsed = now - Date.parse(changedAt ?? "");
  return elapsed > 86_400_000 ? Math.floor(elapsed / 3_600_000) : null;
}
