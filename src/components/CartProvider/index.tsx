"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { OrderResponse } from "@/types/api";

const STORAGE_KEY = "delivery-order-v1";
const CHANGE_EVENT = "delivery-cart-change";
const MAX_RECENT_ORDERS = 10;
const TRACKING_CODE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CartOption = {
  groupId: string;
  groupName: string;
  itemId: string;
  itemName: string;
  priceCents: number;
};

export type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitOriginalPriceCents?: number;
  unitPriceCents: number;
  discountAmountCents?: number;
  upsellCampaignId?: string;
  maximumPromotionalQuantity?: number;
  observations?: string;
  options: CartOption[];
  totalCents: number;
};

export const PENDING_UPSELL_STORAGE_KEY = "delivery:pending-upsell";

export type PendingUpsellOffer = {
  campaignId: string;
  productId: string;
};

export type CheckoutDraft = {
  customerName: string;
  customerPhone: string;
  deliveryType: "DELIVERY" | "PICKUP";
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: "" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
};

const EMPTY_CHECKOUT: CheckoutDraft = {
  customerName: "",
  customerPhone: "",
  deliveryType: "DELIVERY",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  paymentMethod: "",
};

type CartStorageSnapshotV1 = {
  version: 1;
  items: CartItem[];
  checkout: CheckoutDraft;
  lastOrder: OrderResponse | null;
};

type CartStorageSnapshotV2 = {
  version: 2;
  items: CartItem[];
  checkout: CheckoutDraft;
  lastOrder: OrderResponse | null;
  recentOrderTrackingCodes: string[];
};

type CartStorageSnapshot = {
  version: 3;
  items: CartItem[];
  checkout: CheckoutDraft;
  lastOrder: OrderResponse | null;
  recentOrderTrackingCodes: string[];
  recentOrders: OrderResponse[];
};

const EMPTY_SNAPSHOT: CartStorageSnapshot = {
  version: 3,
  items: [],
  checkout: EMPTY_CHECKOUT,
  lastOrder: null,
  recentOrderTrackingCodes: [],
  recentOrders: [],
};

let memorySnapshot = EMPTY_SNAPSHOT;
let cachedRaw: string | null = null;
let cachedSnapshot = EMPTY_SNAPSHOT;

function normalizeTrackingCodes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((code): code is string => typeof code === "string")
        .map((code) => code.trim())
        .filter((code) => TRACKING_CODE_PATTERN.test(code)),
    ),
  ).slice(0, MAX_RECENT_ORDERS);
}

function normalizeRecentOrders(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const trackingCodes = new Set<string>();

  return value
    .filter((order): order is OrderResponse => {
      if (!order || typeof order !== "object" || !Array.isArray(order.items)) {
        return false;
      }

      const trackingCode = order.trackingCode?.trim();

      if (!trackingCode || !TRACKING_CODE_PATTERN.test(trackingCode) || trackingCodes.has(trackingCode)) {
        return false;
      }

      trackingCodes.add(trackingCode);
      return true;
    })
    .slice(0, MAX_RECENT_ORDERS);
}

function parseSnapshot(raw: string | null): CartStorageSnapshot {
  if (!raw) {
    return EMPTY_SNAPSHOT;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("version" in parsed) ||
      (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3) ||
      !("items" in parsed) ||
      !Array.isArray(parsed.items) ||
      !("checkout" in parsed) ||
      !parsed.checkout ||
      typeof parsed.checkout !== "object"
    ) {
      return EMPTY_SNAPSHOT;
    }

    const stored = parsed as
      | CartStorageSnapshot
      | CartStorageSnapshotV2
      | CartStorageSnapshotV1;
    const lastOrder = "lastOrder" in stored ? stored.lastOrder : null;
    const recentOrderTrackingCodes =
      stored.version === 2 || stored.version === 3
        ? normalizeTrackingCodes(stored.recentOrderTrackingCodes)
        : normalizeTrackingCodes([lastOrder?.trackingCode]);
    const recentOrders =
      stored.version === 3
        ? normalizeRecentOrders(stored.recentOrders)
        : normalizeRecentOrders([lastOrder]);

    return {
      version: 3,
      items: stored.items,
      checkout: {
        ...EMPTY_CHECKOUT,
        ...stored.checkout,
      },
      lastOrder,
      recentOrderTrackingCodes,
      recentOrders,
    };
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function getSnapshot() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = parseSnapshot(raw);
      memorySnapshot = cachedSnapshot;
    }

    return cachedSnapshot;
  } catch {
    return memorySnapshot;
  }
}

