import { AdminOrderEventsProvider } from "@/components/AdminOrderEvents";
import { AdminOrderSoundProvider } from "@/components/AdminOrderSoundNotifier";
import { ConfirmationProvider } from "@/components/ConfirmationProvider";
import { PageShell } from "@/components/PageShell";
import { ToastProvider } from "@/components/ToastProvider";
import { AdminNavigation } from "./AdminNavigation";
import { TableServiceAlerts } from "@/components/TableServiceAlerts";
import { Content, Root } from "./styles";
import type { AdminLayoutProps } from "./types";

export function AdminLayout({ admin, restaurantName, storeOpen, children }: AdminLayoutProps) {
  return (
    <ToastProvider>
      <AdminOrderEventsProvider>
        <AdminOrderSoundProvider>
          <ConfirmationProvider>
            <Root>
              <AdminNavigation admin={admin} restaurantName={restaurantName} storeOpen={storeOpen} />
              <Content>
                <PageShell>{admin.roles.includes("ADMIN") ? <TableServiceAlerts /> : null}{children}</PageShell>
              </Content>
            </Root>
          </ConfirmationProvider>
        </AdminOrderSoundProvider>
      </AdminOrderEventsProvider>
    </ToastProvider>
  );
}
