# Frontend Organization Specification

## Problem Statement

Delivery Web component files were grouped by feature/domain and then briefly moved into page-local `components` folders. The desired organization is the Cosmos-style layer-based structure: routes, views, reusable components, services, layouts and shared support folders separated by technical responsibility.

## Goals

- [x] Keep Next route files under `src/app`.
- [x] Move screen/container code under `src/views`.
- [x] Keep reusable UI under `src/components`.
- [x] Move admin shell under `src/layouts`.
- [x] Move API code under `src/services`.
- [x] Move shared helpers/constants under `src/utils` and `src/constants`.
- [x] Remove old `src/features`, `src/lib`, and `src/app/**/components` organization.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Convert App Router to Pages Router | Existing project uses Next 16 App Router; route migration is larger than folder organization |
| Change UI behavior | Request is structural only |
| Implement strict Atomic Design | Reference project is component-based/layer-based, not full Atomic Design |

## User Stories

### P1: Layer-Based Navigation

**User Story**: As a developer, I want files organized by technical responsibility so that I can locate routes, views, reusable components and API code quickly.

**Acceptance Criteria**:

1. WHEN opening route files THEN system SHALL keep them in `src/app`.
2. WHEN opening screen/container code THEN system SHALL keep it in `src/views`.
3. WHEN opening reusable UI THEN system SHALL keep it in `src/components`.
4. WHEN opening API integration code THEN system SHALL keep it in `src/services`.
5. WHEN opening helpers/constants THEN system SHALL keep them in `src/utils` or `src/constants`.

**Independent Test**: Inspect `src`, then run lint/build.

## Requirement Traceability

| Requirement ID | Story | Status |
| --- | --- | --- |
| ORG-01 | Layer-Based Navigation | Verified |

## Success Criteria

- [x] No imports from `@/features/*`.
- [x] No imports from `@/lib/*`.
- [x] No `src/app/**/components` folders.
- [x] Route files stay thin and import from `src/views` or `src/layouts`.
