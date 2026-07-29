# State

## Decisions

- Use npm.
- Use Tailwind CSS.
- Use React Hook Form for forms.
- Store admin JWT in HttpOnly cookie.
- Resolve tenant by subdomain; fallback local is `demo`.
- Theme colors come from backend `RestaurantConfig.theme`.
- Client browser calls Next Route Handlers, not backend directly.
- Frontend organization follows the Cosmos layer-based convention: routes in `src/app`, screens in `src/views`, reusable UI in `src/components`, API code in `src/services`, layouts in `src/layouts`, and support code in `src/utils`, `src/constants`, and `src/types`.
- Backend is source of truth for restaurant availability; storefront consumes `open` and `nextOpeningAt`.
- Operational timezone defaults to `America/Sao_Paulo`; missing weekly schedule remains open for backward compatibility.
- Checkout uses two steps: product review, then fulfillment/payment/confirmation.
- Google Places API (New) is proxied by Next Route Handlers; `GOOGLE_PLACES_API_KEY` remains server-side.
- Address fields remain manually editable when Google is unavailable.

## Blockers

- Backend must be running locally for runtime integration.
- Backend CORS is avoided by using Next Route Handlers as BFF.
- Real Google address UAT requires a configured Places API (New) key.

## Preferences

- Keep communication terse using Caveman style.

## Quick Tasks

- 2026-07-29 — Cart language to order: textos visíveis usam "pedido" e título duplicado foi removido. Lint, build e diff check passaram. Commit não criado devido a alterações anteriores no worktree.

- 2026-07-28 — Product option controls: radio para seleção única e checkbox para seleção múltipla. Lint e build passaram. Commit não criado devido a alterações anteriores no worktree.
- 2026-07-28 — Required option validation: bloqueio do carrinho por grupo obrigatório incompleto e destaque em negrito. Lint e build passaram. Commit não criado devido a alterações anteriores no worktree.
- 2026-07-28 — Restore product focus: retorno ao cardápio por adição ou botão "Voltar" foca e posiciona o card do produto. Lint e build passaram. Commit não criado devido a alterações anteriores no worktree.
