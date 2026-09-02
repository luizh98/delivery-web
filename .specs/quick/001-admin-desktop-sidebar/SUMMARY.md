# Quick Task 001: Desktop admin sidebar

**Status:** Done

Desktop navigation is now a persistent sidebar. Its grid column expands from `5rem` to `17rem`, so page content resizes instead of being covered. Expanded items show icon plus label; collapsed items keep the icon and expose the label on hover and keyboard focus. The mobile drawer remains unchanged.

## Verification

- `npm run build` — passed.
- `npm run lint` — passed with two pre-existing warnings in `AdminOrderSoundNotifier`.

## Commit

`fix(admin): resize collapsible sidebar`
