import { cookies, headers } from "next/headers";
import { ADMIN_TOKEN_COOKIE, backendBaseUrl } from "@/constants/api";
import { resolveTenantFromHeaders } from "@/utils/tenant";
import type {
  AdminCustomerPage,
  AdminUserResponse,
  CurrentUserResponse,
  MenuResponse,
  OrderResponse,
  OrderStatus,
  Product,
  ProductCategory,
  ProductOptionGroupTemplate,
  PublicOrderTrackingResponse,
  RestaurantConfigResponse,
  UpsellCampaign,
} from "@/types/api";

const emptyAdminCustomerPage: AdminCustomerPage = {
  items: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

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

export async function getRestaurantConfig() {
  return backendFetch<RestaurantConfigResponse>("public/restaurant/config");
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
