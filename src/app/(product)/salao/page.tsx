import { redirect } from "next/navigation";
import { ConfirmationProvider } from "@/components/ConfirmationProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { getAdminUser, getMenu, getRestaurantConfig, getStaffTables } from "@/services/api/server";
import { StaffTables } from "@/views/StaffTables";

export const dynamic = "force-dynamic";

export default async function SalonPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  if (!admin.roles.some((role) => role === "ADMIN" || role === "WAITER")) redirect("/admin");
  const [tables, menu, config] = await Promise.all([getStaffTables(), getMenu(), getRestaurantConfig()]);
  return <ToastProvider><ConfirmationProvider><StaffTables initialTables={tables} initialMenu={menu} admin={admin} restaurantName={config?.name || admin.tenantSlug} /></ConfirmationProvider></ToastProvider>;
}
