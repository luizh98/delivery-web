import type { OrderResponse } from "@/types/api";

export type OrdersManagerProps = {
  initialOrders: OrderResponse[];
  allOrders?: OrderResponse[];
  title: string;
  compact?: boolean;
};
