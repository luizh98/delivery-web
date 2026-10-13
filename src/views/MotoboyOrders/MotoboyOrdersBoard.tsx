"use client";

import { ArrowDown, ArrowUp, Bike, CheckCircle2, ExternalLink, MapPin, PackageCheck, RefreshCw, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useConfirmation } from "@/components/ConfirmationProvider";
import { useToast } from "@/components/ToastProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ApiError, clientApi } from "@/services/api/client";
import type { DeliveryRouteResponse, OrderResponse } from "@/types/api";
import {
  Address,
  Empty,
  Filters,
  Header,
  OrderActions,
  OrderCard,
  OrderMeta,
  OrderTitle,
  PickupList,
  RouteCard,
  RouteHeader,
  RouteTitle,
  Root,
  Subtitle,
  Title,
} from "./styles";

type PickupResponse = { enabled: boolean; orders: OrderResponse[] };
type Props = { initialRoutes: DeliveryRouteResponse[]; initialPickup: PickupResponse };

function address(order: DeliveryRouteResponse["orders"][number]) {
  const value = [order.deliveryAddress?.street, order.deliveryAddress?.number, order.deliveryAddress?.neighborhood]
    .filter(Boolean)
    .join(", ");
  return value || "Endereço não informado";
}

function googleMapsUrl(order: DeliveryRouteResponse["orders"][number]) {
  const address = order.deliveryAddress;
  const street = [address?.street?.trim(), address?.number?.trim()].filter(Boolean).join(", ");
  const cityState = [address?.city?.trim(), address?.state?.trim()].filter(Boolean).join(" - ");
  const value = [street, address?.complement?.trim(), address?.neighborhood?.trim(), cityState, address?.zipCode?.trim()]
    .filter(Boolean)
    .join(", ");

  return value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}` : null;
}

function whatsAppUrl(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  if (!normalized) return null;
  const number = normalized.startsWith("55") && normalized.length > 11 ? normalized : `55${normalized}`;
  return `https://wa.me/${number}`;
}

function OrderDetails({ order }: { order: OrderResponse }) {
  const receivedAt = order.statusHistory.find((history) => history.status === "RECEIVED")?.changedAt ?? order.createdAt;
  const date = receivedAt ? new Date(receivedAt) : null;
  const dateLabel = date && Number.isFinite(date.getTime())
    ? date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Data não informada";

  return (
    <div>
      <OrderTitle>Pedido #{order.orderNumber ?? order.id.slice(-6).toUpperCase()} · {dateLabel}</OrderTitle>
      <Address><UserRound size={16} aria-hidden="true" /> {order.customer.name}</Address>
      <OrderMeta>{order.customer.phone || "Telefone não informado"}</OrderMeta>
      <Address><MapPin size={15} aria-hidden="true" /> {address(order)}</Address>
    </div>
  );
}

