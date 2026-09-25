# Quick Task 022: Repetir alerta para pedidos recebidos a cada 3 segundos

**Date:** 2026-09-25
**Status:** Done

## Description

Reduzir para 3 segundos o intervalo de repetição de `new-order.mp3` enquanto existir pedido em `RECEIVED`.

## Files Changed

- `src/components/AdminOrderSoundNotifier/index.tsx` — define o lembrete recorrente de `RECEIVED` a cada 3 segundos.
- `.specs/quick/022-repeat-received-order-sound-3-seconds/TASK.md` — registra escopo e critérios.
- `.specs/quick/022-repeat-received-order-sound-3-seconds/SUMMARY.md` — registra implementação e verificação.
- `.specs/project/STATE.md` — atualiza comportamento e registra conclusão.

## Verification

- [x] O lembrete de `RECEIVED` repete a cada 3 segundos enquanto houver pedido nesse status.
- [x] “Confirmado” mantém o comportamento atual.
- [x] Lint do notifier.
- [x] `npm run build`.
- [x] `git diff --check`.

## Commit

`fix(admin): repeat received order sound every 3 seconds`
