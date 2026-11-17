import { randomBytes } from "node:crypto";

export const TABLE_DEVICE_COOKIE = "flyfoods_table_device";
export const tableDeviceCookieOptions = {
  httpOnly: true, sameSite: "lax" as const, path: "/",
  secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365,
};

export function tableDeviceToken(existing?: string) {
  return existing && /^[A-Za-z0-9_-]{43}$/.test(existing)
    ? existing : randomBytes(32).toString("base64url");
}

export function usesTableDevice(path: string[], method: string) {
  return path[0] === "public" && (path[1] === "tables" || (path[1] === "orders" && path.length === 2 && method === "POST"));
}
