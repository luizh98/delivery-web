export type Page<T> = { items: T[]; page: number; size: number; totalElements: number; totalPages: number };
export type Attempt = { at: string; attempt: number; status: string; errorCode: string; messageId: string };
export type Receipt = { at: string; receivedAt?: string; errorCodes: number[] | null };
export type Notification = {
  id: string; stage: string; status: string; attempts: number; createdAt: string; updatedAt?: string;
  nextAttemptAt?: string; errorCode: string; messageId: string; deliveryMessageId: string;
  history: Attempt[] | null; delivery: Record<string, Receipt> | null;
};
export type LogOrder = { id: string; orderNumber: string; status: string; createdAt: string; notifications: Notification[] };
export type WebhookEvent = {
  id: string; orderId: string; stage: string; messageId: string; status: string; at: string;
  receivedAt: string; errorCodes: number[] | null; result: string;
};
export type OrderLogs = { order: LogOrder; webhooks: Page<WebhookEvent> };
export type Filters = { startDate: string; endDate: string; search: string; status: string };
