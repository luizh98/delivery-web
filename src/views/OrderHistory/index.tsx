"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { useCart } from "@/components/CartProvider";
import { PageShell } from "@/components/PageShell";
import { ApiError, clientApi } from "@/services/api/client";
import type {
  OrderStatus,
  PublicOrderTrackingResponse,
} from "@/types/api";
import { money } from "@/utils/format";
import { getStatusPresentation } from "@/views/OrderTracking/status";
import {
  CardAction,
  CardDetail,
  CardDetails,
  CardHeader,
  DetailLabel,
  DetailValue,
  HistoryCard,
  HistoryContent,
  HistoryDescription,
  HistoryHeader,
  HistoryList,
  HistoryTitle,
  Notice,
  OrderDate,
  OrderIdentity,
  OrderNumber,
  StateActions,
  StateCard,
  StateIcon,
  StateText,
  StateTitle,
  StatusBadge,
} from "./styles";

type LoadedOrderHistoryItem = {
  trackingCode: string;
  order: PublicOrderTrackingResponse;
};

type StatusTone = "active" | "completed" | "canceled";

const orderDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatOrderDate(value?: string) {
  if (!value) {
    return "Data não informada";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Data não informada"
    : orderDateFormatter.format(date);
}

function getStatusTone(status: OrderStatus): StatusTone {
  if (status === "COMPLETED") {
    return "completed";
  }

  return status === "CANCELED" ? "canceled" : "active";
}

export function OrderHistoryView() {
  const router = useRouter();
  const { recentOrderTrackingCodes } = useCart();
  const [orders, setOrders] = useState<LoadedOrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  const loadOrders = useCallback(async () => {
    activeRequest.current?.abort();

    if (recentOrderTrackingCodes.length === 0) {
      setOrders([]);
      setFailedCount(0);
      setLoadError(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setFailedCount(0);
    setLoadError(false);

    const results = await Promise.allSettled(
      recentOrderTrackingCodes.map(async (trackingCode) => {
        try {
          const order = await clientApi<PublicOrderTrackingResponse>(
            `public/orders/tracking/${encodeURIComponent(trackingCode)}`,
            { signal: controller.signal, cache: "no-store" },
          );

          return { trackingCode, order };
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            return null;
          }

          throw error;
        }
      }),
    );

    if (controller.signal.aborted) {
      return;
    }

    const loadedOrders: LoadedOrderHistoryItem[] = [];
    let failures = 0;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        if (result.value) {
          loadedOrders.push(result.value);
        }
      } else {
        failures += 1;
      }
    });

    setOrders(loadedOrders);
    setFailedCount(failures);
    setLoadError(loadedOrders.length === 0 && failures > 0);
    setLoading(false);
    activeRequest.current = null;
  }, [recentOrderTrackingCodes]);

  useEffect(() => {
    const loadTimeout = window.setTimeout(() => void loadOrders(), 0);

    return () => {
      window.clearTimeout(loadTimeout);
      activeRequest.current?.abort();
    };
  }, [loadOrders]);

  function goToMenu() {
    router.push("/");
  }

  if (loading && orders.length === 0) {
    return (
      <PageShell>
        <HistoryContent>
          <StateCard aria-live="polite">
            <StateIcon>
              <RefreshCw size={24} />
            </StateIcon>
            <StateTitle>Carregando seus pedidos</StateTitle>
            <StateText>Buscando os status mais recentes deste restaurante.</StateText>
          </StateCard>
        </HistoryContent>
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell>
        <HistoryContent>
          <StateCard role="alert">
            <StateIcon>
              <AlertTriangle size={24} />
            </StateIcon>
            <StateTitle>Não foi possível carregar seus pedidos</StateTitle>
            <StateText>
              Seus acessos continuam salvos neste navegador. Tente novamente em instantes.
            </StateText>
            <StateActions>
              <Button type="button" onClick={() => void loadOrders()}>
                Tentar novamente
              </Button>
              <Button type="button" variant="outline" onClick={goToMenu}>
                Voltar ao cardápio
              </Button>
            </StateActions>
          </StateCard>
        </HistoryContent>
      </PageShell>
    );
  }

  if (orders.length === 0) {
    const hasStoredCodes = recentOrderTrackingCodes.length > 0;

    return (
      <PageShell>
        <HistoryContent>
          <StateCard>
            <StateIcon>
              <ClipboardList size={24} />
            </StateIcon>
            <StateTitle>
              {hasStoredCodes
                ? "Nenhum pedido encontrado neste restaurante"
                : "Você ainda não tem pedidos por aqui"}
            </StateTitle>
            <StateText>
              {hasStoredCodes
                ? "Pedidos salvos de outros restaurantes não aparecem nesta lista."
                : "Seus próximos pedidos feitos neste navegador aparecerão aqui."}
            </StateText>
            <Button type="button" onClick={goToMenu}>
              Ver cardápio
            </Button>
          </StateCard>
        </HistoryContent>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HistoryContent>
        <HistoryHeader>
          <HistoryTitle>Meus pedidos</HistoryTitle>
          <HistoryDescription>
            Pedidos recentes feitos neste navegador, do mais novo para o mais antigo.
          </HistoryDescription>
        </HistoryHeader>

        {failedCount > 0 ? (
          <Notice role="status">
            <AlertTriangle size={18} />
            <span>
              Alguns pedidos não puderam ser atualizados. Tente novamente para completar a
              lista.
            </span>
          </Notice>
        ) : null}

        <HistoryList as="div" role="list">
          {orders.map(({ trackingCode, order }) => {
            const presentation = getStatusPresentation(order.status, order.deliveryType);

            return (
              <span key={trackingCode} role="listitem">
                <HistoryCard
                  type="button"
                  onClick={() =>
                    router.push(`/orders/${encodeURIComponent(trackingCode)}`)
                  }
                  aria-label={`Abrir acompanhamento do pedido ${order.orderNumber}`}
                >
                  <CardHeader>
                    <OrderIdentity>
                      <OrderNumber>Pedido #{order.orderNumber}</OrderNumber>
                      <OrderDate>{formatOrderDate(order.createdAt)}</OrderDate>
                    </OrderIdentity>
                    <StatusBadge tone={getStatusTone(order.status)}>
                      {presentation.title}
                    </StatusBadge>
                  </CardHeader>

                  <CardDetails>
                    <CardDetail>
                      <DetailLabel>Atendimento</DetailLabel>
                      <DetailValue>
                        {order.deliveryType === "DELIVERY" ? "Entrega" : "Retirada"}
                      </DetailValue>
                    </CardDetail>
                    <CardDetail>
                      <DetailLabel>Total</DetailLabel>
                      <DetailValue>{money(order.totalCents)}</DetailValue>
                    </CardDetail>
                    <CardDetail>
                      <DetailLabel>Situação</DetailLabel>
                      <DetailValue>{presentation.title}</DetailValue>
                    </CardDetail>
                  </CardDetails>

                  <CardAction>
                    Acompanhar pedido
                    <ChevronRight size={18} aria-hidden="true" />
                  </CardAction>
                </HistoryCard>
              </span>
            );
          })}
        </HistoryList>

        <StateActions>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => void loadOrders()}
          >
            <RefreshCw size={18} />
            {loading ? "Atualizando..." : "Atualizar pedidos"}
          </Button>
          <Button type="button" variant="ghost" onClick={goToMenu}>
            Voltar ao cardápio
          </Button>
        </StateActions>
      </HistoryContent>
    </PageShell>
  );
}
