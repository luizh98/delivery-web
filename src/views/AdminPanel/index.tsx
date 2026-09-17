"use client";

import Link from "next/link";
import {
  ClipboardList,
  Bike,
  CookingPot,
  Printer,
  Settings,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { RestaurantConfigResponse } from "@/types/api";
import {
  Header,
  LinkCard,
  LinkIcon,
  LinksGrid,
  Root,
  SectionSubtitle,
  SectionTitle,
  StoreAvailability,
  StoreAvailabilityHint,
  Subtitle,
  Title,
} from "@/views/AdminDashboard/styles";

const shortcuts = [
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/printer", label: "Impressora", icon: Printer },
  { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
  { href: "/admin/deliveries", label: "Entregas", icon: Bike },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
  { href: "/admin/settings", label: "Configuração", icon: Settings },
];

type AdminPanelViewProps = {
  initialRestaurantConfig: RestaurantConfigResponse | null;
};

export function AdminPanelView({ initialRestaurantConfig }: AdminPanelViewProps) {
  const [restaurantConfig, setRestaurantConfig] = useState(initialRestaurantConfig);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();
  const storeOpen = restaurantConfig?.open !== false;

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
      setRestaurantConfig(updatedConfig);
      showToast(nextOpen ? "Loja aberta até o fim de hoje." : "Loja fechada até o fim de hoje.");
    } catch {
      showToast("Não foi possível atualizar o status da loja.", "error");
    } finally {
      setUpdatingAvailability(false);
    }
  }

  return (
    <Root>
      <Header>
        <div>
          <Title>Painel</Title>
          <Subtitle>Atalhos para a operação e configuração do restaurante</Subtitle>
        </div>
        <StoreAvailability>
          <Button
            type="button"
            variant={storeOpen ? "danger" : "primary"}
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
          <StoreAvailabilityHint>
            Alteração válida até o fim de hoje.
          </StoreAvailabilityHint>
        </StoreAvailability>
      </Header>
      <div>
        <SectionTitle>Acessos rápidos</SectionTitle>
        <SectionSubtitle>Escolha uma área para continuar.</SectionSubtitle>
      </div>
      <LinksGrid>
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <LinkCard key={item.href} as={Link} href={item.href}>
              <LinkIcon><Icon size={20} /></LinkIcon>
              {item.label}
            </LinkCard>
          );
        })}
      </LinksGrid>
    </Root>
  );
}
