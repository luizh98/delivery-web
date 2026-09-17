import { redirect } from "next/navigation";
import { getAdminUser } from "@/services/api/server";
import { AdminPanelView } from "@/views/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getAdminUser();
  if (user?.roles.includes("ENTREGADOR")) {
    redirect("/admin/deliveries");
  }
  return <AdminPanelView />;
}
