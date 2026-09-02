"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { OrderResponse } from "@/types/api";

type OrderListener = (order: OrderResponse) => void;

const AdminOrderEventsContext = createContext<{
  subscribe: (listener: OrderListener) => () => void;
} | null>(null);

export function AdminOrderEventsProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<OrderListener>());

  useEffect(() => {
    const events = new EventSource("/api/backend/admin/orders/events");
    const handleOrder = (event: MessageEvent<string>) => {
      const order = JSON.parse(event.data) as OrderResponse;
      listenersRef.current.forEach((listener) => listener(order));
    };

    events.addEventListener("order", handleOrder);
    return () => {
      events.removeEventListener("order", handleOrder);
      events.close();
    };
  }, []);

  const subscribe = useCallback((listener: OrderListener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const value = useMemo(() => ({ subscribe }), [subscribe]);
  return (
    <AdminOrderEventsContext.Provider value={value}>
      {children}
    </AdminOrderEventsContext.Provider>
  );
}

export function useAdminOrderEvents() {
  const context = useContext(AdminOrderEventsContext);
  if (!context) {
    throw new Error("useAdminOrderEvents must be used inside AdminOrderEventsProvider.");
  }
  return context.subscribe;
}
