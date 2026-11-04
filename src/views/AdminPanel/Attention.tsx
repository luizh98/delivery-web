import Link from "next/link";
import { ArrowRight, Clock3, PackageX } from "lucide-react";
import { getAdminAttention } from "@/services/api/server";
import { statusLabel } from "@/utils/format";
import { SectionSubtitle, SectionTitle } from "@/views/AdminDashboard/styles";
import { stalledOrderHours } from "./stalledOrders";
import { AttentionAction } from "./AttentionAction";
import { Action, Count, Detail, Duration, Grid, Group, Heading, List, Message, Root, Row } from "./Attention.styles";

export async function AdminAttention() {
  const { products, orders, now } = await getAdminAttention();
  const inactive = products?.filter((product) => !product.active);
  const stalled = orders?.flatMap((order) => {
    const hours = stalledOrderHours(order, now);
    return hours === null ? [] : [{ order, hours }];
  }).sort((a, b) => b.hours - a.hours);

  return (
    <Root aria-labelledby="attention-title">
      <SectionTitle id="attention-title">Pontos de atenção</SectionTitle>
      <SectionSubtitle>Revise o cardápio e os pedidos que precisam de acompanhamento.</SectionSubtitle>
      <Grid>
        <Group aria-labelledby="inactive-title">
          <Heading id="inactive-title"><PackageX size={18} aria-hidden="true" />Produtos desativados {inactive && <Count>{inactive.length}</Count>}</Heading>
          <Detail>Produtos que não estão disponíveis no cardápio.</Detail>
          {inactive ? inactive.length ? (
            <List>{inactive.map((product) => <Row key={product.id}><div className="min-w-0 flex-1"><span>{product.name}</span><Detail>Desativado</Detail></div><AttentionAction kind="product" id={product.id} name={product.name} /></Row>)}</List>
          ) : <Message>Nenhum produto desativado.</Message> : <Message role="status">Não foi possível carregar os produtos. Recarregue a página para tentar novamente.</Message>}
          <Action as={Link} href="/admin/catalog/products">Gerenciar produtos<ArrowRight size={16} aria-hidden="true" /></Action>
        </Group>
        <Group aria-labelledby="stalled-title">
          <Heading id="stalled-title"><Clock3 size={18} aria-hidden="true" />Pedidos parados {stalled && <Count>{stalled.length}</Count>}</Heading>
          <Detail>Há mais de 24h no mesmo status, sem concluídos ou cancelados.</Detail>
          {stalled ? stalled.length ? (
            <List>{stalled.map(({ order, hours }) => (
              <Row key={order.id}>
                <div className="min-w-0 flex-1"><strong>Pedido #{order.orderNumber ?? order.id}</strong><Detail>{order.customer.name} · {statusLabel(order.status, order.deliveryType)}</Detail><Duration>{hours}h no status</Duration></div>
                <AttentionAction kind="order" id={order.id} name={order.orderNumber ?? order.id} />
              </Row>
            ))}</List>
          ) : <Message>Nenhum pedido parado há mais de 24h.</Message> : <Message role="status">Não foi possível carregar os pedidos. Recarregue a página para tentar novamente.</Message>}
          <Action as={Link} href="/admin/orders">Revisar pedidos<ArrowRight size={16} aria-hidden="true" /></Action>
        </Group>
      </Grid>
    </Root>
  );
}