function writeSnapshot(snapshot: CartStorageSnapshot) {
  memorySnapshot = snapshot;
  cachedSnapshot = snapshot;

  try {
    cachedRaw = JSON.stringify(snapshot);
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    cachedRaw = null;
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

type CartContextValue = {
  items: CartItem[];
  checkout: CheckoutDraft;
  lastOrder: OrderResponse | null;
  recentOrderTrackingCodes: string[];
  recentOrders: OrderResponse[];
  subtotalCents: number;
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  updateItemQuantity: (lineId: string, change: number) => void;
  removeItem: (lineId: string) => void;
  applyPromotionAdjustment: (
    lineId: string,
    eligible: boolean,
    originalPriceCents: number,
    offerPriceCents: number,
  ) => void;
  updateCheckout: (checkout: CheckoutDraft) => void;
  completeOrder: (order: OrderResponse) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SNAPSHOT);

  const updateItems = useCallback(
    (items: CartItem[], lastOrder = snapshot.lastOrder) => {
      writeSnapshot({ ...snapshot, items, lastOrder });
    },
    [snapshot],
  );

  const addItem = useCallback(
    (item: CartItem) => {
      updateItems([...snapshot.items, item]);
    },
    [snapshot.items, updateItems],
  );

  const addItems = useCallback((items: CartItem[]) => {
    const current = getSnapshot();
    writeSnapshot({ ...current, items: [...current.items, ...items] });
  }, []);

  const updateItemQuantity = useCallback(
    (lineId: string, change: number) => {
      updateItems(
        snapshot.items.map((item) => {
          if (item.lineId !== lineId) {
            return item;
          }

          const maximumQuantity =
            item.upsellCampaignId && item.maximumPromotionalQuantity
              ? item.maximumPromotionalQuantity
              : Number.MAX_SAFE_INTEGER;
          const quantity = Math.min(
            maximumQuantity,
            Math.max(1, item.quantity + change),
          );
          const optionsTotalCents = item.options.reduce(
            (sum, option) => sum + option.priceCents,
            0,
          );

          return {
            ...item,
            quantity,
            totalCents: (item.unitPriceCents + optionsTotalCents) * quantity,
          };
        }),
      );
    },
    [snapshot.items, updateItems],
  );

  const removeItem = useCallback(
    (lineId: string) => {
      updateItems(snapshot.items.filter((item) => item.lineId !== lineId));
    },
    [snapshot.items, updateItems],
  );

  const applyPromotionAdjustment = useCallback(
    (
      lineId: string,
      eligible: boolean,
      originalPriceCents: number,
      offerPriceCents: number,
    ) => {
      updateItems(
        snapshot.items.map((item) => {
          if (item.lineId !== lineId) {
            return item;
          }
          const unitPriceCents = eligible
            ? offerPriceCents
            : originalPriceCents;
          const optionsTotalCents = item.options.reduce(
            (sum, option) => sum + option.priceCents,
            0,
          );
          return {
            ...item,
            unitOriginalPriceCents: originalPriceCents,
            unitPriceCents,
            discountAmountCents:
              (originalPriceCents - unitPriceCents) * item.quantity,
            upsellCampaignId: eligible ? item.upsellCampaignId : undefined,
            maximumPromotionalQuantity: eligible
              ? item.maximumPromotionalQuantity
              : undefined,
            totalCents: (unitPriceCents + optionsTotalCents) * item.quantity,
          };
        }),
      );
    },
    [snapshot.items, updateItems],
  );

  const updateCheckout = useCallback(
    (checkout: CheckoutDraft) => {
      writeSnapshot({ ...getSnapshot(), checkout });
    },
    [],
  );

  const completeOrder = useCallback(
    (lastOrder: OrderResponse) => {
      const { checkout, recentOrderTrackingCodes, recentOrders } = getSnapshot();
      const trackingCode = lastOrder.trackingCode?.trim();

      writeSnapshot({
        version: 3,
        items: [],
        checkout: {
          ...EMPTY_CHECKOUT,
          deliveryType: checkout.deliveryType,
          street: checkout.street,
          number: checkout.number,
          complement: checkout.complement,
          neighborhood: checkout.neighborhood,
          city: checkout.city,
          state: checkout.state,
          zipCode: checkout.zipCode,
        },
        lastOrder,
        recentOrderTrackingCodes: trackingCode
          ? normalizeTrackingCodes([trackingCode, ...recentOrderTrackingCodes])
          : recentOrderTrackingCodes,
        recentOrders: trackingCode
          ? normalizeRecentOrders([lastOrder, ...recentOrders])
          : recentOrders,
      });
    },
    [],
  );

  return (
    <CartContext.Provider
      value={{
        items: snapshot.items,
        checkout: snapshot.checkout,
        lastOrder: snapshot.lastOrder,
        recentOrderTrackingCodes: snapshot.recentOrderTrackingCodes,
        recentOrders: snapshot.recentOrders,
        subtotalCents: snapshot.items.reduce(
          (sum, item) => sum + item.totalCents,
          0,
        ),
        addItem,
        addItems,
        updateItemQuantity,
        removeItem,
        applyPromotionAdjustment,
        updateCheckout,
        completeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
