# Quick Task 022: Resumo

**Status:** Done
**Date:** 2026-09-25

## Resultado

- `new-order.mp3` continua tocando imediatamente ao entrar em `RECEIVED` e repete a cada 3 segundos enquanto houver pedido nesse status.
- `CONFIRMED` mantém o alerta de primeira detecção.

## Verificação

- `npx eslint src/components/AdminOrderSoundNotifier/index.tsx` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.

## Commit

`fix(admin): repeat received order sound every 3 seconds`
