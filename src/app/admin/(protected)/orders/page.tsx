import { OrdersManager } from "@/features/admin/orders-manager";
import { getAdminOrders } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return <OrdersManager initialOrders={orders} title="Pedidos" />;
}
