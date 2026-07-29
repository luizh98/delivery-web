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

## Blockers

- Backend must be running locally for runtime integration.
- Backend CORS is avoided by using Next Route Handlers as BFF.

## Preferences

- Keep communication terse using Caveman style.

## Quick Tasks

- 2026-07-28 — Product option controls: radio para selecao unica e checkbox para selecao multipla. Lint e build passaram. Commit nao criado devido a alteracoes anteriores no worktree.
- 2026-07-28 — Required option validation: bloqueio do carrinho por grupo obrigatorio incompleto e destaque em negrito. Lint e build passaram. Commit nao criado devido a alteracoes anteriores no worktree.
- 2026-07-28 — Restore product focus: retorno ao cardapio por adicao ou botao "Voltar" foca e posiciona o card do produto. Lint e build passaram. Commit nao criado devido a alteracoes anteriores no worktree.
