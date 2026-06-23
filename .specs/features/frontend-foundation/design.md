# Frontend Foundation Design

**Spec**: `.specs/features/frontend-foundation/spec.md`
**Status**: Draft

---

## Architecture Overview

Browser renders Next UI and calls same-origin Route Handlers. Route Handlers resolve tenant and forward requests to Spring backend with `X-Tenant-Slug`; admin token is read from HttpOnly cookie server-side.

```mermaid
graph TD
    A["Browser"] --> B["Next Page/Client Component"]
    B --> C["Next Route Handler"]
    C --> D["Tenant Resolver"]
    C --> E["HttpOnly JWT Cookie"]
    C --> F["Spring delivery-api"]
    F --> G["MongoDB"]
```

---

## Components

### Tenant Resolver

- **Purpose**: Extract tenant from host/subdomain or fallback env.
- **Location**: `src/lib/tenant.ts`
- **Interfaces**:
  - `resolveTenantFromHost(host?: string): string`
  - `resolveTenantFromHeaders(headers: Headers): string`

### Backend Proxy

- **Purpose**: Same-origin BFF for public/admin backend calls.
- **Location**: `src/app/api/backend/[...path]/route.ts`
- **Interfaces**: GET, POST, PUT, PATCH, DELETE.

### Auth Route Handlers

- **Purpose**: Login/logout/me while keeping JWT HttpOnly.
- **Location**: `src/app/api/auth/**/route.ts`

### Theme

- **Purpose**: Apply `primaryColor` and `secondaryColor`.
- **Location**: `src/components/theme/theme-provider.tsx`

### Customer App

- **Purpose**: Menu, product options, cart and checkout.
- **Location**: `src/features/customer/`

### Admin App

- **Purpose**: Login, dashboard, orders, kitchen, catalog and settings.
- **Location**: `src/features/admin/`

---

## Data Models

Types mirror backend DTOs in `src/types/api.ts`.

---

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Admin token | HttpOnly cookie | Avoid exposing JWT to browser JS |
| API access | Next Route Handlers | Avoid CORS and centralize tenant header |
| Forms | React Hook Form + Zod | Required and predictable validation |
| Theme | CSS variables | Fast runtime tenant color changes |
