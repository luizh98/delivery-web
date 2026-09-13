"use client";

import { ArrowDown, ArrowUp, Bike, CheckCircle2, MapPin, PackageCheck, RefreshCw, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { DeliveryRouteResponse } from "@/types/api";
import {
  Address,
  Empty,
  Header,
  OrderActions,
  OrderCard,
  OrderMeta,
  OrderTitle,
  RouteCard,
  RouteHeader,
  RouteTitle,
  Root,
  Subtitle,
  Title,
} from "./styles";

type Props = { initialRoutes: DeliveryRouteResponse[] };

function address(order: DeliveryRouteResponse["orders"][number]) {
  const value = [order.deliveryAddress?.street, order.deliveryAddress?.number, order.deliveryAddress?.neighborhood]
    .filter(Boolean)
    .join(", ");
  return value || "Endereço não informado";
}

export function MotoboyOrdersBoard({ initialRoutes }: Props) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();

  async function reload() {
    try {
      const current = await clientApi<DeliveryRouteResponse[]>("admin/motoboy/delivery-routes");
      setRoutes(current);
    } catch {
      showToast("Não foi possível atualizar seus pedidos.", "error");
    }
  }

  async function moveOrder(route: DeliveryRouteResponse, orderId: string, position: number) {
    setLoadingId(orderId);
    try {
      const updated = await clientApi<DeliveryRouteResponse>(`admin/motoboy/delivery-routes/${route.id}/orders`, {
        method: "PATCH",
        body: JSON.stringify({ orderId, position }),
      });
      setRoutes((current) => current.map((item) => item.id === updated.id ? updated : item));
      showToast("Ordem atualizada");
    } catch {
      showToast("Não foi possível alterar a ordem.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  async function completeOrder(orderId: string) {
    const confirmed = await requestConfirmation({
      message: "Confirmar baixa deste pedido? Esta ação marca a entrega como concluída.",
      confirmLabel: "Baixar pedido",
    });
    if (!confirmed) return;
    setLoadingId(orderId);
    try {
      await clientApi(`admin/motoboy/orders/${orderId}/complete`, { method: "PATCH" });
      await reload();
      showToast("Pedido baixado com sucesso");
    } catch {
      showToast("Não foi possível baixar este pedido.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  const orderCount = routes.reduce((total, route) => total + route.orders.length, 0);

  return (
    <Root>
      <Header>
        <div>
          <Title>Meus pedidos</Title>
          <Subtitle>{orderCount} pedido(s) para entregar</Subtitle>
        </div>
        <Button variant="outline" onClick={() => void reload()}>
          <RefreshCw size={16} aria-hidden="true" /> Atualizar
        </Button>
      </Header>

      {routes.length === 0 ? <Empty><PackageCheck size={28} aria-hidden="true" /> Nenhum pedido pendente para entrega.</Empty> : null}

      {routes.map((route) => (
        <RouteCard key={route.id}>
          <RouteHeader>
            <RouteTitle><Bike size={18} aria-hidden="true" /> Rota #{route.id.slice(-6).toUpperCase()}</RouteTitle>
            <span>{route.orders.length} parada(s)</span>
          </RouteHeader>
          {route.orders.map((order, index) => (
            <OrderCard key={order.id}>
              <div>
                <OrderTitle><UserRound size={16} aria-hidden="true" /> Pedido #{order.id.slice(-6).toUpperCase()} · {order.customer.name}</OrderTitle>
                <Address><MapPin size={15} aria-hidden="true" /> {address(order)}</Address>
                <OrderMeta>{order.customer.phone || "Telefone não informado"}</OrderMeta>
              </div>
              <OrderActions>
                <Button type="button" variant="outline" aria-label={`Mover pedido ${index + 1} para cima`} disabled={index === 0 || loadingId === order.id} onClick={() => void moveOrder(route, order.id, index - 1)}><ArrowUp size={16} aria-hidden="true" /> Subir</Button>
                <Button type="button" variant="outline" aria-label={`Mover pedido ${index + 1} para baixo`} disabled={index === route.orders.length - 1 || loadingId === order.id} onClick={() => void moveOrder(route, order.id, index + 1)}><ArrowDown size={16} aria-hidden="true" /> Descer</Button>
                <Button type="button" disabled={loadingId === order.id} onClick={() => void completeOrder(order.id)}><CheckCircle2 size={16} aria-hidden="true" /> {loadingId === order.id ? "Salvando..." : "Baixar"}</Button>
              </OrderActions>
            </OrderCard>
          ))}
        </RouteCard>
      ))}
    </Root>
  );
}
