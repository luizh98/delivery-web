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
  notes: string;
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
  notes: "",
};

type CartStorageSnapshot = {
  version: 1;
  items: CartItem[];
  checkout: CheckoutDraft;
  lastOrder: OrderResponse | null;
};

const EMPTY_SNAPSHOT: CartStorageSnapshot = {
  version: 1,
  items: [],
  checkout: EMPTY_CHECKOUT,
  lastOrder: null,
};

let memorySnapshot = EMPTY_SNAPSHOT;
let cachedRaw: string | null = null;
let cachedSnapshot = EMPTY_SNAPSHOT;

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
      parsed.version !== 1 ||
      !("items" in parsed) ||
      !Array.isArray(parsed.items) ||
      !("checkout" in parsed) ||
      !parsed.checkout ||
      typeof parsed.checkout !== "object"
    ) {
      return EMPTY_SNAPSHOT;
    }

    return {
      ...(parsed as CartStorageSnapshot),
      checkout: {
        ...EMPTY_CHECKOUT,
        ...(parsed as CartStorageSnapshot).checkout,
      },
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
  subtotalCents: number;
  addItem: (item: CartItem) => void;
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
      updateItems([...snapshot.items, item], null);
    },
    [snapshot.items, updateItems],
  );

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
      const { checkout } = getSnapshot();

      writeSnapshot({
        version: 1,
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
        subtotalCents: snapshot.items.reduce(
          (sum, item) => sum + item.totalCents,
          0,
        ),
        addItem,
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
