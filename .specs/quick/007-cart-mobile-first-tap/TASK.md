# Quick Task 007: Corrigir primeiro toque no carrinho mobile

**Date:** 2026-08-06
**Status:** Done

## Description

Garantir que o botão "Continuar" avance o carrinho no primeiro toque em dispositivos mobile.

## Files Changed

- `src/components/Button/styles.ts` — limita o hover visual do botão primário a dispositivos com suporte real a hover.

## Verification

- [x] O CSS do botão primário não aplica `:hover` fora de `@media (hover: hover)`.
- [x] `npm run lint` passa.
- [x] `npm run build` passa.

## Commit

`fix(cart): handle continue on first mobile tap`

## Note

UAT em dispositivo touch não foi executado porque nenhum navegador integrado estava disponível na sessão.
