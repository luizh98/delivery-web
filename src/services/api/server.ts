import { cookies, headers } from "next/headers";
import { ADMIN_TOKEN_COOKIE, backendBaseUrl } from "@/constants/api";
import { resolveTenantFromHeaders } from "@/utils/tenant";
import type {
  CurrentUserResponse,
  MenuResponse,
  OrderResponse,
  Product,
  ProductCategory,
  RestaurantConfigResponse,
} from "@/types/api";

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

export async function getAdminOrders() {
  return (await backendFetch<OrderResponse[]>("admin/orders")) ?? [];
}

export async function getAdminCategories() {
  return (await backendFetch<ProductCategory[]>("admin/product-categories")) ?? [];
}

export async function getAdminProducts() {
  return (await backendFetch<Product[]>("admin/products")) ?? [];
}
