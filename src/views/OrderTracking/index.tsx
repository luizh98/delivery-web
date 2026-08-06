"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CircleX, Clock3, RefreshCw, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import { PageShell } from "@/components/PageShell";
import { ApiError, clientApi } from "@/services/api/client";
import type {
  PaymentMethod,
  PublicOrderTrackingResponse,
} from "@/types/api";
import { money } from "@/utils/format";
import { getStatusPresentation, getTrackingSteps } from "./status";
import {
  Actions,
  EmptyState,
  Notice,
  OrderMeta,
  SectionTitle,
  StatusCard,
  StatusDescription,
  StatusIcon,
  StatusTitle,
  SummaryCard,
  SummaryList,
  SummaryRow,
  Timeline,
  TimelineCard,
  TimelineContent,
  TimelineItem,
  TimelineLabel,
  TimelineLine,
  TimelineMarker,
  TimelineRail,
  TimelineTime,
  TrackingPageContent,
  trackingPulseKeyframes,
} from "./styles";

const POLLING_INTERVAL_MS = 60_000;

const paymentLabels: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
};

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

type OrderTrackingViewProps = {
  trackingCode: string;
  initialOrder: PublicOrderTrackingResponse | null;
};

function formatTime(value?: string) {
  if (!value) {
    return "agora";
  }

  return timeFormatter.format(new Date(value));
}

function historyTime(order: PublicOrderTrackingResponse, status: string) {
  for (let index = order.statusHistory.length - 1; index >= 0; index -= 1) {
    if (order.statusHistory[index].status === status) {
      return order.statusHistory[index].changedAt;
    }
  }

  return undefined;
}

function progressStatus(order: PublicOrderTrackingResponse) {
  if (order.status !== "CANCELED") {
    return order.status;
  }

  for (let index = order.statusHistory.length - 1; index >= 0; index -= 1) {
    if (order.statusHistory[index].status !== "CANCELED") {
      return order.statusHistory[index].status;
    }
  }

  return "RECEIVED";
}

