import { OrdersManager } from "@/components/OrdersManager";
import { getAdminOrders } from "@/services/api/server";

export async function AdminKitchenView() {
  const orders = await getAdminOrders();
  const kitchenOrders = orders.filter((order) =>
    ["RECEIVED", "CONFIRMED", "PREPARING", "READY"].includes(order.status),
  );

  return <OrdersManager initialOrders={kitchenOrders} title="Cozinha" compact />;
}
