import type { OrderResponse } from "@/types/api";

export type OrdersManagerProps = {
  initialOrders: OrderResponse[];
  title: string;
  compact?: boolean;
};
