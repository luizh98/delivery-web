import type { AuditFilters } from "./types";

export const auditActions = { CREATE: "Criação", UPDATE: "Alteração", DELETE: "Exclusão" };
export const auditStatuses = {
  APPLIED: "Concluído",
  NO_CHANGE: "Sem mudança",
  PENDING: "Conclusão pendente",
  UNCONFIRMED: "Resultado não confirmado",
};

export const auditCollections: Record<string, string> = {
  products: "Produtos",
  product_categories: "Categorias",
  product_option_groups: "Grupos de opções",
  restaurant_configs: "Configurações da loja",
  orders: "Pedidos",
  order_counters: "Numeração de pedidos",
  admin_users: "Usuários da equipe",
  customer_users: "Clientes",
  customer_records: "Clientes",
  tables: "Mesas",
  table_tokens: "Acesso às mesas",
  table_sessions: "Comandas",
  table_service_requests: "Solicitações de mesa",
  delivery_routes: "Rotas de entrega",
  promotion_combos: "Promoções",
  upsell_campaigns: "Campanhas",
  print_pairing_codes: "Pareamento de impressora",
  print_devices: "Dispositivos de impressão",
  print_jobs: "Trabalhos de impressão",
  print_destinations: "Destinos de impressão",
  print_printers: "Impressoras",
  whatsapp_signup_sessions: "Conexão WhatsApp",
  whatsapp_notifications: "Notificações WhatsApp",
};

const fieldNames: Record<string, string> = {
  active: "Ativo", deleted: "Excluído", name: "Nome", price: "Preço", priceCents: "Preço (centavos)",
  status: "Status", open: "Loja aberta", roles: "Permissões", email: "E-mail",
  phone: "Celular", updatedAt: "Atualizado em", createdAt: "Criado em",
  description: "Descrição", sortOrder: "Ordem", available: "Disponível",
  whatsappNotificationsEnabled: "Avisos WhatsApp ativados",
};

export function auditFieldName(path: string) {
  return path.split(".").map((field) => fieldNames[field] ?? field).join(" / ");
}

export function auditValue(value: unknown, exists: boolean) {
  if (!exists) return "Não existia";
  if (value === null) return "Sem valor";
  if (value === true) return "Sim";
  if (value === false) return "Não";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (value === "") return "Vazio";
  return String(value);
}

export function auditQuery(filters: AuditFilters, page: number) {
  const query = new URLSearchParams({ page: String(page), size: "25" });
  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;
    if (key === "from" || key === "to") {
      const localDate = new Date(`${value}T${key === "from" ? "00:00:00.000" : "23:59:59.999"}`);
      query.set(key, localDate.toISOString());
    } else {
      query.set(key, value.trim());
    }
  }
  return query.toString();
}
