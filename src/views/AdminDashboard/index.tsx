import { ClipboardList, CookingPot, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { getAdminOrders } from "@/services/api/server";
import { statusLabel } from "@/utils/format";
import {
  LinkCard,
  LinkIcon,
  LinksGrid,
  MetricLabel,
  MetricRoot,
  MetricValue,
  MetricsGrid,
  Root,
  Subtitle,
  Title,
} from "./styles";

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
    <Root>
      <div>
        <Title>Painel</Title>
        <Subtitle>Operacao do restaurante.</Subtitle>
      </div>

      <MetricsGrid>
        <Metric label="Pedidos ativos" value={activeOrders.length.toString()} />
        <Metric label="Total de pedidos" value={orders.length.toString()} />
        <Metric
          label="Ultimo status"
          value={orders[0] ? statusLabel(orders[0].status) : "-"}
        />
      </MetricsGrid>

      <LinksGrid>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <LinkCard
              key={item.href}
              as={Link}
              href={item.href}
            >
              <LinkIcon>
                <Icon size={20} />
              </LinkIcon>
              {item.label}
            </LinkCard>
          );
        })}
      </LinksGrid>
    </Root>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <MetricRoot>
      <MetricLabel>{label}</MetricLabel>
      <MetricValue>{value}</MetricValue>
    </MetricRoot>
  );
}
