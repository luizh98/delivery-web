import { PageShell } from "@/components/PageShell";
import { AdminNavigation } from "./AdminNavigation";
import { Content, Root } from "./styles";
import type { AdminLayoutProps } from "./types";

export function AdminShell({ admin, restaurantName, storeOpen, children, beforeLeave }: AdminLayoutProps & { beforeLeave?: () => Promise<boolean> }) {
  return <Root>
    <AdminNavigation admin={admin} restaurantName={restaurantName} storeOpen={storeOpen} beforeLeave={beforeLeave} />
    <Content><PageShell>{children}</PageShell></Content>
  </Root>;
}
