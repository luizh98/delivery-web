import {
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  Settings,
  Tags,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/ui/page-shell";
import type { CurrentUserResponse } from "@/types/api";
import { LogoutButton } from "@/features/admin/logout-button";

const navItems = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
  { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
  { href: "/admin/settings", label: "Config", icon: Settings },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: CurrentUserResponse;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase text-muted">
              {admin.tenantSlug}
            </p>
            <p className="font-bold">{admin.email}</p>
          </div>
          <LogoutButton />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                className="inline-flex h-10 min-w-max items-center gap-2 rounded-md px-3 text-sm font-semibold hover:bg-surface-muted"
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
  );
}
