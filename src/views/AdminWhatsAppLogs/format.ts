import type { Filters, Notification } from "./types";

export const orderStatuses: Record<string, string> = {
  RECEIVED: "Recebido", CONFIRMED: "Confirmado", PREPARING: "Em preparo", READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para entrega", COMPLETED: "Concluído", CANCELED: "Cancelado",
};
export const stages: Record<string, string> = { production: "Confirmado e em preparo", delivery: "Saiu para entrega", pickup: "Pronto para retirada", completed: "Concluído e avaliação" };
export const sendStatuses: Record<string, string> = {
  pending: "Aguardando tentativa", sending: "Envio em andamento", accepted: "Aceito pela Meta",
  failed: "Falha no envio", uncertain: "Resultado do envio inconclusivo", skipped: "Envio não realizado",
};
export const deliveryStatuses: Record<string, string> = { sent: "Enviado pela Meta", delivered: "Entregue", read: "Lido", failed: "Falha na entrega" };
export const webhookResults: Record<string, string> = { recorded: "Associado ao pedido", duplicate: "Repetido — status já registrado", unmatched: "Sem pedido associado", pending: "Processamento não confirmado", processing_error: "Erro ao processar" };
const errors: Record<string, string> = {
  template_not_approved: "Modelo de mensagem não aprovado", invalid_phone: "Número inválido", disabled: "Avisos desativados",
  superseded: "Etapa do pedido já passou", order_missing: "Pedido não encontrado", config_missing: "Configuração não encontrada",
  abandoned_send: "Envio interrompido; resultado inconclusivo", timeout: "Tempo de resposta esgotado",
};
export function errorLabel(code: string) { return errors[code] ?? code; }
export function notificationStatus(notification: Notification) {
  for (const key of ["read", "delivered", "failed", "sent"]) {
    if (notification.delivery?.[key]) return deliveryStatuses[key];
  }
  return notification.status === "accepted" ? "Aceito pela Meta — sem confirmação de entrega" : sendStatuses[notification.status] ?? notification.status;
}
export function logQuery(filters: Filters, page: number) {
  return new URLSearchParams({ ...filters, search: filters.search.trim(), page: String(page), size: "25", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }).toString();
}
export function logTime(value?: string) { return value ? new Date(value).toLocaleString("pt-BR") : "Não registrado"; }
export function orderNumber(order: { orderNumber: string; id: string }) { return order.orderNumber || order.id.slice(-6).toUpperCase(); }
