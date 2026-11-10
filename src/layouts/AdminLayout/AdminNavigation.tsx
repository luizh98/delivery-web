"use client";

import {
  Armchair,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  History,
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
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { CurrentUserResponse, RestaurantConfigResponse } from "@/types/api";
import { LogoutButton } from "./LogoutButton";
import { navigationHome, navigationItemVisible, navigationRole, type NavigationRole } from "./navigation";
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
  { href: "/admin/table-orders", label: "Pedidos mesa", icon: ClipboardList },
  { href: "/admin/tables", label: "Mesas e comandas", icon: Armchair },
  { href: "/hall", label: "Atendimento do salão", icon: Armchair, adminOnly: true },
  { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
  { href: "/admin/deliveries", label: "Entregas", motoboyLabel: "Pedidos", icon: Bike },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/users", label: "Usuários", icon: UserCog, adminOnly: true },
  { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
  { href: "/admin/catalog/upsell", label: "Campanhas", icon: Sparkles },
  { href: "/admin/marketing/promotions", label: "Marketing", icon: Megaphone },
  { href: "/admin/printer", label: "Impressora", icon: Printer },
  { href: "/admin/settings", label: "Configurações", icon: Settings, adminOnly: true },
  { href: "/admin/logs", label: "Histórico de alterações", icon: History, adminOnly: true },
];

type AdminNavigationProps = {
  admin: Pick<CurrentUserResponse, "email" | "roles" | "tenantSlug">;
  restaurantName: string;
  storeOpen: boolean;
  beforeLeave?: () => Promise<boolean>;
};

type AccountSummaryProps = {
  admin: Pick<CurrentUserResponse, "email" | "tenantSlug">;
};

type NavigationItemsProps = {
  role: NavigationRole;
  isDesktopSidebarExpanded?: boolean;
  onNavigate?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
};

function NavigationItems({
  role,
  isDesktopSidebarExpanded,
  onNavigate,
}: NavigationItemsProps) {
  const pathname = usePathname();

  return (
    <>
      {navItems
        .filter((item) => navigationItemVisible(item, role))
        .map((item) => {
          const Icon = item.icon;
          const label = role === "motoboy" ? item.motoboyLabel ?? item.label : item.label;
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

export function AdminNavigation({ admin, restaurantName, storeOpen, beforeLeave }: AdminNavigationProps) {
  const router = useRouter();
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const role = navigationRole(admin.roles);
  const isAdmin = role === "admin";
  const homeHref = navigationHome(role);

  function navigate(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!beforeLeave) { closeMenu(false); return; }
    event.preventDefault();
    const href = event.currentTarget.getAttribute("href");
    if (!href) return;
    void beforeLeave().then((allowed) => { if (allowed) { closeMenu(false); router.push(href); } });
  }

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
          <Brand as={Link} href={homeHref} onClick={navigate}>
            <Image src="/flyfoods-logo.webp" alt="FlyFoods" width={320} height={243} loading="eager" />
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
          <LogoutButton iconOnly beforeLeave={beforeLeave} />
        </DesktopNavbarActions>
      </DesktopNavbar>

      <Sidebar data-expanded={isDesktopSidebarExpanded}>
        <Nav
          id="admin-desktop-navigation"
          aria-label="Navegação principal"
          data-expanded={isDesktopSidebarExpanded}
        >
          <NavigationItems
            role={role}
            onNavigate={navigate}
            isDesktopSidebarExpanded={isDesktopSidebarExpanded}
          />
        </Nav>
      </Sidebar>

      <MobileHeader>
        <Brand as={Link} href={homeHref} onClick={navigate}>
          <Image src="/flyfoods-logo.webp" alt="FlyFoods" width={320} height={243} loading="eager" />
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
              <Brand as={Link} href={homeHref} onClick={navigate}>
                <Image src="/flyfoods-logo.webp" alt="FlyFoods" width={320} height={243} />
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
                role={role}
                onNavigate={navigate}
              />
            </Nav>
            <SidebarFooter>
              <AccountSummary admin={admin} />
              <LogoutButton beforeLeave={beforeLeave} />
            </SidebarFooter>
          </MobileDrawer>
        </>
      ) : null}
    </>
  );
}
