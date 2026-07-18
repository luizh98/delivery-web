import {
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  Settings,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { ConfirmationProvider } from "@/components/ConfirmationProvider";
import { PageShell } from "@/components/PageShell";
import { ToastProvider } from "@/components/ToastProvider";
import { LogoutButton } from "./LogoutButton";
import type { AdminLayoutProps } from "./types";
import {
  Email,
  Header,
  HeaderInner,
  Nav,
  NavLink,
  Root,
  Tenant,
} from "./styles";

const navItems = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
  { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
  { href: "/admin/settings", label: "Config", icon: Settings },
];

export function AdminLayout({
  admin,
  children,
}: AdminLayoutProps) {
  return (
    <ToastProvider>
      <ConfirmationProvider>
        <Root>
          <Header>
            <HeaderInner>
              <div>
                <Tenant>
                  {admin.tenantSlug}
                </Tenant>
                <Email>{admin.email}</Email>
              </div>
              <LogoutButton />
            </HeaderInner>
            <Nav>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    as={Link}
                    href={item.href}
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </Nav>
          </Header>
          <PageShell>{children}</PageShell>
        </Root>
      </ConfirmationProvider>
    </ToastProvider>
  );
}
