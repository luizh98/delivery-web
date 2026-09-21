import { OrdersManager } from "@/components/OrdersManager";
import { getAdminOrders, getRestaurantConfig } from "@/services/api/server";
import type { OrderStatus } from "@/types/api";

const statuses: OrderStatus[] = [
  "RECEIVED", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELED",
];

export async function AdminTableOrdersView() {
  const [orders, config] = await Promise.all([getAdminOrders(statuses), getRestaurantConfig()]);
  return <OrdersManager
    initialOrders={orders.filter((order) => order.deliveryType === "TABLE")}
    title="Pedidos mesa"
    automaticOrderConfirmation={config?.automaticOrderConfirmation}
    overdueOrderAlertEnabled={config?.overdueOrderAlertEnabled}
    overdueOrderAlertMinutes={config?.overdueOrderAlertMinutes}
  />;
}
