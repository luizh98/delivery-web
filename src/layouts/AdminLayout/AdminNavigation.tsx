"use client";

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CookingPot,
  LineChart,
  LayoutDashboard,
  Menu,
  Printer,
  Settings,
  Sparkles,
  Tags,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { CurrentUserResponse } from "@/types/api";
import { LogoutButton } from "./LogoutButton";
import {
  Brand,
  CloseButton,
  CompactSidebarFooter,
  DrawerHeader,
  Email,
  MenuButton,
  MobileDrawer,
  MobileHeader,
  Nav,
  NavLink,
  Overlay,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
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
  { href: "/admin/settings", label: "Configurações", icon: Settings, adminOnly: true },
];

type AdminNavigationProps = {
  admin: Pick<CurrentUserResponse, "email" | "roles" | "tenantSlug">;
};

type NavigationItemsProps = {
  isAdmin: boolean;
  isDesktopSidebarExpanded?: boolean;
  onNavigate?: () => void;
};

function NavigationItems({
  isAdmin,
  isDesktopSidebarExpanded,
  onNavigate,
}: NavigationItemsProps) {
  const pathname = usePathname();

  return (
    <>
      {navItems
        .filter((item) => !item.adminOnly || isAdmin)
        .map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/admin"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavLink
              key={item.href}
              as={Link}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              data-active={isActive}
              data-label={item.label}
              data-sidebar-expanded={isDesktopSidebarExpanded}
              title={isDesktopSidebarExpanded ? undefined : item.label}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
    </>
  );
}

function AccountSummary({ admin }: AdminNavigationProps) {
  return (
    <>
      <Tenant>{admin.tenantSlug}</Tenant>
      <Email>{admin.email}</Email>
    </>
  );
}

export function AdminNavigation({ admin }: AdminNavigationProps) {
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const isAdmin = admin.roles.includes("ADMIN");

  function openMobileMenu(event: ReactMouseEvent<HTMLButtonElement>) {
    menuButtonRef.current = event.currentTarget;
    setIsMenuOpen(true);
  }

  function closeMenu(returnFocus = true) {
    setIsMenuOpen(false);

    if (returnFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  function trapDrawerFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab" || !drawerRef.current) {
      return;
    }

    const focusable = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <Sidebar data-expanded={isDesktopSidebarExpanded}>
        <SidebarHeader data-expanded={isDesktopSidebarExpanded}>
          <MenuButton
            type="button"
            aria-label={isDesktopSidebarExpanded ? "Recolher menu" : "Expandir menu"}
            aria-controls="admin-desktop-navigation"
            aria-expanded={isDesktopSidebarExpanded}
            title={isDesktopSidebarExpanded ? "Recolher menu" : "Expandir menu"}
            onClick={() => setIsDesktopSidebarExpanded((isExpanded) => !isExpanded)}
          >
            {isDesktopSidebarExpanded ? (
              <ChevronLeft aria-hidden="true" size={22} />
            ) : (
              <ChevronRight aria-hidden="true" size={22} />
            )}
          </MenuButton>
          {isDesktopSidebarExpanded ? (
            <Brand as={Link} href="/admin">
              FlyFoods
            </Brand>
          ) : null}
        </SidebarHeader>
        <Nav
          id="admin-desktop-navigation"
          aria-label="Navegação principal"
          data-expanded={isDesktopSidebarExpanded}
        >
          <NavigationItems
            isAdmin={isAdmin}
            isDesktopSidebarExpanded={isDesktopSidebarExpanded}
          />
        </Nav>
        <CompactSidebarFooter data-expanded={isDesktopSidebarExpanded}>
          {isDesktopSidebarExpanded ? <AccountSummary admin={admin} /> : null}
          <LogoutButton iconOnly={!isDesktopSidebarExpanded} />
        </CompactSidebarFooter>
      </Sidebar>

      <MobileHeader>
        <Brand as={Link} href="/admin">
          FlyFoods
        </Brand>
        <MenuButton
          type="button"
          aria-label="Abrir menu de administração"
          aria-controls="admin-navigation"
          aria-expanded={isMenuOpen}
          aria-haspopup="dialog"
          onClick={openMobileMenu}
        >
          <Menu aria-hidden="true" size={22} />
        </MenuButton>
      </MobileHeader>

      {isMenuOpen ? (
        <>
          <Overlay
            type="button"
            aria-label="Fechar menu de administração"
            onClick={() => closeMenu()}
          />
          <MobileDrawer
            ref={drawerRef}
            id="admin-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de administração"
            onKeyDown={trapDrawerFocus}
          >
            <DrawerHeader>
              <Brand as={Link} href="/admin" onClick={() => closeMenu(false)}>
                FlyFoods
              </Brand>
              <CloseButton
                ref={closeButtonRef}
                type="button"
                aria-label="Fechar menu de administração"
                onClick={() => closeMenu()}
              >
                <X aria-hidden="true" size={22} />
              </CloseButton>
            </DrawerHeader>
            <Nav aria-label="Navegação principal">
              <NavigationItems
                isAdmin={isAdmin}
                onNavigate={() => closeMenu(false)}
              />
            </Nav>
            <SidebarFooter>
              <AccountSummary admin={admin} />
              <LogoutButton />
            </SidebarFooter>
          </MobileDrawer>
        </>
      ) : null}
    </>
  );
}
