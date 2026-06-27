const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function defaultTenantSlug() {
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? "demo";
}

export function resolveTenantFromHost(host?: string | null) {
  if (!host) {
    return defaultTenantSlug();
  }

  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || LOCAL_HOSTS.has(hostname)) {
    return defaultTenantSlug();
  }

  if (hostname.endsWith(".localhost")) {
    return hostname.split(".")[0] || defaultTenantSlug();
  }

  const parts = hostname.split(".");
  if (parts.length < 3 || parts[0] === "www") {
    return defaultTenantSlug();
  }

  return parts[0] || defaultTenantSlug();
}

export function resolveTenantFromHeaders(headers: Headers) {
  return (
    headers.get("x-tenant-slug") ??
    resolveTenantFromHost(headers.get("host"))
  );
}
