import type { OrderResponse } from "@/types/api";

const overdueOrderStatuses = ["RECEIVED", "CONFIRMED", "PREPARING"];

export function getOrderOverdueMinutes(
  order: OrderResponse,
  now: number,
  minutes: number,
): number | null {
  if (!overdueOrderStatuses.includes(order.status)) {
    return null;
  }

  const receivedAt = order.statusHistory.find((history) => history.status === "RECEIVED")
    ?.changedAt ?? order.createdAt;
  const timestamp = receivedAt ? new Date(receivedAt).getTime() : Number.NaN;
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const orderDate = new Date(timestamp);
  const today = new Date(now);
  const isFromToday = orderDate.getFullYear() === today.getFullYear()
    && orderDate.getMonth() === today.getMonth()
    && orderDate.getDate() === today.getDate();
  const overdueMilliseconds = now - timestamp - minutes * 60_000;

  if (!isFromToday || overdueMilliseconds <= 0) {
    return null;
  }

  return Math.floor(overdueMilliseconds / 60_000);
}
