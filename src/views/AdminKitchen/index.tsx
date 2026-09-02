import { OrdersManager } from "@/components/OrdersManager";
import { getAdminOrders, getRestaurantConfig } from "@/services/api/server";
import type { OrderStatus } from "@/types/api";

const kitchenStatuses: OrderStatus[] = ["RECEIVED", "CONFIRMED", "PREPARING", "READY"];

export async function AdminKitchenView() {
  const [orders, config] = await Promise.all([
    getAdminOrders(kitchenStatuses),
    getRestaurantConfig(),
  ]);

  return (
    <OrdersManager
      initialOrders={orders}
      visibleStatuses={kitchenStatuses}
      title="Cozinha"
      compact
      automaticOrderConfirmation={config?.automaticOrderConfirmation}
      overdueOrderAlertEnabled={config?.overdueOrderAlertEnabled}
      overdueOrderAlertMinutes={config?.overdueOrderAlertMinutes}
    />
  );
}
