import { redirect } from "next/navigation";
import { AdminShell } from "@/features/admin/admin-shell";
import { getAdminUser } from "@/lib/api/server";

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

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
