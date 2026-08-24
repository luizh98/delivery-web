import { OrdersManager } from "@/components/OrdersManager";
import { getAdminOrders, getRestaurantConfig } from "@/services/api/server";

export async function AdminKitchenView() {
  const [orders, config] = await Promise.all([
    getAdminOrders(),
    getRestaurantConfig(),
  ]);
  const kitchenOrders = orders.filter((order) =>
    ["RECEIVED", "CONFIRMED", "PREPARING", "READY"].includes(order.status),
  );

  return (
    <OrdersManager
      initialOrders={kitchenOrders}
      allOrders={orders}
      title="Cozinha"
      compact
      automaticOrderConfirmation={config?.automaticOrderConfirmation}
    />
  );
}
