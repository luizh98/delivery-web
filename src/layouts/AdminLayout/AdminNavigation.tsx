"use client";

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Bike,
  CookingPot,
  LineChart,
  LayoutDashboard,
  Menu,
  Megaphone,
  Printer,
  Settings,
  Sparkles,
  Store,
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
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { CurrentUserResponse, RestaurantConfigResponse } from "@/types/api";
import { LogoutButton } from "./LogoutButton";
import {
  Brand,
  CloseButton,
  DesktopNavbar,
  DesktopNavbarActions,
  DesktopNavbarBrand,
  DesktopNavbarIdentity,
  DesktopNavbarUser,
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
  Tenant,
} from "./styles";

const navItems = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Análises", icon: LineChart, adminOnly: true },
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
  { href: "/admin/deliveries", label: "Entregas", motoboyLabel: "Pedidos", icon: Bike },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/users", label: "Usuários", icon: UserCog, adminOnly: true },
  { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
  { href: "/admin/catalog/upsell", label: "Campanhas", icon: Sparkles },
  { href: "/admin/marketing/promotions", label: "Marketing", icon: Megaphone },
  { href: "/admin/printer", label: "Impressora", icon: Printer },
  { href: "/admin/settings", label: "Configurações", icon: Settings, adminOnly: true },
];

type AdminNavigationProps = {
  admin: Pick<CurrentUserResponse, "email" | "roles" | "tenantSlug">;
  restaurantName: string;
  storeOpen: boolean;
};

type AccountSummaryProps = {
  admin: Pick<CurrentUserResponse, "email" | "tenantSlug">;
};

type NavigationItemsProps = {
  isAdmin: boolean;
  isMotoboy: boolean;
  isDesktopSidebarExpanded?: boolean;
  onNavigate?: () => void;
};

function NavigationItems({
  isAdmin,
  isMotoboy,
  isDesktopSidebarExpanded,
  onNavigate,
}: NavigationItemsProps) {
  const pathname = usePathname();

  return (
    <>
      {navItems
        .filter((item) => isMotoboy ? item.href === "/admin/deliveries" : !item.adminOnly || isAdmin)
        .map((item) => {
          const Icon = item.icon;
          const label = isMotoboy ? item.motoboyLabel ?? item.label : item.label;
          const isActive = item.href === "/admin"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavLink
              key={item.href}
              as={Link}
              href={item.href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              data-active={isActive}
              data-label={label}
              data-sidebar-expanded={isDesktopSidebarExpanded}
              title={isDesktopSidebarExpanded ? undefined : label}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          );
        })}
    </>
  );
}

function AccountSummary({ admin }: AccountSummaryProps) {
  return (
    <>
      <Tenant>{admin.tenantSlug}</Tenant>
      <Email>{admin.email}</Email>
    </>
  );
}

function StoreAvailabilityButton({ initialStoreOpen }: { initialStoreOpen: boolean }) {
  const [storeOpen, setStoreOpen] = useState(initialStoreOpen);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();

  async function changeAvailability() {
    const nextOpen = !storeOpen;
    const confirmed = await requestConfirmation({
      message: nextOpen
        ? "Deseja abrir a loja até o fim de hoje?"
        : "Deseja fechar a loja até o fim de hoje?",
      confirmLabel: nextOpen ? "Abrir loja" : "Fechar loja",
      variant: nextOpen ? "primary" : "danger",
    });

    if (!confirmed) {
      return;
    }

    setUpdatingAvailability(true);
    try {
      const updatedConfig = await clientApi<RestaurantConfigResponse>(
        "admin/restaurant/config/availability",
        {
          method: "PUT",
          body: JSON.stringify({ open: nextOpen }),
        },
      );
      setStoreOpen(updatedConfig.open !== false);
      showToast(nextOpen ? "Loja aberta até o fim de hoje." : "Loja fechada até o fim de hoje.");
    } catch {
      showToast("Não foi possível atualizar o status da loja.", "error");
    } finally {
      setUpdatingAvailability(false);
    }
  }

  return (
    <Button
      type="button"
      variant={storeOpen ? "success" : "danger"}
      disabled={updatingAvailability}
      onClick={changeAvailability}
      aria-label={storeOpen ? "Loja aberta. Fechar loja hoje" : "Loja fechada. Abrir loja hoje"}
    >
      <Store size={16} aria-hidden="true" />
      {updatingAvailability
        ? "Atualizando..."
        : storeOpen
          ? "Loja aberta"
          : "Loja fechada"}
    </Button>
  );
}

export function AdminNavigation({ admin, restaurantName, storeOpen }: AdminNavigationProps) {
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const isAdmin = admin.roles.includes("ADMIN");
  const isMotoboy = admin.roles.includes("ENTREGADOR");

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
      <DesktopNavbar>
        <DesktopNavbarBrand>
          <Brand as={Link} href="/admin">
            FlyFoods
          </Brand>
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
        </DesktopNavbarBrand>
        <DesktopNavbarActions>
          <DesktopNavbarUser>
            {isAdmin ? <StoreAvailabilityButton initialStoreOpen={storeOpen} /> : null}
            <DesktopNavbarIdentity>
              <Tenant>{restaurantName}</Tenant>
              <Email>{admin.email}</Email>
            </DesktopNavbarIdentity>
          </DesktopNavbarUser>
          <LogoutButton iconOnly />
        </DesktopNavbarActions>
      </DesktopNavbar>

      <Sidebar data-expanded={isDesktopSidebarExpanded}>
        <Nav
          id="admin-desktop-navigation"
          aria-label="Navegação principal"
          data-expanded={isDesktopSidebarExpanded}
        >
          <NavigationItems
            isAdmin={isAdmin}
            isMotoboy={isMotoboy}
            isDesktopSidebarExpanded={isDesktopSidebarExpanded}
          />
        </Nav>
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
                isMotoboy={isMotoboy}
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
