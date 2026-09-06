export type MetaPixelConfig = {
  pixelId?: string | null;
  enabled?: boolean;
};

export type TrackedProduct = {
  id: string;
  name: string;
  priceCents: number;
};

export type TrackedCartItem = {
  id: string;
  name: string;
  quantity: number;
  valueCents: number;
};

export type TrackedCart = {
  valueCents: number;
  itemCount: number;
};

export type TrackedOrder = {
  id: string;
  valueCents: number;
  itemIds?: string[];
};

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
  queue?: unknown[][];
};

type TrackingDocument = Pick<Document, "createElement" | "getElementById"> & {
  head: {
    appendChild: (element: Node) => Node;
  };
};

export type TrackingWindow = {
  fbq?: Fbq;
  _fbq?: Fbq;
  document: TrackingDocument;
  localStorage?: Pick<Storage, "getItem" | "setItem">;
};

const META_PIXEL_SCRIPT_ID = "meta-pixel-script";
const META_PIXEL_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";
const PURCHASE_STORAGE_PREFIX = "delivery:tracking";
const META_PIXEL_ID_PATTERN = /^[0-9]{5,20}$/;

export function isValidMetaPixelId(value?: string | null) {
  return Boolean(value && META_PIXEL_ID_PATTERN.test(value.trim()));
}

function valueInReais(valueCents: number) {
  return valueCents / 100;
}

export class TrackingService {
  private current: { tenantId: string; pixelId: string } | null = null;
  private readonly initializedPixelIds = new Set<string>();
  private readonly sentPageViews = new Set<string>();
  private readonly sentPurchases = new Set<string>();
  private scriptRequested = false;

  private readonly browser: TrackingWindow;

  constructor(browser: TrackingWindow) {
    this.browser = browser;
  }

  configure(tenantId: string | null | undefined, config?: MetaPixelConfig | null) {
    const normalizedTenantId = tenantId?.trim().toLowerCase();
    const pixelId = config?.pixelId?.trim();
    if (
      !normalizedTenantId ||
      !config?.enabled ||
      !pixelId ||
      !isValidMetaPixelId(pixelId)
    ) {
      this.current = null;
      return;
    }

    this.current = { tenantId: normalizedTenantId, pixelId };
    const fbq = this.ensureFbq();
    this.loadScript();

    if (!this.initializedPixelIds.has(pixelId)) {
      fbq("init", pixelId);
      this.initializedPixelIds.add(pixelId);
    }
  }

  pageView() {
    const tenantId = this.current?.tenantId;
    if (!tenantId || this.sentPageViews.has(tenantId)) {
      return;
    }

    if (this.dispatch("PageView")) {
      this.sentPageViews.add(tenantId);
    }
  }

  viewContent(product: TrackedProduct) {
    this.dispatch("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: valueInReais(product.priceCents),
      currency: "BRL",
    });
  }

  addToCart(item: TrackedCartItem) {
    this.dispatch("AddToCart", {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      quantity: item.quantity,
      value: valueInReais(item.valueCents),
      currency: "BRL",
    });
  }

  initiateCheckout(cart: TrackedCart) {
    this.dispatch("InitiateCheckout", {
      value: valueInReais(cart.valueCents),
      num_items: cart.itemCount,
      currency: "BRL",
    });
  }

  purchase(order: TrackedOrder) {
    const tenantId = this.current?.tenantId;
    if (!tenantId || !order.id) {
      return;
    }

    const key = `${PURCHASE_STORAGE_PREFIX}:${tenantId}:purchase:${order.id}`;
    if (this.sentPurchases.has(key) || this.hasStoredPurchase(key)) {
      return;
    }

    const sent = this.dispatch("Purchase", {
      ...(order.itemIds?.length
        ? { content_ids: order.itemIds, content_type: "product" }
        : {}),
      order_id: order.id,
      value: valueInReais(order.valueCents),
      currency: "BRL",
    });

    if (sent) {
      this.sentPurchases.add(key);
      this.storePurchase(key);
    }
  }

  private dispatch(event: string, parameters?: Record<string, unknown>) {
    const pixelId = this.current?.pixelId;
    if (!pixelId) {
      return false;
    }

    const fbq = this.ensureFbq();
    try {
      if (parameters) {
        fbq("trackSingle", pixelId, event, parameters);
      } else {
        fbq("trackSingle", pixelId, event);
      }
      return true;
    } catch {
      return false;
    }
  }

  private ensureFbq() {
    if (this.browser.fbq) {
      return this.browser.fbq;
    }

    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue?.push(args);
      }
    }) as Fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = fbq;
    fbq.queue = [];
    this.browser.fbq = fbq;
    this.browser._fbq = fbq;
    return fbq;
  }

  private loadScript() {
    if (
      this.scriptRequested ||
      this.browser.document.getElementById(META_PIXEL_SCRIPT_ID)
    ) {
      return;
    }

    this.scriptRequested = true;
    const script = this.browser.document.createElement("script");
    script.id = META_PIXEL_SCRIPT_ID;
    script.async = true;
    script.src = META_PIXEL_SCRIPT_URL;
    this.browser.document.head.appendChild(script);
  }

  private hasStoredPurchase(key: string) {
    try {
      return this.browser.localStorage?.getItem(key) === "1";
    } catch {
      return false;
    }
  }

  private storePurchase(key: string) {
    try {
      this.browser.localStorage?.setItem(key, "1");
    } catch {
      // Tracking must never block the order flow.
    }
  }
}
