import { AdminOnly } from "@/components/AdminOnly";

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminOnly>{children}</AdminOnly>;
}
