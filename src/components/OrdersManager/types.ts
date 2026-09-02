import type { OrderResponse, OrderStatus } from "@/types/api";

export type OrdersManagerProps = {
  initialOrders: OrderResponse[];
  visibleStatuses?: OrderStatus[];
  title: string;
  compact?: boolean;
  automaticOrderConfirmation?: boolean;
  overdueOrderAlertEnabled?: boolean;
  overdueOrderAlertMinutes?: number;
};
