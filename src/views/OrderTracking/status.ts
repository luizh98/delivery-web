import type { DeliveryType, OrderStatus } from "@/types/api";

export type TrackingStep = {
  status: OrderStatus;
  label: string;
};

export type StatusPresentation = {
  title: string;
  description: string;
};

const DELIVERY_STEPS: TrackingStep[] = [
  { status: "RECEIVED", label: "Recebido" },
  { status: "CONFIRMED", label: "Confirmado" },
  { status: "PREPARING", label: "Em preparo" },
  { status: "OUT_FOR_DELIVERY", label: "Saiu para entrega" },
  { status: "COMPLETED", label: "Entregue" },
];

const PICKUP_STEPS: TrackingStep[] = [
  { status: "RECEIVED", label: "Recebido" },
  { status: "CONFIRMED", label: "Confirmado" },
  { status: "PREPARING", label: "Em preparo" },
  { status: "READY", label: "Pronto para retirada" },
  { status: "COMPLETED", label: "Retirado" },
];

export function getTrackingSteps(deliveryType: DeliveryType) {
  return deliveryType === "DELIVERY" ? DELIVERY_STEPS : PICKUP_STEPS;
}

export function getTrackingStatus(
  status: OrderStatus,
  deliveryType: DeliveryType,
): OrderStatus {
  return deliveryType === "DELIVERY" && status === "READY" ? "PREPARING" : status;
}

export function getStatusPresentation(
  status: OrderStatus,
  deliveryType: DeliveryType,
): StatusPresentation {
  switch (getTrackingStatus(status, deliveryType)) {
    case "RECEIVED":
      return {
        title: "Pedido recebido!",
        description: "Aguardando confirmação do restaurante.",
      };
    case "CONFIRMED":
      return {
        title: "Pedido confirmado",
        description: "Restaurante começará preparo em breve.",
      };
    case "PREPARING":
      return {
        title: "Pedido em preparo",
        description: "Cozinha está preparando seu pedido.",
      };
    case "READY":
      return deliveryType === "DELIVERY"
        ? {
            title: "Pedido pronto",
            description: "Aguardando saída para entrega.",
          }
        : {
            title: "Pronto para retirada",
            description: "Seu pedido já pode ser retirado no restaurante.",
          };
    case "OUT_FOR_DELIVERY":
      return {
        title: "Pedido saiu para entrega",
        description: "Seu pedido está a caminho.",
      };
    case "COMPLETED":
      return deliveryType === "DELIVERY"
        ? {
            title: "Pedido entregue",
            description: "Bom apetite!",
          }
        : {
            title: "Pedido retirado",
            description: "Bom apetite!",
          };
    case "CANCELED":
      return {
        title: "Pedido cancelado",
        description: "Este pedido não seguirá para preparo ou entrega.",
      };
    default:
      return {
        title: "Acompanhando pedido",
        description: "Consulte novamente em alguns instantes.",
      };
  }
}
