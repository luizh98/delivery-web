import { redirect } from "next/navigation";
import { ConfirmationProvider } from "@/components/ConfirmationProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { getAdminUser, getMenu, getRestaurantConfig, getStaffTables } from "@/services/api/server";
import { StaffTables } from "@/views/StaffTables";
import { TableCheckout } from "@/views/StaffTables/TableCheckout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Atendimento de mesas" };

export default async function HallPage({ searchParams }: { searchParams: Promise<{ table?: string; view?: string; session?: string }> }) {
  const query = await searchParams;
  const tableId = query.table;
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  if (!admin.roles.some((role) => role === "ADMIN" || role === "WAITER")) redirect("/admin");
  const [tables, config] = await Promise.all([getStaffTables(), getRestaurantConfig()]);
  if (query.view === "checkout") {
    const table = tables?.find((value) => value.id === tableId && value.active);
    if (!table) redirect("/hall");
    return <ToastProvider><ConfirmationProvider><TableCheckout key={`${table.id}:${query.session ?? table.session?.id ?? ""}`} table={table} expectedSessionId={query.session ?? table.session?.id} admin={admin} restaurantName={config?.name || admin.tenantSlug} storeOpen={config?.open !== false} /></ConfirmationProvider></ToastProvider>;
  }
  const menu = await getMenu("TABLE");
  return <ToastProvider><ConfirmationProvider><StaffTables initialTables={tables} initialMenu={menu} admin={admin} restaurantName={config?.name || admin.tenantSlug} storeOpen={config?.open !== false} initialTableId={tables?.some((table) => table.id === tableId) ? tableId : undefined} /></ConfirmationProvider></ToastProvider>;
}
