# Component CSS Files Specification

## Problem Statement

The frontend currently keeps most visual styling as Tailwind utility strings inside TSX files. The requested refactor is structural: each styled component/view/layout folder should own its CSS file next to `index.tsx` and `types.ts`, making style ownership explicit without changing runtime behavior.

Current inventory:

- `src/app/globals.css` is the only CSS file.
- 17 TSX files contain `className=`.
- 3 TSX files contain runtime `style=` values.
- No folder under `src/components`, `src/views`, or `src/layouts` has a CSS module today.

## Goals

- [x] Add colocated CSS files to every UI folder that renders styled JSX.
- [x] Move static visual classes out of TSX and into folder-local CSS modules.
- [x] Keep component props, routes, API calls, data flow, and behavior unchanged.
- [x] Preserve tenant theme variables from `globals.css` and `ThemeProvider`.
- [x] Keep `globals.css` limited to Tailwind import, theme tokens, and real global element rules.
- [x] Leave dynamic runtime styles only where data requires inline values.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Redesign UI | Request is CSS organization only |
| Add Sass or CSS-in-JS | Existing stack is Next.js, Tailwind, plain CSS |
| Replace Tailwind globally | Tailwind still provides base/theme pipeline |
| Change backend/API behavior | Not related to CSS ownership |
| Split large views into new components | Can be a later cleanup, not required for CSS extraction |

---

## User Stories

### P1: Colocated CSS Ownership - MVP

**User Story**: As a developer, I want each styled UI folder to have its own CSS file so that styles are found beside the component/view/layout that owns them.

**Why P1**: This is the core request.

**Acceptance Criteria**:

1. WHEN opening any styled folder under `src/components`, `src/views`, or `src/layouts` THEN system SHALL include a `styles.module.css` file in that folder.
2. WHEN opening a TSX file that renders styled JSX THEN system SHALL import its folder-local `styles.module.css`.
3. WHEN a folder has only pass-through server code and no local styling THEN system SHALL not require an empty CSS file unless explicitly requested.

**Independent Test**: Run file inventory and verify no styled TSX folder lacks `styles.module.css`.

---

### P1: Behavior-Preserving Style Extraction

**User Story**: As a user, I want the UI to look and behave the same after the CSS refactor so that the structural change does not regress the app.

**Why P1**: CSS refactors have high visual regression risk.

**Acceptance Criteria**:

1. WHEN rendering public menu, cart, checkout, admin login, dashboard, orders, kitchen, products, categories, and settings THEN system SHALL preserve layout, spacing, colors, responsive behavior, and states.
2. WHEN components receive `className` props THEN system SHALL merge caller classes with module classes.
3. WHEN Button variants render THEN system SHALL preserve `primary`, `secondary`, `outline`, `ghost`, and `danger` visuals.
4. WHEN disabled, hover, focus, active, open details, modal, toast, and validation states occur THEN system SHALL preserve current styling behavior.

**Independent Test**: Run `npm run lint`, `npm run build`, and smoke-test core routes visually.

---

### P2: Global CSS Cleanup

**User Story**: As a developer, I want global CSS to contain only true global rules so that component styling does not leak across the app.

**Why P2**: Prevents accidental global coupling.

**Acceptance Criteria**:

1. WHEN opening `src/app/globals.css` THEN system SHALL only contain Tailwind import, theme variables, base body styles, and global element defaults.
2. WHEN component-specific selectors are needed THEN system SHALL define them in the owner folder CSS module.
3. WHEN tenant colors are needed THEN system SHALL use existing CSS variables rather than hardcoded brand colors.

**Independent Test**: Inspect `globals.css` and component CSS modules.

---

### P2: Dynamic Style Exceptions

**User Story**: As a developer, I want dynamic styles to remain explicit so that CSS extraction does not force impossible runtime values into static CSS.

**Why P2**: Image URLs and tenant colors are data-driven.

**Acceptance Criteria**:

1. WHEN background images use API-provided URLs THEN system SHALL keep `style={{ backgroundImage: ... }}` and move static image-box classes to CSS modules.
2. WHEN tenant theme colors are applied THEN system SHALL keep CSS variable assignment in `ThemeProvider`.
3. WHEN dynamic state chooses a visual variant THEN system SHALL map state to CSS module classes rather than inline utility strings.

**Independent Test**: Search `style=` after migration and confirm each remaining use is data-driven.

---

## Edge Cases

- WHEN a component accepts external `className` THEN system SHALL append it without dropping default module classes.
- WHEN CSS module class names need conditional composition THEN system SHALL use a small class-name helper or local array join, not a new dependency.
- WHEN responsive Tailwind utilities are moved THEN system SHALL translate them to equivalent media queries or validated `@apply` rules.
- WHEN Tailwind arbitrary values exist, such as `color-mix`, THEN system SHALL preserve equivalent CSS declarations.
- WHEN a route server component imports a client component THEN CSS import shall remain inside the rendering component, not route wrapper.

---

## Requirement Traceability

| Requirement ID | Story | Status |
| --- | --- | --- |
| CSSREF-01 | Colocated CSS Ownership | Verified |
| CSSREF-02 | Behavior-Preserving Style Extraction | Verified by lint/build |
| CSSREF-03 | Global CSS Cleanup | Verified |
| CSSREF-04 | Dynamic Style Exceptions | Verified |

**Coverage:** 4 total, 4 mapped to tasks, 0 unmapped.

---

## Success Criteria

- [x] Every styled UI folder has `styles.module.css`.
- [x] TSX style strings are replaced by CSS module references.
- [x] Remaining `style=` usages are documented runtime-data exceptions.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [ ] Manual smoke test shows no visible regression on customer and admin flows.
