"use client";

import { DateRangeFilter, getPresetDateRange, dateKey } from "@/components/DateRangeFilter";

import { Bike, Check, CircleCheck, Clock3, ExternalLink, GripVertical, RefreshCw, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";
import { useToast } from "@/components/ToastProvider";
import { clientApi } from "@/services/api/client";
import type { DeliveryRouteResponse, DeliveryRouteStatus, MotoboyResponse } from "@/types/api";
import {
  Actions,
  Board,
  CourierColumn,
  CourierHeader,
  CourierName,
  DragHandle,
  DragHint,
  Empty,
  Header,
  OrderList,
  OrderDetails,
  OrderMeta,
  OrderRow,
  OrderTitle,
  Root,
  RouteCard,
  RouteFooter,
  RouteHeader,
  RouteStatus,
  RouteTitle,
  Subtitle,
  Title,
  Toolbar,
  Waiting,
} from "./styles";
import {
  SearchFilter,
  StatusCount,
  StatusFilter,
  StatusFilterLabel,
  StatusFilters,
} from "@/components/OrdersManager/styles";

type Props = {
  initialRoutes: DeliveryRouteResponse[];
  initialMotoboys: MotoboyResponse[];
};

const statusLabels: Record<DeliveryRouteStatus, string> = {
  WAITING: "Aguardando agrupamento",
  READY: "Pronta para sair",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  COMPLETED: "Concluída",
};

const deliveryStatuses: DeliveryRouteStatus[] = [
  "WAITING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

const statusIcons = {
  WAITING: Clock3,
  READY: Check,
  OUT_FOR_DELIVERY: Bike,
  COMPLETED: CircleCheck,
} satisfies Record<DeliveryRouteStatus, typeof Clock3>;

type DraggedOrder = { orderId: string; routeId: string };
type DropTarget = { routeId: string; orderId?: string };

export function DeliveriesBoard({ initialRoutes, initialMotoboys }: Props) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [motoboys] = useState(initialMotoboys);
  const [now, setNow] = useState(() => Date.now());
  const [statusFilter, setStatusFilter] = useState<DeliveryRouteStatus | null>(null);
  const [search, setSearch] = useState("");
  const [{ startDate, endDate }, setDateRange] = useState(() => getPresetDateRange("today"));
  const [draggedOrder, setDraggedOrder] = useState<DraggedOrder | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const { showToast } = useToast();

  async function reload() {
    const current = await clientApi<DeliveryRouteResponse[]>("admin/delivery-routes");
    setRoutes(current);
  }

  useEffect(() => {
    const events = new EventSource("/api/backend/admin/delivery-routes/events");
    const handleChange = () => void reload();
    events.addEventListener("delivery-route", handleChange);
    const timer = window.setInterval(() => {
      setNow(Date.now());
      void reload();
    }, 30_000);
    return () => {
      events.removeEventListener("delivery-route", handleChange);
      events.close();
      window.clearInterval(timer);
    };
  }, []);

  const matchingRoutes = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);
    const idSearch = normalizedSearch.replace(/^#/, "");
    const phoneSearch = search.replace(/\D/g, "");

    return routes.filter((route) => {
      const routeDate = localDateKey(routeDateValue(route));
      if ((startDate || endDate) && !routeDate) return false;
      if (startDate && routeDate && routeDate < startDate) return false;
      if (endDate && routeDate && routeDate > endDate) return false;

      if (!normalizedSearch) return true;

      return normalizeSearch(route.id).includes(idSearch)
        || normalizeSearch(route.motoboy?.name ?? "").includes(normalizedSearch)
        || route.orders.some((order) => (
          normalizeSearch(order.customer.name).includes(normalizedSearch)
          || normalizeSearch(order.id).includes(idSearch)
          || (phoneSearch.length > 0 && order.customer.phone.replace(/\D/g, "").includes(phoneSearch))
        ));
    });
  }, [endDate, routes, search, startDate]);

  const filteredRoutes = useMemo(
    () => statusFilter
      ? matchingRoutes.filter((route) => route.status === statusFilter)
      : matchingRoutes,
    [matchingRoutes, statusFilter],
  );

  const groups = useMemo(() => {
    const grouped = new Map<string, { name: string; routes: DeliveryRouteResponse[] }>();
    filteredRoutes.forEach((route) => {
      const key = route.motoboyId ?? "waiting";
      const current = grouped.get(key) ?? {
        name: route.motoboy?.name ?? "Aguardando motoboy",
        routes: [],
      };
      current.routes.push(route);
      grouped.set(key, current);
    });
    return Array.from(grouped.values());
  }, [filteredRoutes]);

  async function assign(route: DeliveryRouteResponse, motoboyId: string) {
    if (!motoboyId) return;
    try {
      const updated = await clientApi<DeliveryRouteResponse>(`admin/delivery-routes/${route.id}/motoboy`, {
        method: "PATCH",
        body: JSON.stringify({ motoboyId }),
      });
      setRoutes((current) => current.map((item) => item.id === updated.id ? updated : item));
      showToast("Motoboy atribuído à rota");
    } catch {
      showToast("Não foi possível atribuir o motoboy.", "error");
    }
  }

  function canReorder(route: DeliveryRouteResponse) {
    return route.status === "WAITING" || route.status === "READY";
  }

  function startDragging(event: React.DragEvent, route: DeliveryRouteResponse, orderId: string) {
    if (!canReorder(route)) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", orderId);
    setDraggedOrder({ orderId, routeId: route.id });
    setDropTarget({ routeId: route.id });
  }

  function allowDrop(event: React.DragEvent, route: DeliveryRouteResponse, orderId?: string) {
    if (!draggedOrder || !canReorder(route)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget({ routeId: route.id, orderId });
  }

  async function dropOrder(event: React.DragEvent, targetRoute: DeliveryRouteResponse, targetOrderId?: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!draggedOrder || !canReorder(targetRoute)) return;

    const sourceRoute = routes.find((route) => route.id === draggedOrder.routeId);
    if (!sourceRoute) return;
    const targetIndex = targetOrderId
      ? targetRoute.orders.findIndex((order) => order.id === targetOrderId)
      : targetRoute.orders.length;
    if (targetIndex < 0) return;
    const sourceIndex = sourceRoute.orders.findIndex((order) => order.id === draggedOrder.orderId);
    const position = sourceRoute.id === targetRoute.id && sourceIndex >= 0 && sourceIndex < targetIndex
      ? targetIndex - 1
      : targetIndex;

    const orderId = draggedOrder.orderId;
    setDraggedOrder(null);
    setDropTarget(null);
    try {
      await clientApi<DeliveryRouteResponse>(`admin/delivery-routes/${targetRoute.id}/orders`, {
        method: "PATCH",
        body: JSON.stringify({ orderId, position }),
      });
      await reload();
      showToast("Ordem das entregas atualizada");
    } catch {
      showToast("Não foi possível reorganizar as entregas.", "error");
    }
  }

  return (
    <Root>
      <Header>
        <div>
          <Title>Entregas</Title>
          <Subtitle>{filteredRoutes.length} rota(s) encontrada(s)</Subtitle>
        </div>
        <Button variant="outline" onClick={() => void reload()}><RefreshCw size={16} /> Atualizar</Button>
      </Header>
      <StatusFilters aria-label="Filtrar entregas por status">
        {deliveryStatuses.map((status) => {
          const active = statusFilter === status;
          const StatusIcon = statusIcons[status];
          return (
            <StatusFilter
              key={status}
              type="button"
              active={active}
              aria-pressed={active}
              onClick={() => setStatusFilter(active ? null : status)}
            >
              <StatusIcon size={17} aria-hidden="true" />
              <StatusFilterLabel>{statusLabels[status]}</StatusFilterLabel>
              <StatusCount>{matchingRoutes.filter((route) => route.status === status).length}</StatusCount>
            </StatusFilter>
          );
        })}
      </StatusFilters>
      <SearchFilter>
        <Field label="Buscar entrega">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, ID da entrega ou celular"
          />
        </Field>
        <DateRangeFilter value={{ startDate, endDate }} onChange={setDateRange} />
      </SearchFilter>
      <Toolbar>
        <DragHint><GripVertical size={15} aria-hidden="true" /> Cadastre motoboys em Usuários. Arraste pelo ícone para reorganizar ou mover pedidos entre rotas.</DragHint>
      </Toolbar>
      {groups.length === 0 ? <Empty>Nenhuma entrega encontrada.</Empty> : null}
      <Board>
        {groups.map((group) => (
          <CourierColumn key={group.name}>
            <CourierHeader>
              <CourierName><Bike size={17} aria-hidden="true" /> {group.name}</CourierName>
              <span>{group.routes.length} rota(s)</span>
            </CourierHeader>
            {group.routes.map((route) => (
              <RouteCard
                key={route.id}
                dropTarget={dropTarget?.routeId === route.id}
                onDragOver={(event) => allowDrop(event, route)}
                onDrop={(event) => void dropOrder(event, route)}
              >
                <RouteHeader>
                  <RouteTitle>Rota #{route.id.slice(-6).toUpperCase()}</RouteTitle>
                  <RouteStatus>{statusLabels[route.status]}</RouteStatus>
                </RouteHeader>
                <OrderList>
                  {route.orders.map((order) => {
                    const mapsUrl = googleMapsUrl(order);

                    return (
                      <OrderRow
                      key={order.id}
                      draggable={canReorder(route)}
                      reorderable={canReorder(route)}
                      dragActive={draggedOrder?.orderId === order.id}
                      dropTarget={dropTarget?.routeId === route.id && dropTarget.orderId === order.id}
                      aria-label={canReorder(route) ? `Arraste o pedido ${order.orderNumber ?? order.id.slice(-6).toUpperCase()} para reorganizar` : undefined}
                      onDragStart={(event) => startDragging(event, route, order.id)}
                      onDragEnd={() => { setDraggedOrder(null); setDropTarget(null); }}
                      onDragOver={(event) => { event.stopPropagation(); allowDrop(event, route, order.id); }}
                      onDrop={(event) => void dropOrder(event, route, order.id)}
                    >
                      <DragHandle aria-hidden="true">{canReorder(route) ? <GripVertical size={16} /> : null}</DragHandle>
                        <OrderDetails>
                          <OrderTitle><UserRound size={14} aria-hidden="true" /> Pedido #{order.orderNumber ?? order.id.slice(-6).toUpperCase()} · {order.customer.name}</OrderTitle>
                          <OrderMeta>{order.deliveryAddress?.neighborhood || "Bairro não informado"} · {shortAddress(order)}</OrderMeta>
                          {mapsUrl ? <Button type="button" variant="outline" onClick={() => window.open(mapsUrl, "_blank", "noopener,noreferrer")}><ExternalLink size={14} aria-hidden="true" /> Ver no Google Maps</Button> : null}
                        </OrderDetails>
                      </OrderRow>
                    );
                  })}
                </OrderList>
                {route.status === "WAITING" ? <Waiting><span><Clock3 size={14} /> {remaining(route.toleranceExpiresAt, now)}</span><span>Aguardando outro pedido compatível</span></Waiting> : null}
                <RouteFooter>
                  <strong>{route.orders.length} entrega(s)</strong>
                  <Actions>
                    {!route.motoboyId && route.status !== "OUT_FOR_DELIVERY" && route.status !== "COMPLETED" ? (
                      <Field label="Motoboy"><Select value="" onChange={(event) => void assign(route, event.target.value)}><option value="">Atribuir</option>{motoboys.map((motoboy) => <option key={motoboy.id} value={motoboy.id}>{motoboy.name}</option>)}</Select></Field>
                    ) : null}
                  </Actions>
                </RouteFooter>
              </RouteCard>
            ))}
          </CourierColumn>
        ))}
      </Board>
    </Root>
  );
}

function remaining(expiresAt: string | undefined, now: number) {
  if (!expiresAt) return "Tolerância expirada";
  const minutes = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 60_000));
  return `Tolerância: ${minutes} min restantes`;
}

function shortAddress(order: DeliveryRouteResponse["orders"][number]) {
  return [order.deliveryAddress?.street, order.deliveryAddress?.number].filter(Boolean).join(", ") || "Endereço não informado";
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

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function routeDateValue(route: DeliveryRouteResponse) {
  const orderDates = route.orders
    .map((order) => order.statusHistory.find((history) => history.status === "RECEIVED")?.changedAt ?? order.createdAt)
    .filter((value): value is string => Boolean(value))
    .sort();

  return orderDates[0] ?? route.createdAt;
}

function localDateKey(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateKey(date);
}
