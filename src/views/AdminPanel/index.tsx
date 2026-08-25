import Link from "next/link";
import {
  ClipboardList,
  CookingPot,
  Printer,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import {
  Header,
  LinkCard,
  LinkIcon,
  LinksGrid,
  Root,
  SectionSubtitle,
  SectionTitle,
  Subtitle,
  Title,
} from "@/views/AdminDashboard/styles";

const shortcuts = [
  { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/printer", label: "Impressora", icon: Printer },
  { href: "/admin/kitchen", label: "Cozinha", icon: CookingPot },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/catalog/products", label: "Produtos", icon: Tags },
  { href: "/admin/settings", label: "Configuração", icon: Settings },
];

export function AdminPanelView() {
  return (
    <Root>
      <Header>
        <div>
          <Title>Painel</Title>
          <Subtitle>Atalhos para a operação e configuração do restaurante</Subtitle>
        </div>
      </Header>
      <div>
        <SectionTitle>Acessos rápidos</SectionTitle>
        <SectionSubtitle>Escolha uma área para continuar.</SectionSubtitle>
      </div>
      <LinksGrid>
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <LinkCard key={item.href} as={Link} href={item.href}>
              <LinkIcon><Icon size={20} /></LinkIcon>
              {item.label}
            </LinkCard>
          );
        })}
      </LinksGrid>
    </Root>
  );
}
