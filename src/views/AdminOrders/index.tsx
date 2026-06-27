import { OrdersManager } from "@/components/OrdersManager";
import { getAdminOrders } from "@/services/api/server";

export async function AdminOrdersView() {
  const orders = await getAdminOrders();

  return <OrdersManager initialOrders={orders} title="Pedidos" />;
}
