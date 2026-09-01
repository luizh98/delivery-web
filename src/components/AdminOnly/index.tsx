import { redirect } from "next/navigation";
import { getAdminUser } from "@/services/api/server";

export async function AdminOnly({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  if (!admin.roles.includes("ADMIN")) {
    redirect("/admin");
  }

  return children;
}
