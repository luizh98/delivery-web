import { OrdersManager } from "@/components/OrdersManager";
import { getAdminOrders, getRestaurantConfig } from "@/services/api/server";
import type { OrderStatus } from "@/types/api";

const orderStatuses: OrderStatus[] = [
  "RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELED",
];

export async function AdminOrdersView() {
  const [orders, config] = await Promise.all([
    getAdminOrders(orderStatuses),
    getRestaurantConfig(),
  ]);

  return (
    <OrdersManager
      initialOrders={orders}
      title="Pedidos"
      automaticOrderConfirmation={config?.automaticOrderConfirmation}
      overdueOrderAlertEnabled={config?.overdueOrderAlertEnabled}
      overdueOrderAlertMinutes={config?.overdueOrderAlertMinutes}
    />
  );
}
