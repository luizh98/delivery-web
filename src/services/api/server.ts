import { cookies, headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { ADMIN_TOKEN_COOKIE, backendBaseUrl } from "@/constants/api";
import { restaurantConfigCacheTag } from "@/services/api/cache";
import { resolveTenantFromHeaders } from "@/utils/tenant";
import type {
  AdminCustomerPage,
  AdminUserResponse,
  CurrentUserResponse,
  DeliveryRouteResponse,
  MenuResponse,
  OrderResponse,
  OrderStatus,
  Product,
  ProductCategory,
  ProductOptionGroupTemplate,
  MotoboyResponse,
  PromotionCombo,
  PromotionComboPublicResponse,
  PublicOrderTrackingResponse,
  PublicTableResponse,
  RestaurantConfigResponse,
  TableResponse,
  UpsellCampaign,
} from "@/types/api";

const emptyAdminCustomerPage: AdminCustomerPage = {
  items: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

const restaurantConfigCacheRevalidateSeconds = 60;

async function backendFetch<T>(path: string, init?: RequestInit) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const tenantSlug = resolveTenantFromHeaders(headerStore);
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  const requestHeaders = new Headers(init?.headers);

  requestHeaders.set("X-Tenant-Slug", tenantSlug);
  requestHeaders.set("Accept", "application/json");

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${backendBaseUrl()}/api/${path}`, {
      ...init,
      headers: requestHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function fetchRestaurantConfig(tenantSlug: string) {
  const response = await fetch(`${backendBaseUrl()}/api/public/restaurant/config`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Slug": tenantSlug,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not fetch restaurant config");
  }

  return response.json() as Promise<RestaurantConfigResponse>;
}

function getCachedRestaurantConfig(tenantSlug: string) {
  return unstable_cache(
    () => fetchRestaurantConfig(tenantSlug),
    ["restaurant-config", tenantSlug],
    {
      revalidate: restaurantConfigCacheRevalidateSeconds,
      tags: [restaurantConfigCacheTag(tenantSlug)],
    },
  )();
}

export async function getRestaurantConfig() {
  const headerStore = await headers();
  const tenantSlug = resolveTenantFromHeaders(headerStore);

  try {
    return await getCachedRestaurantConfig(tenantSlug);
  } catch {
    return null;
  }
}

export async function getCurrentTenantSlug() {
  const headerStore = await headers();
  return resolveTenantFromHeaders(headerStore);
}

export async function getPublicOrderTracking(trackingCode: string) {
  return backendFetch<PublicOrderTrackingResponse>(
    `public/orders/tracking/${encodeURIComponent(trackingCode)}`,
  );
}

export async function getMenu() {
  return (
    (await backendFetch<MenuResponse>("public/menu")) ?? {
      categories: [],
      products: [],
    }
  );
}

export async function getAdminUser() {
  return backendFetch<CurrentUserResponse>("auth/me");
}

export async function getAdminOrders(statuses: OrderStatus[]) {
  const query = new URLSearchParams();
  statuses.forEach((status) => query.append("status", status));
  return (await backendFetch<OrderResponse[]>(`admin/orders?${query}`)) ?? [];
}

export async function getAdminDeliveryRoutes() {
  return (await backendFetch<DeliveryRouteResponse[]>("admin/delivery-routes")) ?? [];
}

export async function getAdminTables() {
  return (await backendFetch<TableResponse[]>("admin/tables")) ?? [];
}

export async function getPublicTable(token: string) {
  return backendFetch<PublicTableResponse>(
    `public/tables/${encodeURIComponent(token)}`,
  );
}

export async function getMotoboyDeliveryRoutes() {
  return (await backendFetch<DeliveryRouteResponse[]>("admin/motoboy/delivery-routes")) ?? [];
}

export async function getAdminMotoboys() {
  return (await backendFetch<MotoboyResponse[]>("admin/motoboys")) ?? [];
}

export async function getAdminCustomers() {
  return (
    (await backendFetch<AdminCustomerPage>("admin/customers?page=0&size=20")) ??
    emptyAdminCustomerPage
  );
}

export async function getAdminUsers() {
  return (await backendFetch<AdminUserResponse[]>("admin/users")) ?? [];
}

export async function getAdminCategories() {
  return (await backendFetch<ProductCategory[]>("admin/product-categories")) ?? [];
}

export async function getAdminProducts() {
  return (await backendFetch<Product[]>("admin/products")) ?? [];
}

export async function getAdminProductOptionGroups() {
  return (await backendFetch<ProductOptionGroupTemplate[]>("admin/product-option-groups")) ?? [];
}

export async function getAdminUpsellCampaigns() {
  return (await backendFetch<UpsellCampaign[]>("admin/upsell-campaigns")) ?? [];
}

export async function getAdminPromotionCombos() {
  return (await backendFetch<PromotionCombo[]>("admin/promotion-combos")) ?? [];
}

export async function getPublicPromotionCombo(code: string) {
  return backendFetch<PromotionComboPublicResponse>(
    `public/promotion-combos/${encodeURIComponent(code)}`,
  );
}
