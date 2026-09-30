import { AdminOnly } from "@/components/AdminOnly";

export default function AdminAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminOnly>{children}</AdminOnly>;
}
