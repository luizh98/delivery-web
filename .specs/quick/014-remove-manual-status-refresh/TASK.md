# Quick Task 014: Remover atualização manual do status

**Date:** 2026-08-06
**Status:** Done

## Description

Remover o botão manual de atualização do status do pedido para evitar requisições repetidas, mantendo somente o polling existente.

## Files Changed

- `src/views/OrderTracking/index.tsx` — remove botão manual "Atualizar status".
- `.specs/quick/014-remove-manual-status-refresh/TASK.md` — registra escopo e verificação.
- `.specs/quick/014-remove-manual-status-refresh/SUMMARY.md` — registra resultado final.

## Verification

- [x] Botão "Atualizar status" não aparece no acompanhamento do pedido.
- [x] Polling de 60 segundos permanece ativo para pedidos não finalizados.
- [x] Atualização ao retornar para aba visível permanece ativa.
- [x] Botão "Tentar novamente" permanece disponível quando carga inicial falha.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.

## Commit

`fix(tracking): remove manual status refresh`
