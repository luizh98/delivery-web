# Component CSS Files Design

**Spec**: `.specs/features/component-css-files/spec.md`
**Status**: Implemented

---

## Architecture Overview

Use folder-local CSS Modules for scoped styles:

- `src/components/Button/index.tsx`
- `src/components/Button/types.ts`
- `src/components/Button/styles.module.css`

Same pattern applies to styled folders under `src/components`, `src/views`, and `src/layouts`.

`src/app/globals.css` remains the single global stylesheet for:

- Tailwind import.
- Theme variables.
- Base body styles.
- Global element defaults.

## Code Reuse Analysis

### Existing Code to Preserve

| Existing Code | Location | How to Use |
| --- | --- | --- |
| Theme tokens | `src/app/globals.css` | CSS modules use existing CSS variables such as `--background`, `--surface`, `--border`, `--tenant-primary`, and Tailwind-generated color vars when available |
| Runtime tenant theme | `src/components/ThemeProvider/` | Keep CSS variable assignment in `style`; move static wrapper styles to module |
| Component props | `src/components/**/types.ts` | Preserve public APIs, especially `className` props |
| Layer structure | `src/app`, `src/views`, `src/components`, `src/layouts` | Keep current organization from frontend-organization spec |

### Target Folders

| Layer | Folders |
| --- | --- |
| Components | `Button`, `ConfirmationProvider`, `Field`, `OrdersManager`, `PageShell`, `ThemeProvider`, `ToastProvider` |
| Layouts | `AdminLayout` |
| Views | `AdminCategories`, `AdminDashboard`, `AdminLogin`, `AdminProducts`, `AdminSettings`, `Home` |
| Pass-through views | `AdminOrders`, `AdminKitchen` currently have no local classes; no empty CSS unless strict file presence is required |

---

## Components and Interfaces

### CSS Module Convention

- **Purpose**: Give each styled folder scoped style ownership.
- **Location**: `styles.module.css` beside `index.tsx`.
- **Interfaces**:
  - `import styles from "./styles.module.css"`
  - `className={styles.root}`
  - `className={cx(styles.root, condition && styles.active, className)}`
- **Dependencies**: Next.js CSS Modules support.
- **Reuses**: Next local docs confirm `.module.css` works natively.

### Class Name Composition Helper

- **Purpose**: Avoid fragile template literals while preserving optional `className` props and conditional classes.
- **Location**: `src/utils/classNames.ts`
- **Interface**:
  - `cx(...values: Array<string | false | null | undefined>): string`
- **Dependencies**: None.
- **Reuses**: Existing `src/utils` layer.

### Style Authoring Approach

- **Default**: Native CSS Modules with CSS variables and media queries.
- **Optional after validation**: Tailwind `@apply` inside CSS Modules only if a small build spike proves it works cleanly with Tailwind v4/PostCSS in this repo.
- **Reason**: Native CSS avoids relying on undocumented local `@apply` behavior in CSS modules. If `@apply` is validated, it can reduce translation risk and diff size.

---

## Data Models

No data model changes.

---

## Dynamic Style Strategy

| Scenario | Strategy |
| --- | --- |
| Product/banner background image URLs | Keep inline `style={{ backgroundImage }}` because value is API data |
| Tenant theme colors | Keep `ThemeProvider` CSS variable assignment in inline `style` |
| Button variants | Map variants to `styles.primary`, `styles.secondary`, etc. |
| Active filters/options | Map boolean state to CSS module modifier classes |
| Details open chevrons | Use CSS module class plus existing group/open behavior translated to selectors where practical |

---

## Error Handling Strategy

| Risk | Handling | User Impact |
| --- | --- | --- |
| Visual regression | Migrate in small folders, run build/lint, smoke-test routes | Prevents broken UI after refactor |
| Missed responsive class | Inventory className usage before/after and test desktop/mobile widths | Preserves mobile-first layout |
| Dynamic class accidentally dropped | Use `cx` helper and explicit variant maps | Keeps states working |
| CSS module import in server component | Keep imports in components that render markup; Next supports CSS Modules | Avoids build failures |

---

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| CSS file name | `styles.module.css` | Consistent per folder and scoped by default |
| CSS scope | CSS Modules | Prevents class collisions |
| Global CSS | Keep only global/base/theme | Matches Next docs recommendation and request |
| Dependencies | No `clsx` dependency | Small helper is enough |
| Empty CSS files | Do not create by default | Avoids useless files for pass-through views |

---

## Verification Plan

- Inventory before migration: `rg -n "className=|style=" src`.
- Inventory CSS files: `rg --files src -g "*.css"`.
- Lint: `npm run lint`.
- Build: `npm run build`.
- Manual smoke routes:
  - `/`
  - `/admin/login`
  - `/admin`
  - `/admin/orders`
  - `/admin/kitchen`
  - `/admin/catalog/products`
  - `/admin/catalog/categories`
  - `/admin/settings`

## Implementation Notes

- CSS Modules use `styles.module.css` colocated with each styled folder.
- Tailwind utilities are applied inside CSS Modules with `@reference` to `globals.css`.
- `style=` remains only for tenant CSS variables in `ThemeProvider` and dynamic background images in `Home`.
- Automated verification passed: `npm run lint`, direct PostCSS/Tailwind CSS module processing, and `npm run build`.
