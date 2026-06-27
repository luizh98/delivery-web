export const ADMIN_TOKEN_COOKIE = "delivery_admin_token";

export function backendBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}
