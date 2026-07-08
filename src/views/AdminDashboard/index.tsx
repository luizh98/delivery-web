import { ClipboardList, CookingPot, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { getAdminOrders } from "@/services/api/server";
import { statusLabel } from "@/utils/format";
import styles from "./styles.module.css";

export async function AdminDashboardView() {
  const orders = await getAdminOrders();
  const activeOrders = orders.filter(
    (order) => order.status !== "COMPLETED" && order.status !== "CANCELED",
  );

  const links = [
    { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
    { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
    { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
    { href: "/admin/settings", label: "Configuracao", icon: Settings },
  ];

  return (
    <div className={styles.root}>
      <div>
        <h1 className={styles.title}>Painel</h1>
        <p className={styles.subtitle}>Operacao do restaurante.</p>
      </div>

      <section className={styles.metricsGrid}>
        <Metric label="Pedidos ativos" value={activeOrders.length.toString()} />
        <Metric label="Total de pedidos" value={orders.length.toString()} />
        <Metric
          label="Ultimo status"
          value={orders[0] ? statusLabel(orders[0].status) : "-"}
        />
      </section>

      <section className={styles.linksGrid}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              className={styles.link}
              href={item.href}
            >
              <Icon size={20} className={styles.linkIcon} />
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
    <div className={styles.metric}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </div>
  );
}
