export type NavigationRole = "admin" | "motoboy" | "waiter" | "standard";

export function navigationRole(roles: string[]): NavigationRole {
  if (roles.includes("ADMIN")) return "admin";
  if (roles.includes("ENTREGADOR")) return "motoboy";
  if (roles.includes("WAITER") && !roles.includes("STANDARD")) return "waiter";
  return "standard";
}

export function navigationHome(role: NavigationRole) {
  return role === "waiter" ? "/hall" : role === "motoboy" ? "/admin/deliveries" : "/admin";
}

export function navigationItemVisible(item: { href: string; adminOnly?: boolean }, role: NavigationRole) {
  if (role === "waiter") return item.href === "/hall";
  if (role === "motoboy") return item.href === "/admin/deliveries";
  return !item.adminOnly || role === "admin";
}
