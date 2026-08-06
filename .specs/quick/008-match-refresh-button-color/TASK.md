# Quick Task 008: Igualar cor do botão de atualização

**Date:** 2026-08-06
**Status:** Done

## Description

Aplicar ao botão "Atualizar status" as mesmas cores temáticas usadas pelo botão "Meus pedidos".

## Files Changed

- `src/views/OrderTracking/index.tsx` — alinha fundo, borda e texto do botão de atualização ao atalho de pedidos.
- `.specs/quick/008-match-refresh-button-color/TASK.md` — registra escopo e verificação.
- `.specs/quick/008-match-refresh-button-color/SUMMARY.md` — registra resultado final.

## Verification

- [x] Botão "Atualizar status" usa fundo `--color-surface`.
- [x] Botão "Atualizar status" usa borda e texto `--color-primary`.
- [x] Lint e build do frontend passam.
- [x] `git diff --check` passa.

## Commit

`fix(tracking): match refresh button color`
