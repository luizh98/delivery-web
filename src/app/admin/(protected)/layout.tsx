import { redirect } from "next/navigation";
import { AdminLayout } from "@/layouts/AdminLayout";
import { getAdminUser, getRestaurantConfig } from "@/services/api/server";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const restaurantConfig = await getRestaurantConfig();
  const restaurantName = restaurantConfig?.name?.trim() || admin.tenantSlug;

  return (
    <AdminLayout admin={admin} restaurantName={restaurantName}>
      {children}
    </AdminLayout>
  );
}
