"use client";

import { DayPicker, type DateRange } from "@daypicker/react";
import { ptBR } from "@daypicker/react/locale";
import { Bike, CalendarDays, Check, CircleCheck, Clock3, Plus, RefreshCw, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Empty,
  ErrorText,
  Header,
  MotoboyForm,
  OrderList,
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
  CalendarPanel,
  DateFilterWrap,
  DateModalActions,
  DatePopover,
  DatePopoverBody,
  DatePopoverHeader,
  DateRangeText,
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

type DatePreset = "last7" | "yesterday" | "today" | "thisMonth" | "custom";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

const datePresetLabels: Record<DatePreset, string> = {
  last7: "Últimos 7 dias",
  yesterday: "Ontem",
  today: "Hoje",
  thisMonth: "Este mês",
  custom: "Personalizado",
};

export function DeliveriesBoard({ initialRoutes, initialMotoboys }: Props) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [motoboys, setMotoboys] = useState(initialMotoboys);
  const [newMotoboyName, setNewMotoboyName] = useState("");
  const [newMotoboyPhone, setNewMotoboyPhone] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [statusFilter, setStatusFilter] = useState<DeliveryRouteStatus | null>(null);
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [{ startDate, endDate }, setDateRange] = useState(() => getPresetDateRange("today"));
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [draftDateRange, setDraftDateRange] = useState<DateRange>();
  const datePopoverRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!isDatePopoverOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsDatePopoverOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (!datePopoverRef.current?.contains(event.target as Node)) {
        setIsDatePopoverOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isDatePopoverOpen]);

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

  function selectDatePreset(preset: DatePreset) {
    if (preset === "custom") {
      setDraftDateRange({ from: dateFromKey(startDate), to: dateFromKey(endDate) });
      setIsDatePopoverOpen(true);
      return;
    }

    setDatePreset(preset);
    setDateRange(getPresetDateRange(preset));
  }

  function applyCustomDateRange() {
    if (!draftDateRange?.from || !draftDateRange.to) return;
    setDatePreset("custom");
    setDateRange({ startDate: dateKey(draftDateRange.from), endDate: dateKey(draftDateRange.to) });
    setIsDatePopoverOpen(false);
  }

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

  async function updateStatus(route: DeliveryRouteResponse, status: DeliveryRouteStatus) {
    try {
      const updated = await clientApi<DeliveryRouteResponse>(`admin/delivery-routes/${route.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRoutes((current) => current.map((item) => item.id === updated.id ? updated : item));
      showToast("Rota atualizada");
    } catch {
      showToast("Não foi possível atualizar a rota.", "error");
    }
  }

  async function addMotoboy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newMotoboyName.trim()) return;
    setError("");
    try {
      const motoboy = await clientApi<MotoboyResponse>("admin/motoboys", {
        method: "POST",
        body: JSON.stringify({ name: newMotoboyName, phone: newMotoboyPhone }),
      });
      setMotoboys((current) => [...current, motoboy].sort((left, right) => left.name.localeCompare(right.name)));
      setNewMotoboyName("");
      setNewMotoboyPhone("");
      showToast("Motoboy cadastrado");
    } catch {
      setError("Não foi possível cadastrar o motoboy.");
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
        <DateFilterWrap ref={datePopoverRef}>
          <Field label={`Período: ${formatDateRange(startDate, endDate)}`}>
            <Select value="" onChange={(event) => selectDatePreset(event.target.value as DatePreset)}>
              <option value="" disabled>{datePresetLabels[datePreset]}</option>
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="last7">Últimos 7 dias</option>
              <option value="thisMonth">Este mês</option>
              <option value="custom">Personalizado</option>
            </Select>
          </Field>
          {isDatePopoverOpen ? (
            <DatePopover role="dialog" aria-labelledby="delivery-date-range-title">
              <DatePopoverHeader>
                <div>
                  <strong id="delivery-date-range-title">Período personalizado</strong>
                  <Subtitle>Selecione início e fim.</Subtitle>
                </div>
                <Button type="button" variant="outline" aria-label="Fechar seleção de período" onClick={() => setIsDatePopoverOpen(false)}>
                  <X size={16} />
                </Button>
              </DatePopoverHeader>
              <DatePopoverBody>
                <CalendarPanel>
                  <DayPicker
                    mode="range"
                    locale={ptBR}
                    selected={draftDateRange}
                    onSelect={setDraftDateRange}
                    defaultMonth={draftDateRange?.from}
                    resetOnSelect
                  />
                </CalendarPanel>
                <DateRangeText>
                  <CalendarDays size={16} aria-hidden="true" />
                  {draftDateRange?.from && draftDateRange.to
                    ? formatDateRange(dateKey(draftDateRange.from), dateKey(draftDateRange.to))
                    : "Selecione o início e o fim do período"}
                </DateRangeText>
                <DateModalActions>
                  <Button type="button" variant="outline" onClick={() => setIsDatePopoverOpen(false)}>Cancelar</Button>
                  <Button type="button" disabled={!draftDateRange?.from || !draftDateRange.to} onClick={applyCustomDateRange}>Aplicar período</Button>
                </DateModalActions>
              </DatePopoverBody>
            </DatePopover>
          ) : null}
        </DateFilterWrap>
      </SearchFilter>
      <Toolbar>
        <MotoboyForm onSubmit={addMotoboy}>
          <Field label="Novo motoboy"><Input value={newMotoboyName} onChange={(event) => setNewMotoboyName(event.target.value)} placeholder="Nome" /></Field>
          <Field label="Celular"><Input value={newMotoboyPhone} onChange={(event) => setNewMotoboyPhone(event.target.value)} placeholder="Opcional" /></Field>
          <Button type="submit"><Plus size={16} /> Cadastrar</Button>
        </MotoboyForm>
        {error ? <ErrorText>{error}</ErrorText> : null}
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
              <RouteCard key={route.id}>
                <RouteHeader>
                  <RouteTitle>Rota #{route.id.slice(-6).toUpperCase()}</RouteTitle>
                  <RouteStatus>{statusLabels[route.status]}</RouteStatus>
                </RouteHeader>
                <OrderList>
                  {route.orders.map((order) => (
                    <OrderRow key={order.id}>
                      <OrderTitle><UserRound size={14} aria-hidden="true" /> Pedido #{order.id.slice(-6).toUpperCase()} · {order.customer.name}</OrderTitle>
                      <OrderMeta>{order.deliveryAddress?.neighborhood || "Bairro não informado"} · {shortAddress(order)}</OrderMeta>
                    </OrderRow>
                  ))}
                </OrderList>
                {route.status === "WAITING" ? <Waiting><span><Clock3 size={14} /> {remaining(route.toleranceExpiresAt, now)}</span><span>Aguardando outro pedido compatível</span></Waiting> : null}
                <RouteFooter>
                  <strong>{route.orders.length} entrega(s)</strong>
                  <Actions>
                    {!route.motoboyId && route.status !== "OUT_FOR_DELIVERY" && route.status !== "COMPLETED" ? (
                      <Field label="Motoboy"><Select value="" onChange={(event) => void assign(route, event.target.value)}><option value="">Atribuir</option>{motoboys.map((motoboy) => <option key={motoboy.id} value={motoboy.id}>{motoboy.name}</option>)}</Select></Field>
                    ) : null}
                    {route.status === "READY" && route.motoboyId ? <Button onClick={() => void updateStatus(route, "OUT_FOR_DELIVERY")}><Bike size={16} /> Iniciar rota</Button> : null}
                    {route.status === "OUT_FOR_DELIVERY" ? <Button onClick={() => void updateStatus(route, "COMPLETED")}><Check size={16} /> Concluir</Button> : null}
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

function getPresetDateRange(preset: Exclude<DatePreset, "custom">) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);

  if (preset === "last7") {
    start.setDate(start.getDate() - 6);
  } else if (preset === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset === "thisMonth") {
    start.setDate(1);
  }

  return { startDate: dateKey(start), endDate: dateKey(end) };
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateRange(startDate: string, endDate: string) {
  return `${dateFormatter.format(dateFromKey(startDate))} a ${dateFormatter.format(dateFromKey(endDate))}`;
}
