import { AdminOnly } from "@/components/AdminOnly";
import { AdminAuditLogsView } from "@/views/AdminAuditLogs";

export default function AdminLogsPage() {
  return <AdminOnly><AdminAuditLogsView /></AdminOnly>;
}
