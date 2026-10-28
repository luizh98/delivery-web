export type MessageStage = "production" | "delivery" | "completed";
export type MessageMode = "delivery" | "pickup" | "table";
export type MessageVersion = { name: string; body: string; keys: string[]; status: string };
export type MessageEditor = { draft: string; active?: MessageVersion; candidate?: MessageVersion };
export type MessageParameter = { key: string; label: string; delivery: string; pickup: string; table: string };
export type WhatsAppMessagesResponse = {
  messages: Record<MessageStage, MessageEditor>;
  defaults: Record<MessageStage, string>;
  parameters: MessageParameter[];
  revision: string;
  connected: boolean;
  activeStatuses: Partial<Record<MessageStage, string>> | null;
};

export const messageStages: { key: MessageStage; label: string; description: string }[] = [
  { key: "production", label: "Confirmado e em preparo", description: "Quando o pedido é recebido, confirmado ou entra automaticamente em preparo." },
  { key: "delivery", label: "Saiu para entrega", description: "Quando o entregador sai com um pedido de entrega." },
  { key: "completed", label: "Concluído e avaliação", description: "Ao concluir o pedido. O cliente pode responder com sua nota." },
];

export function messageValidation(body: string, parameters: MessageParameter[]) {
  const text = body.trim();
  if (!text || [...text].length > 1024) return "Escreva uma mensagem de até 1024 caracteres.";
  if (text.startsWith("{{") || text.endsWith("}}") || /\}\}\s*\{\{/.test(text)) return "Inclua texto antes e depois dos dados e separe os parâmetros com texto.";
  if (/[{}\t\r]/.test(text.replace(/\{\{([a-z_]+)\}\}/g, ""))) return "Use os dados disponíveis, sem chaves incompletas ou tabulações.";
  for (const match of text.matchAll(/\{\{([a-z_]+)\}\}/g)) {
    if (!parameters.some((parameter) => parameter.key === match[1])) return `Dado desconhecido: ${match[1]}. Insira um dos dados disponíveis.`;
  }
  if (text.includes("\n\n\n")) return "Use no máximo uma linha em branco entre os trechos.";
  return "";
}

export function previewWhatsAppMessage(body: string, parameters: MessageParameter[], mode: MessageMode) {
  return body.trim().replace(/\{\{([a-z_]+)\}\}/g, (token, key: string) => {
    const parameter = parameters.find((item) => item.key === key);
    return parameter ? parameter[mode].replace(/\s+/g, " ").trim() : token;
  });
}

export function messageReviewStatus(status?: string) {
  return ({ APPROVED: "Aprovada", PENDING: "Em análise pela Meta", SUBMITTING: "Envio em andamento", SUBMISSION_FAILED: "Falha ao enviar — tente novamente", SUBMISSION_UNCERTAIN: "Confirmação pendente — atualize o status", NOT_FOUND: "Não encontrada na Meta — envie novamente", REJECTED: "Não aprovada — ajuste o texto", PAUSED: "Pausada na Meta", DISABLED: "Desativada na Meta" } as Record<string, string>)[status ?? ""] ?? "Status pendente";
}
