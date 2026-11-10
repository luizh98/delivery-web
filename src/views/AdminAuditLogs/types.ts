export type AuditChange = {
  documentId: string;
  field: string;
  before: unknown;
  after: unknown;
  beforeExists: boolean;
  afterExists: boolean;
};

export type AuditLog = {
  id: string;
  createdAt: string;
  actor: { id: string; name: string; email: string; roles: string[] | null };
  action: "CREATE" | "UPDATE" | "DELETE";
  collection: string;
  documentIds: string[];
  method: string;
  path: string;
  source: string;
  requestId: string;
  status: "PENDING" | "APPLIED" | "NO_CHANGE" | "UNCONFIRMED";
  changes: AuditChange[];
};

export type AuditLogPage = {
  items: AuditLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AuditFilters = {
  actor: string;
  collection: string;
  documentId: string;
  action: string;
  status: string;
  from: string;
  to: string;
};
