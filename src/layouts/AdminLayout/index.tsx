import { AdminOrderEventsProvider } from "@/components/AdminOrderEvents";
import { AdminOrderSoundProvider } from "@/components/AdminOrderSoundNotifier";
import { ConfirmationProvider } from "@/components/ConfirmationProvider";
import { PageShell } from "@/components/PageShell";
import { ToastProvider } from "@/components/ToastProvider";
import { AdminNavigation } from "./AdminNavigation";
import { Content, Root } from "./styles";
import type { AdminLayoutProps } from "./types";

export function AdminLayout({ admin, children }: AdminLayoutProps) {
  return (
    <ToastProvider>
      <AdminOrderEventsProvider>
        <AdminOrderSoundProvider>
          <ConfirmationProvider>
            <Root>
              <AdminNavigation admin={admin} />
              <Content>
                <PageShell>{children}</PageShell>
              </Content>
            </Root>
          </ConfirmationProvider>
        </AdminOrderSoundProvider>
      </AdminOrderEventsProvider>
    </ToastProvider>
  );
}