export function OrderTrackingView({
  trackingCode,
  initialOrder,
}: OrderTrackingViewProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const initialRequestStarted = useRef(Boolean(initialOrder));

  const loadOrder = useCallback(async () => {
    if (activeRequest.current) {
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setRefreshing(true);

    try {
      const updated = await clientApi<PublicOrderTrackingResponse>(
        `public/orders/tracking/${encodeURIComponent(trackingCode)}`,
        { signal: controller.signal, cache: "no-store" },
      );
      setOrder(updated);
      setNotFound(false);
      setRefreshError(false);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        setOrder(null);
        setNotFound(true);
        setRefreshError(false);
      } else {
        setRefreshError(true);
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [trackingCode]);

  const hasOrder = Boolean(order);
  const terminal = order?.status === "COMPLETED" || order?.status === "CANCELED";

  useEffect(() => {
    if (!initialRequestStarted.current && !hasOrder && !notFound) {
      initialRequestStarted.current = true;
      void loadOrder();
    }
  }, [hasOrder, loadOrder, notFound]);

  useEffect(() => {
    if (terminal || notFound) {
      return;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadOrder();
      }
    }, POLLING_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadOrder();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadOrder, notFound, terminal]);

  useEffect(() => {
    return () => activeRequest.current?.abort();
  }, []);

  if (loading && !order) {
    return (
      <PageShell>
        <TrackingPageContent>
          <BackButton onClick={() => router.push("/")} />
          <EmptyState aria-live="polite">
            <RefreshCw size={32} />
            <StatusTitle>Buscando seu pedido</StatusTitle>
            <p>Carregando status mais recente.</p>
          </EmptyState>
        </TrackingPageContent>
      </PageShell>
    );
  }

  if (notFound) {
    return (
      <PageShell>
        <TrackingPageContent>
          <BackButton onClick={() => router.push("/")} />
          <EmptyState>
            <SearchX size={36} />
            <StatusTitle>Pedido não encontrado</StatusTitle>
            <p>Confira link recebido ou volte ao cardápio para fazer novo pedido.</p>
            <Button type="button" onClick={() => router.push("/")}>
              Voltar ao cardápio
            </Button>
          </EmptyState>
        </TrackingPageContent>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell>
        <TrackingPageContent>
          <BackButton onClick={() => router.push("/")} />
          <EmptyState>
            <RefreshCw size={36} />
            <StatusTitle>Status indisponível</StatusTitle>
            <p>Não foi possível carregar pedido agora. Tente novamente.</p>
            <Actions>
              <Button type="button" onClick={() => void loadOrder()} disabled={refreshing}>
                Tentar novamente
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                Voltar ao cardápio
              </Button>
            </Actions>
          </EmptyState>
        </TrackingPageContent>
      </PageShell>
    );
  }

  const presentation = getStatusPresentation(order.status, order.deliveryType);
  const steps = getTrackingSteps(order.deliveryType);
  const currentStatus = progressStatus(order);
  const currentIndex = steps.findIndex((step) => step.status === currentStatus);
  const updatedAt = order.updatedAt ?? order.statusHistory.at(-1)?.changedAt;
  const iconTone = order.status === "CANCELED"
    ? "canceled"
    : order.status === "COMPLETED"
      ? "completed"
      : "active";

  return (
    <PageShell>
      <TrackingPageContent>
        <style>{trackingPulseKeyframes}</style>
        <BackButton onClick={() => router.push("/")} />
        <StatusCard aria-live="polite">
          <StatusIcon tone={iconTone}>
            {order.status === "CANCELED" ? (
              <CircleX size={32} />
            ) : order.status === "COMPLETED" ? (
              <Check size={32} />
            ) : (
              <Clock3 size={32} />
            )}
          </StatusIcon>
          <StatusTitle>{presentation.title}</StatusTitle>
          <StatusDescription>{presentation.description}</StatusDescription>
          <OrderMeta>
            <strong>Pedido #{order.orderNumber}</strong>
            <span>Atualizado às {formatTime(updatedAt)}</span>
          </OrderMeta>
        </StatusCard>

        {order.status === "CANCELED" ? (
          <Notice tone="danger" role="alert">
            {order.cancellation?.reason
              ? `Motivo: ${order.cancellation.reason}`
              : "Entre em contato com restaurante se precisar de ajuda."}
          </Notice>
        ) : null}

        {refreshError ? (
          <Notice tone="warning" role="status">
            Não foi possível atualizar agora. Último status conhecido continua exibido.
          </Notice>
        ) : null}

        <TimelineCard>
          <SectionTitle>Acompanhe seu pedido</SectionTitle>
          <Timeline>
            {steps.map((step, index) => {
              const completed = order.status === "COMPLETED" || index < currentIndex;
              const state = completed
                ? "completed"
                : index === currentIndex
                  ? "current"
                  : "upcoming";
              const changedAt = historyTime(order, step.status);

              return (
                <TimelineItem key={step.status}>
                  <TimelineRail>
                    <TimelineMarker state={state}>
                      {completed ? <Check size={15} /> : index + 1}
                    </TimelineMarker>
                    {index < steps.length - 1 ? (
                      <TimelineLine completed={completed} />
                    ) : null}
                  </TimelineRail>
                  <TimelineContent state={state}>
                    <TimelineLabel>{step.label}</TimelineLabel>
                    {changedAt ? (
                      <TimelineTime>{formatTime(changedAt)}</TimelineTime>
                    ) : null}
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </TimelineCard>

        <SummaryCard>
          <SectionTitle>Resumo</SectionTitle>
          <SummaryList>
            <SummaryRow>
              <dt>Atendimento</dt>
              <dd>{order.deliveryType === "DELIVERY" ? "Entrega" : "Retirada"}</dd>
            </SummaryRow>
            <SummaryRow>
              <dt>Pagamento</dt>
              <dd>
                {order.paymentMethod
                  ? paymentLabels[order.paymentMethod]
                  : "Não informado"}
              </dd>
            </SummaryRow>
            <SummaryRow>
              <dt>Total</dt>
              <dd>{money(order.totalCents)}</dd>
            </SummaryRow>
          </SummaryList>
        </SummaryCard>

        <Actions>
          <Button type="button" onClick={() => router.push("/")}>
            Voltar ao cardápio
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadOrder()}
            disabled={refreshing}
          >
            <RefreshCw size={16} />
            {refreshing ? "Atualizando..." : "Atualizar status"}
          </Button>
        </Actions>
      </TrackingPageContent>
    </PageShell>
  );
}
