import { AdminOnly } from "@/components/AdminOnly";

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminOnly>{children}</AdminOnly>;
}
