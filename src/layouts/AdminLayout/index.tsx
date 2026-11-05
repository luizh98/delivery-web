import { AdminOrderEventsProvider } from "@/components/AdminOrderEvents";
import { AdminOrderSoundProvider } from "@/components/AdminOrderSoundNotifier";
import { ConfirmationProvider } from "@/components/ConfirmationProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { AdminShell } from "./AdminShell";
import { TableServiceAlerts } from "@/components/TableServiceAlerts";
import type { AdminLayoutProps } from "./types";

export function AdminLayout({ admin, restaurantName, storeOpen, children }: AdminLayoutProps) {
  return (
    <ToastProvider>
      <AdminOrderEventsProvider>
        <AdminOrderSoundProvider>
          <ConfirmationProvider>
            <AdminShell admin={admin} restaurantName={restaurantName} storeOpen={storeOpen}>
              {admin.roles.includes("ADMIN") ? <TableServiceAlerts /> : null}{children}
            </AdminShell>
          </ConfirmationProvider>
        </AdminOrderSoundProvider>
      </AdminOrderEventsProvider>
    </ToastProvider>
  );
}
