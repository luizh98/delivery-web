"use client";

import { Bike, Check, Clock3, Plus, RefreshCw, UserRound } from "lucide-react";
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

export function DeliveriesBoard({ initialRoutes, initialMotoboys }: Props) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [motoboys, setMotoboys] = useState(initialMotoboys);
  const [newMotoboyName, setNewMotoboyName] = useState("");
  const [newMotoboyPhone, setNewMotoboyPhone] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
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

  const groups = useMemo(() => {
    const grouped = new Map<string, { name: string; routes: DeliveryRouteResponse[] }>();
    routes.forEach((route) => {
      const key = route.motoboyId ?? "waiting";
      const current = grouped.get(key) ?? {
        name: route.motoboy?.name ?? "Aguardando motoboy",
        routes: [],
      };
      current.routes.push(route);
      grouped.set(key, current);
    });
    return Array.from(grouped.values());
  }, [routes]);

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
          <Subtitle>Organize rapidamente as rotas que estão prontas para sair.</Subtitle>
        </div>
        <Button variant="outline" onClick={() => void reload()}><RefreshCw size={16} /> Atualizar</Button>
      </Header>
      <Toolbar>
        <MotoboyForm onSubmit={addMotoboy}>
          <Field label="Novo motoboy"><Input value={newMotoboyName} onChange={(event) => setNewMotoboyName(event.target.value)} placeholder="Nome" /></Field>
          <Field label="Celular"><Input value={newMotoboyPhone} onChange={(event) => setNewMotoboyPhone(event.target.value)} placeholder="Opcional" /></Field>
          <Button type="submit"><Plus size={16} /> Cadastrar</Button>
        </MotoboyForm>
        {error ? <ErrorText>{error}</ErrorText> : null}
      </Toolbar>
      {groups.length === 0 ? <Empty>Nenhuma entrega aguardando operação.</Empty> : null}
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
