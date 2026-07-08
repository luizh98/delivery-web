# Component CSS Files Tasks

**Design**: `.specs/features/component-css-files/design.md`
**Status**: Implemented - Manual Smoke Pending

---

## Execution Plan

### Phase 1: Foundation (Sequential)

```text
T1 -> T2 -> T3
```

### Phase 2: Reusable UI (Parallel OK after T3)

```text
T3 -> T4, T5, T6, T7, T8, T9, T10
```

### Phase 3: Layouts and Views (Parallel OK by folder after Phase 2)

```text
T4-T10 -> T11, T12, T13, T14, T15, T16, T17
```

### Phase 4: Verification (Sequential)

```text
T18 -> T19 -> T20
```

---

## Task Breakdown

### T1: Confirm CSS Module Authoring Path

**What**: Validate whether this repo should use native CSS Modules only or allow Tailwind `@apply` in CSS modules.
**Where**: Temporary local check only; no committed app change unless convention is documented.
**Depends on**: None
**Requirement**: CSSREF-02

**Done when**:

- [ ] Decision recorded in implementation notes.
- [ ] If `@apply` is used, `npm run build` proves it works in this repo.
- [ ] If not validated, implementation uses native CSS modules.

**Verify**:

```powershell
npm run build
```

Expected: build succeeds if `@apply` path is chosen.

---

### T2: Add Class Name Composition Helper

**What**: Add tiny `cx` helper for conditional CSS module classes and caller `className` props.
**Where**: `src/utils/classNames.ts`
**Depends on**: T1
**Requirement**: CSSREF-02

**Done when**:

- [ ] Helper accepts strings, false, null, and undefined.
- [ ] Helper returns stable space-separated class string.
- [ ] No new dependency added.

**Verify**:

```powershell
npm run lint
```

Expected: no TypeScript or lint errors.

---

### T3: Establish CSS Module Pattern in Button

**What**: Migrate `Button` to `styles.module.css` and variant class map.
**Where**: `src/components/Button/index.tsx`, `src/components/Button/styles.module.css`
**Depends on**: T2
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Button folder has `styles.module.css`.
- [ ] Base and variant styles live in CSS module.
- [ ] External `className` still works.
- [ ] All variants preserve current states.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T4: Migrate Field Controls [P]

**What**: Move `Field`, `Input`, `Textarea`, and `Select` styles to CSS module.
**Where**: `src/components/Field/index.tsx`, `src/components/Field/styles.module.css`
**Depends on**: T3
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Label, error, input, textarea, and select styles are module classes.
- [ ] Caller `className` still merges.
- [ ] Focus ring behavior is preserved.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T5: Migrate PageShell [P]

**What**: Move page shell layout styles to CSS module.
**Where**: `src/components/PageShell/index.tsx`, `src/components/PageShell/styles.module.css`
**Depends on**: T3
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Shell width, padding, and min-height styles live in CSS module.
- [ ] External `className` still merges.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T6: Migrate ThemeProvider [P]

**What**: Move static wrapper styles to CSS module while keeping runtime CSS variables inline.
**Where**: `src/components/ThemeProvider/index.tsx`, `src/components/ThemeProvider/styles.module.css`
**Depends on**: T3
**Requirement**: CSSREF-01, CSSREF-04

**Done when**:

- [ ] Static min-height/background/text styles live in CSS module.
- [ ] `style` remains only for tenant CSS variables.

**Verify**:

```powershell
rg -n "style=" src/components/ThemeProvider
```

Expected: only tenant variable assignment remains.

---

### T7: Migrate ConfirmationProvider [P]

**What**: Move modal overlay and dialog styles to CSS module.
**Where**: `src/components/ConfirmationProvider/index.tsx`, `src/components/ConfirmationProvider/styles.module.css`
**Depends on**: T3
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Overlay, dialog, header, message, and actions styles live in CSS module.
- [ ] Accessibility attributes remain unchanged.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T8: Migrate ToastProvider [P]

**What**: Move toast stack, variant, and icon styles to CSS module.
**Where**: `src/components/ToastProvider/index.tsx`, `src/components/ToastProvider/styles.module.css`
**Depends on**: T3
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Success/error variants are module classes.
- [ ] Toast positioning remains unchanged.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T9: Migrate OrdersManager [P]

**What**: Move order list, cards, actions, and print preview styles to CSS module.
**Where**: `src/components/OrdersManager/index.tsx`, `src/components/OrdersManager/styles.module.css`
**Depends on**: T3
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] All static classes in OrdersManager are module classes.
- [ ] Compact mode and status actions preserve layout.
- [ ] Print preview styling remains readable.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T10: Migrate AdminLayout [P]

**What**: Move admin shell, header, nav, and nav link styles to CSS module.
**Where**: `src/layouts/AdminLayout/index.tsx`, `src/layouts/AdminLayout/styles.module.css`
**Depends on**: T3
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Layout folder has `styles.module.css`.
- [ ] Header/nav responsiveness is preserved.
- [ ] LogoutButton behavior remains unchanged.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T11: Migrate AdminDashboard [P]

**What**: Move dashboard grid, stats, and shortcut styles to CSS module.
**Where**: `src/views/AdminDashboard/index.tsx`, `src/views/AdminDashboard/styles.module.css`
**Depends on**: Phase 2
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Dashboard view folder has `styles.module.css`.
- [ ] Cards and responsive grid preserve current layout.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T12: Migrate AdminLogin [P]

