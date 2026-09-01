import {
  ClipboardList,
  CookingPot,
  LineChart,
  LayoutDashboard,
  Printer,
  Settings,
  Sparkles,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AdminOrderSoundProvider } from "@/components/AdminOrderSoundNotifier";
import { ConfirmationProvider } from "@/components/ConfirmationProvider";
import { PageShell } from "@/components/PageShell";
import { ToastProvider } from "@/components/ToastProvider";
import { LogoutButton } from "./LogoutButton";
import type { AdminLayoutProps } from "./types";
import {
  Brand,
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
  { href: "/admin/analytics", label: "Análises", icon: LineChart, adminOnly: true },
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/users", label: "Usuários", icon: UserCog, adminOnly: true },
  { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
  { href: "/admin/catalog/upsell", label: "Campanhas", icon: Sparkles },
  { href: "/admin/printer", label: "Impressora", icon: Printer },
  { href: "/admin/settings", label: "Config", icon: Settings, adminOnly: true },
];

export function AdminLayout({
  admin,
  children,
}: AdminLayoutProps) {
  return (
    <ToastProvider>
      <AdminOrderSoundProvider>
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
                <Brand as={Link} href="/admin">
                  FlyFoods
                </Brand>
                {navItems
                  .filter(
                    (item) => !item.adminOnly || admin.roles.includes("ADMIN"),
                  )
                  .map((item) => {
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
      </AdminOrderSoundProvider>
    </ToastProvider>
  );
}
