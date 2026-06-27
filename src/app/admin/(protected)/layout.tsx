import { redirect } from "next/navigation";
import { AdminLayout } from "@/layouts/AdminLayout";
import { getAdminUser } from "@/services/api/server";

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

  return <AdminLayout admin={admin}>{children}</AdminLayout>;
}
