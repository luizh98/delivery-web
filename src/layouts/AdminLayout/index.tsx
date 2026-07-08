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
import styles from "./styles.module.css";

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
        <div className={styles.root}>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <div>
                <p className={styles.tenant}>
                  {admin.tenantSlug}
                </p>
                <p className={styles.email}>{admin.email}</p>
              </div>
              <LogoutButton />
            </div>
            <nav className={styles.nav}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    className={styles.navLink}
                    href={item.href}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <PageShell>{children}</PageShell>
        </div>
      </ConfirmationProvider>
    </ToastProvider>
  );
}