export function MotoboyOrdersBoard({ initialRoutes, initialPickup }: Props) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [pickup, setPickup] = useState(initialPickup);
  const [view, setView] = useState<"pickup" | "delivery">(() => initialRoutes.some((route) => route.orders.length > 0) || !initialPickup.enabled ? "delivery" : "pickup");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const reloadVersion = useRef(0);
  const { requestConfirmation } = useConfirmation();
  const { showToast } = useToast();

  const reload = useCallback(async (quiet = false) => {
    const version = ++reloadVersion.current;
    if (!quiet) setIsRefreshing(true);
    try {
      const [current, available] = await Promise.all([
        clientApi<DeliveryRouteResponse[]>("admin/motoboy/delivery-routes"),
        clientApi<PickupResponse>("admin/motoboy/pickup-orders"),
      ]);
      if (version !== reloadVersion.current) return;
      setRoutes(current);
      setPickup(available);
      setRefreshError(false);
    } catch {
      if (version !== reloadVersion.current) return;
      setRefreshError(true);
      if (!quiet) showToast("Não foi possível atualizar seus pedidos. Tente novamente.", "error");
    } finally {
      if (!quiet) setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") void reload(true); };
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [reload]);

  async function pickupOrder(order: OrderResponse) {
    const confirmed = await requestConfirmation({
      message: `Você conferiu o pedido #${order.orderNumber ?? order.id.slice(-6).toUpperCase()}, está com ele e vai sair para entrega?`,
      confirmLabel: "Confirmar saída",
    });
    if (!confirmed) return;
    setLoadingId(order.id);
    ++reloadVersion.current;
    try {
      await clientApi(`admin/motoboy/orders/${order.id}/pickup`, { method: "PATCH" });
      await reload(true);
      setView("delivery");
      showToast("Saída confirmada. Pedido em entrega.");
    } catch (error) {
      showToast(error instanceof ApiError && error.status === 409
        ? "Pedido alterado ou já retirado por outro entregador. Lista atualizada."
        : error instanceof ApiError && error.status === 403
          ? "Retirada indisponível. Verifique sua permissão com o restaurante."
          : "Não foi possível confirmar a saída. Atualize antes de tentar novamente.", "error");
      await reload(true);
    } finally {
      setLoadingId(null);
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
      message: "Você entregou este pedido ao cliente? Esta ação conclui a entrega.",
      confirmLabel: "Confirmar entrega",
    });
    if (!confirmed) return;
    setLoadingId(orderId);
    try {
      await clientApi(`admin/motoboy/orders/${orderId}/complete`, { method: "PATCH" });
      await reload();
      showToast("Entrega confirmada");
    } catch {
      showToast("Não foi possível confirmar a entrega. Atualize e tente novamente.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  const orderCount = routes.reduce((total, route) => total + route.orders.length, 0);
  const showingPickup = pickup.enabled && view === "pickup";

  return (
    <Root>
      <Header>
        <div>
          <Title>Meus pedidos</Title>
          <Subtitle>{showingPickup ? "Confira o pedido físico antes de confirmar a saída." : `${orderCount} pedido(s) para entregar`}</Subtitle>
        </div>
        <Button variant="outline" disabled={isRefreshing} onClick={() => void reload()}>
          <RefreshCw size={16} aria-hidden="true" /> {isRefreshing ? "Atualizando…" : "Atualizar"}
        </Button>
      </Header>

      {pickup.enabled ? (
        <Filters role="group" aria-label="Etapa dos pedidos">
          <Button type="button" variant={showingPickup ? "primary" : "outline"} aria-pressed={showingPickup} onClick={() => setView("pickup")}>Para retirar · {pickup.orders.length}</Button>
          <Button type="button" variant={!showingPickup ? "primary" : "outline"} aria-pressed={!showingPickup} onClick={() => setView("delivery")}>Em entrega · {orderCount}</Button>
        </Filters>
      ) : null}
      {refreshError ? <Subtitle role="alert">Atualização indisponível. Toque em Atualizar antes de retirar um pedido.</Subtitle> : null}

      {showingPickup ? (
        <PickupList aria-label="Pedidos para retirar" aria-busy={loadingId !== null}>
          {pickup.orders.length === 0 ? <Empty><PackageCheck size={28} aria-hidden="true" /> Nenhum pedido disponível para retirar.</Empty> : null}
          {pickup.orders.map((order) => (
            <RouteCard key={order.id}>
              <OrderDetails order={order} />
              <OrderMeta>{order.status === "READY" ? "Pronto — confira antes de retirar" : "Em preparo — confira pedido físico"}</OrderMeta>
              <Button type="button" disabled={loadingId !== null || refreshError} onClick={() => void pickupOrder(order)}><Bike size={16} aria-hidden="true" /> {loadingId === order.id ? "Confirmando saída…" : "Retirar e sair para entrega"}</Button>
            </RouteCard>
          ))}
        </PickupList>
      ) : null}

      {!showingPickup && routes.length === 0 ? <Empty><PackageCheck size={28} aria-hidden="true" /> Nenhum pedido pendente para entrega.</Empty> : null}

      {!showingPickup && routes.map((route) => (
        <RouteCard key={route.id}>
          <RouteHeader>
            <RouteTitle><Bike size={18} aria-hidden="true" /> Rota #{route.id.slice(-6).toUpperCase()}</RouteTitle>
            <span>{route.orders.length} parada(s)</span>
          </RouteHeader>
          {route.orders.map((order, index) => {
            const mapsUrl = googleMapsUrl(order);
            const whatsappUrl = whatsAppUrl(order.customer.phone);

            return (
              <OrderCard key={order.id}>
              <OrderDetails order={order} />
              <OrderActions>
                {mapsUrl ? <Button type="button" variant="outline" onClick={() => window.open(mapsUrl, "_blank", "noopener,noreferrer")}><ExternalLink size={16} aria-hidden="true" /> Ver no Google Maps</Button> : null}
                {whatsappUrl ? <Button type="button" variant="outline" onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}><WhatsAppIcon size={16} /> WhatsApp</Button> : null}
                {route.orders.length > 1 ? <>
                  <Button type="button" variant="outline" aria-label={`Mover pedido ${index + 1} para cima`} disabled={index === 0 || loadingId !== null} onClick={() => void moveOrder(route, order.id, index - 1)}><ArrowUp size={16} aria-hidden="true" /> Subir</Button>
                  <Button type="button" variant="outline" aria-label={`Mover pedido ${index + 1} para baixo`} disabled={index === route.orders.length - 1 || loadingId !== null} onClick={() => void moveOrder(route, order.id, index + 1)}><ArrowDown size={16} aria-hidden="true" /> Descer</Button>
                </> : null}
                <Button type="button" className="w-full md:w-auto" disabled={loadingId !== null} onClick={() => void completeOrder(order.id)}><CheckCircle2 size={16} aria-hidden="true" /> {loadingId === order.id ? "Salvando..." : "Confirmar entrega"}</Button>
              </OrderActions>
              </OrderCard>
            );
          })}
        </RouteCard>
      ))}
    </Root>
  );
}
