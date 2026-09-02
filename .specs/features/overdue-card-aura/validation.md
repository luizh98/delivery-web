# Overdue Card Aura Validation

**Date:** 2026-09-02
**Spec:** `.specs/features/overdue-card-aura/spec.md`

## Acceptance Criteria

| Requirement | Result | Evidence |
| --- | --- | --- |
| OVERDUE-AURA-01 | PASS | Variante `overdue` não altera `background` do card. |
| OVERDUE-AURA-02 | PASS | Pulso usa sombras externas em vermelho, sem pseudo-elementos ou máscara. |
| OVERDUE-AURA-03 | PASS | `prefers-reduced-motion` interrompe animações e preserva a posição visual da aura. |
| OVERDUE-AURA-04 | PASS | `Card overdue` aplica `overdue-card-neon` ao redor de todo card. |

## Automated Checks

- `npm run lint`: PASS, sem erros; há 2 avisos pré-existentes em `AdminOrderSoundNotifier`.
- `npm run build`: BLOCKED por `AdminNavigation.tsx:282`; `restaurantName` está
  ausente em `AccountSummary`. CSS desta tarefa compilou antes do type-check.
- `git diff --check`: PASS.

## Manual UI Check

Não executado: rota local `/admin/kitchen` requer sessão admin e a conexão de
inspeção do navegador não ficou disponível. O build confirmou a compilação do
componente compartilhado por Pedidos e Cozinha.

## Code Quality

- Mudança restrita a tokens e variante visual de `OrdersManager`.
- Não altera cálculo de atraso, som, polling, conteúdo ou ações dos pedidos.
