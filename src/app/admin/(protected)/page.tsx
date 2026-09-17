import { redirect } from "next/navigation";
import { getAdminUser, getRestaurantConfig } from "@/services/api/server";
import { AdminPanelView } from "@/views/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [user, restaurantConfig] = await Promise.all([
    getAdminUser(),
    getRestaurantConfig(),
  ]);
  if (user?.roles.includes("ENTREGADOR")) {
    redirect("/admin/deliveries");
  }
  return <AdminPanelView initialRestaurantConfig={restaurantConfig} />;
}
