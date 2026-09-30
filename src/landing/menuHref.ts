const allowedUtmKeys = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
] as const;

export function menuHrefFromSearchParams(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const key of allowedUtmKeys) {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) query.set(key, value.slice(0, 200));
  }
  const suffix = query.toString();
  return suffix ? `/?${suffix}` : "/";
}
