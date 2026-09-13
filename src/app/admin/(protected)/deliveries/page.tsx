import { getAdminUser } from "@/services/api/server";
import { AdminDeliveriesView } from "@/views/AdminDeliveries";
import { MotoboyOrdersView } from "@/views/MotoboyOrders";

export const dynamic = "force-dynamic";

export default async function AdminDeliveriesPage() {
  const user = await getAdminUser();
  return user?.roles.includes("MOTOBOY") ? <MotoboyOrdersView /> : <AdminDeliveriesView />;
}