**What**: Move login page and login panel styles to CSS module.
**Where**: `src/views/AdminLogin/index.tsx`, `src/views/AdminLogin/styles.module.css`
**Depends on**: Phase 2
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Login layout and panel styles live in CSS module.
- [ ] Error display remains unchanged.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T13: Migrate AdminCategories [P]

**What**: Move category manager form, filters, list, and empty-state styles to CSS module.
**Where**: `src/views/AdminCategories/CategoryManager.tsx`, `src/views/AdminCategories/styles.module.css`
**Depends on**: Phase 2
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Styled classes in CategoryManager are module classes.
- [ ] Search icon positioning and active toggle styling are preserved.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T14: Migrate AdminProducts [P]

**What**: Move product manager, option builder, and reusable option group styles to one folder CSS module.
**Where**: `src/views/AdminProducts/*.tsx`, `src/views/AdminProducts/styles.module.css`
**Depends on**: Phase 2
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] ProductManager static classes use module classes.
- [ ] ProductOptionsBuilder static classes use module classes.
- [ ] ReusableOptionGroupsPanel static classes use module classes.
- [ ] Details open/close chevrons and responsive grids remain correct.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T15: Migrate AdminSettings [P]

**What**: Move settings form and section styles to CSS module.
**Where**: `src/views/AdminSettings/SettingsForm.tsx`, `src/views/AdminSettings/styles.module.css`
**Depends on**: Phase 2
**Requirement**: CSSREF-01, CSSREF-02

**Done when**:

- [ ] Form layout and sections use module classes.
- [ ] Textarea monospace class is preserved in CSS module.

**Verify**:

```powershell
npm run lint
```

Expected: lint succeeds.

---

### T16: Migrate Home Customer Menu [P]

**What**: Move public menu, category tabs, product list, modal, cart, and checkout styles to CSS module.
**Where**: `src/views/Home/CustomerMenu.tsx`, `src/views/Home/styles.module.css`
**Depends on**: Phase 2
**Requirement**: CSSREF-01, CSSREF-02, CSSREF-04

**Done when**:

- [ ] Static classes in CustomerMenu use module classes.
- [ ] Background image inline styles remain only for dynamic URLs.
- [ ] Active category, selected options, mobile cart, modal, and checkout states remain correct.

**Verify**:

```powershell
rg -n "style=" src/views/Home
```

Expected: only dynamic background image styles remain.

---

### T17: Review Pass-Through Views [P]

**What**: Confirm whether `AdminOrders` and `AdminKitchen` need CSS files or remain pass-through views.
**Where**: `src/views/AdminOrders/index.tsx`, `src/views/AdminKitchen/index.tsx`
**Depends on**: Phase 2
**Requirement**: CSSREF-01

**Done when**:

- [ ] No styled JSX exists in these views.
- [ ] No empty CSS module is added unless user asks for strict one-file-per-folder presence.

**Verify**:

```powershell
rg -n "className=|style=" src/views/AdminOrders src/views/AdminKitchen
```

Expected: no matches.

---

### T18: Global CSS Cleanup

**What**: Confirm `globals.css` has only global/base/theme rules after migration.
**Where**: `src/app/globals.css`
**Depends on**: T11-T17
**Requirement**: CSSREF-03

**Done when**:

- [ ] No component-specific selectors are added to `globals.css`.
- [ ] Theme variables and global element defaults remain.

**Verify**:

```powershell
Get-Content src/app/globals.css
```

Expected: only Tailwind import, variables, theme mapping, body, and element defaults.

---

### T19: Automated Verification

**What**: Run static verification after all CSS extraction.
**Where**: `delivery-web`
**Depends on**: T18
**Requirement**: CSSREF-02, CSSREF-03

**Done when**:

- [ ] Lint passes.
- [ ] Build passes.
- [ ] Inventory shows expected remaining inline styles only.

**Verify**:

```powershell
npm run lint
npm run build
rg -n "className=|style=" src
rg --files src -g "*.css"
```

Expected: lint/build succeed; remaining `className` usage is module-based or caller pass-through; remaining `style=` usage is data-driven.

---

### T20: Manual Smoke Test

**What**: Check main customer and admin routes for visual regressions.
**Where**: Browser against local Next app.
**Depends on**: T19
**Requirement**: CSSREF-02

**Done when**:

- [ ] `/` renders menu, cart, product modal, and checkout correctly.
- [ ] `/admin/login` renders form correctly.
- [ ] `/admin`, `/admin/orders`, `/admin/kitchen` render admin shell and order views correctly.
- [ ] `/admin/catalog/products`, `/admin/catalog/categories`, `/admin/settings` render forms/lists correctly.
- [ ] Desktop and mobile widths preserve layout.

**Verify**:

```powershell
npm run dev
```

Expected: app starts and manual route checks pass.

---

## Parallel Execution Map

```text
Sequential:
  T1 -> T2 -> T3

Parallel after T3:
  T4 Field
  T5 PageShell
  T6 ThemeProvider
  T7 ConfirmationProvider
  T8 ToastProvider
  T9 OrdersManager
  T10 AdminLayout

Parallel after reusable UI:
  T11 AdminDashboard
  T12 AdminLogin
  T13 AdminCategories
  T14 AdminProducts
  T15 AdminSettings
  T16 Home
  T17 Pass-through review

Final:
  T18 -> T19 -> T20
```

---

## Tools Before Execution

Default tools for implementation:

- Skill: `tlc-spec-driven`
- Skill: `caveman`
- Filesystem edits
- npm commands: `npm run lint`, `npm run build`, optionally `npm run dev`

Ask before execution if another MCP/plugin should be used.
