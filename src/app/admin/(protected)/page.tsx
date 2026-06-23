import { ClipboardList, CookingPot, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { getAdminOrders } from "@/lib/api/server";
import { statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const orders = await getAdminOrders();
  const activeOrders = orders.filter((order) => order.status !== "COMPLETED" && order.status !== "CANCELED");

  const links = [
    { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
    { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
    { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
    { href: "/admin/settings", label: "Configuracao", icon: Settings },
  ];

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-sm text-muted">Operacao do restaurante.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Pedidos ativos" value={activeOrders.length.toString()} />
        <Metric label="Total de pedidos" value={orders.length.toString()} />
        <Metric
          label="Ultimo status"
          value={orders[0] ? statusLabel(orders[0].status) : "-"}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              className="flex items-center gap-3 rounded-md border border-border bg-surface p-4 font-semibold hover:border-primary"
              href={item.href}
            >
              <Icon size={20} className="text-primary" />
              {item.label}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
