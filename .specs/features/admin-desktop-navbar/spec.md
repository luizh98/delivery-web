# Admin Desktop Navbar

**Status:** Done

## Goal

Provide a fixed desktop admin navbar that keeps app identity, workspace context, and logout available without covering page content.

## Requirements

### ADM-NAV-01: Fixed desktop header

At the desktop breakpoint, show a `4rem` fixed navbar and reserve its vertical space in the admin layout.

### ADM-NAV-02: App and sidebar control

Show bold `FlyFoods` followed by an icon control that expands or collapses the sidebar. The control must expose its accessible name and expanded state.

### ADM-NAV-03: Workspace account context

Show the configured establishment name and current user email on the right. Use `tenantSlug` only if the configured name is unavailable.

### ADM-NAV-04: Logout

Show an icon-only logout control on the right with an accessible name and a hover tooltip labelled `Sair`.

### ADM-NAV-05: Responsive preservation

Keep the existing mobile header and mobile navigation drawer behavior unchanged.

## Verification

- [x] Navbar reserves `4rem`; sidebar remains below it in expanded and collapsed states.
- [x] The configured establishment name, current email, and accessible logout control render in the desktop navbar.
- [x] Mobile header and drawer remain separate from desktop navbar behavior.
- [x] Production build passes; lint has only two pre-existing warnings in `AdminOrderSoundNotifier`.
