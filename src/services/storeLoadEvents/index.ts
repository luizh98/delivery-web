export const STORE_LOAD_EVENTS_KEY = "flyfoods:store-load-events:";
const SESSION_KEY = "flyfoods:store-load-session";
const MAX_EVENTS = 100;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type StoreLoadEvent = {
  id: string;
  sessionId: string;
  type: "store_load_failed";
  occurredAt: string;
  reason: "config_unavailable";
};

export class StoreLoadEvents {
  private memory: StoreLoadEvent[] = [];
  private sessionId: string | undefined;
  private sending = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private controller: AbortController | undefined;
  private running = false;
  private retryDelay = 5000;
  private memoryOnly = false;
  private tenantSlug: string;

  constructor(tenantSlug: string) {
    this.tenantSlug = tenantSlug;
  }

  private read() {
    let events: unknown = this.memory;
    try {
      const raw = this.memoryOnly ? null : window.localStorage.getItem(STORE_LOAD_EVENTS_KEY + this.tenantSlug);
      events = raw ? JSON.parse(raw) : this.memory;
    } catch { /* Storage may be disabled; keep this page's in-memory queue. */ }
    const now = Date.now();
    return (Array.isArray(events) ? events : []).filter((event): event is StoreLoadEvent =>
      event !== null && typeof event === "object" &&
      typeof event.id === "string" && UUID.test(event.id) &&
      typeof event.sessionId === "string" && UUID.test(event.sessionId) &&
      event.type === "store_load_failed" && event.reason === "config_unavailable" &&
      typeof event.occurredAt === "string" &&
      Date.parse(event.occurredAt) > now - MAX_AGE && Date.parse(event.occurredAt) <= now + 86400000,
    ).slice(-MAX_EVENTS);
  }

  private write(events: StoreLoadEvent[]) {
    this.memory = events;
    try {
      window.localStorage.setItem(STORE_LOAD_EVENTS_KEY + this.tenantSlug, JSON.stringify(events));
    } catch { this.memoryOnly = true; }
  }

  recordFailure() {
    if (!this.sessionId) {
      try {
        this.sessionId = window.sessionStorage.getItem(SESSION_KEY) ?? undefined;
      } catch { /* Use a page-scoped session if storage is unavailable. */ }
      if (!this.sessionId || !UUID.test(this.sessionId)) this.sessionId = crypto.randomUUID();
      try {
        window.sessionStorage.setItem(SESSION_KEY, this.sessionId);
      } catch { /* The generated session still works for this page. */ }
    }
    const events = this.read();
    const id = crypto.randomUUID();
    events.push({ id, sessionId: this.sessionId, type: "store_load_failed", occurredAt: new Date().toISOString(), reason: "config_unavailable" });
    this.write(events.slice(-MAX_EVENTS));
    return id;
  }

  async flush() {
    if (this.sending) return;
    this.sending = true;
    let failed = false;
    try {
      const events = this.read();
      this.write(events);
      // One event per request stays below the shared API rate limit, even after an outage.
      const event = events[0];
      if (!event) return;
      this.controller = new AbortController();
      const timeout = setTimeout(() => this.controller?.abort(), 5000);
      try {
        const response = await fetch("/api/backend/public/store-load-events", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Tenant-Slug": this.tenantSlug },
          body: JSON.stringify(event),
          signal: this.controller.signal,
        });
        if (response.status !== 204) throw new Error("Event not acknowledged");
        this.write(this.read().filter((pending) => pending.id !== event.id));
        this.retryDelay = 5000;
      } finally {
        clearTimeout(timeout);
        this.controller = undefined;
      }
    } catch {
      failed = true;
    } finally {
      this.sending = false;
      if (this.running && this.read().length > 0) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.timer = undefined;
          void this.flush();
        }, this.retryDelay);
      }
      if (failed) this.retryDelay = Math.min(this.retryDelay * 2, 300000);
    }
  }

  start() {
    this.running = true;
    window.addEventListener("online", this.onOnline);
    void this.flush();
    return () => {
      this.running = false;
      clearTimeout(this.timer);
      this.timer = undefined;
      this.controller?.abort();
      window.removeEventListener("online", this.onOnline);
    };
  }

  private onOnline = () => {
    if (this.sending || (this.timer && this.retryDelay === 5000)) return;
    clearTimeout(this.timer);
    this.retryDelay = 5000;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.flush();
    }, 5000);
  };
}
