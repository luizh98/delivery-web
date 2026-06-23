import { OrdersManager } from "@/features/admin/orders-manager";
import { getAdminOrders } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const orders = await getAdminOrders();
  const kitchenOrders = orders.filter((order) =>
    ["RECEIVED", "CONFIRMED", "PREPARING", "READY"].includes(order.status),
  );

  return <OrdersManager initialOrders={kitchenOrders} title="Cozinha" compact />;
}
