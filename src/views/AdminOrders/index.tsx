import { OrdersManager } from "@/components/OrdersManager";
import { getAdminOrders, getRestaurantConfig } from "@/services/api/server";

export async function AdminOrdersView() {
  const [orders, config] = await Promise.all([
    getAdminOrders(),
    getRestaurantConfig(),
  ]);

  return (
    <OrdersManager
      initialOrders={orders}
      title="Pedidos"
      automaticOrderConfirmation={config?.automaticOrderConfirmation}
    />
  );
}
