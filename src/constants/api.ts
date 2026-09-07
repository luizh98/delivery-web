export const ADMIN_TOKEN_COOKIE = "delivery_admin_token";
export const CUSTOMER_TOKEN_COOKIE = "delivery_customer_token";
export const CUSTOMER_SESSION_COOKIE = "delivery_customer_session";
export const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 10;

export function backendBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}
