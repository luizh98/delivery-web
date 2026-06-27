# Frontend Organization Tasks

**Design**: `.specs/features/frontend-organization/design.md`
**Status**: Done

---

## Task Breakdown

### T1: Move Views And Layouts

**Done when**:

- [x] Public and admin screen code lives under `src/views`.
- [x] Protected admin shell lives under `src/layouts/AdminLayout`.
- [x] `src/app` route files are thin wrappers.

### T2: Move Services And Support

**Done when**:

- [x] API client/server code lives under `src/services/api`.
- [x] Tenant and format helpers live under `src/utils`.
- [x] API constants live under `src/constants`.

### T3: Keep Reusable Components Shared

**Done when**:

- [x] Reusable UI lives under `src/components`.
- [x] No `src/app/**/components` folders remain.

### T4: Update Imports

**Done when**:

- [x] No imports reference `@/features/*`.
- [x] No imports reference `@/lib/*`.
- [x] No imports reference `@/components/ui/*`.
- [x] No imports reference `@/components/theme/*`.

### T5: Verify

**Done when**:

- [x] `npm run lint` passes.
- [x] `npm run build` passes.
