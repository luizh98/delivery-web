# Frontend Foundation Specification

## Problem Statement

Delivery Web needs a mobile-first frontend foundation that can serve public ordering and admin operation from the same Next.js app. It must resolve tenant by subdomain, apply tenant theme from backend, and keep admin JWT out of browser JavaScript.

## Goals

- [ ] Run Next.js app with lint and production build passing.
- [ ] Resolve tenant slug and send `X-Tenant-Slug` to backend.
- [ ] Apply backend colors to CSS variables.
- [ ] Protect admin token with HttpOnly cookie.

## User Stories

### P1: Public Menu

**User Story**: As a customer, I want to see the restaurant menu on mobile so that I can start an order quickly.

**Acceptance Criteria**:

1. WHEN home page loads THEN system SHALL fetch public restaurant config and menu for current tenant.
2. WHEN backend returns theme colors THEN system SHALL apply primary and secondary colors.
3. WHEN products have options THEN system SHALL allow selecting option items.

**Independent Test**: Open `/` and see menu UI with cart controls.

---

### P1: Tenant API Calls

**User Story**: As SaaS operator, I want every backend call scoped by tenant so data stays isolated.

**Acceptance Criteria**:

1. WHEN request is made from subdomain THEN system SHALL resolve tenant slug.
2. WHEN request is local THEN system SHALL use default tenant slug.
3. WHEN Next calls backend THEN system SHALL include `X-Tenant-Slug`.

**Independent Test**: Inspect Route Handler code and call `/api/backend/public/menu`.

---

### P1: Admin Auth

**User Story**: As admin, I want login so that I can access protected admin pages.

**Acceptance Criteria**:

1. WHEN admin logs in THEN system SHALL call backend auth endpoint.
2. WHEN backend returns token THEN system SHALL store token in HttpOnly cookie.
3. WHEN admin calls protected API THEN system SHALL forward bearer token server-side.

**Independent Test**: Login page sends credentials to `/api/auth/login`.

---

### P1: Admin Operation Skeleton

**User Story**: As admin, I want basic screens for orders, kitchen, catalog and settings so that backend capabilities are usable.

**Acceptance Criteria**:

1. WHEN admin opens dashboard THEN system SHALL show links to core admin areas.
2. WHEN admin opens orders THEN system SHALL list orders from backend.
3. WHEN admin opens settings/catalog THEN forms SHALL use React Hook Form.

**Independent Test**: Build succeeds with all admin routes.

## Requirement Traceability

| Requirement ID | Story | Status |
| --- | --- | --- |
| WEB-01 | Public Menu | Done |
| TENANT-01 | Tenant API Calls | Done |
| AUTH-01 | Admin Auth | Done |
| ADMIN-01 | Admin Operation Skeleton | Done |
| DOC-01 | Project Instructions | Done |

## Success Criteria

- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] Dev server renders `/` and `/admin/login`.
