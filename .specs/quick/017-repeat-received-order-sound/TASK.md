# Quick Task 017: Repetir alerta para pedidos recebidos

**Date:** 2026-08-24
**Status:** Done

## Description

Reproduzir o alerta a cada 5 segundos enquanto existir ao menos um pedido com status `RECEIVED`.

## Files Changed

- `src/components/AdminOrderSoundNotifier/index.tsx` — troca alerta por novo ID por lembrete recorrente de pedidos recebidos.
- `.specs/quick/017-repeat-received-order-sound/TASK.md` — registra escopo e verificação.
- `.specs/quick/017-repeat-received-order-sound/SUMMARY.md` — registra resultado final.
- `.specs/project/STATE.md` — registra conclusão da quick task.

## Verification

- [x] Com pedido `RECEIVED`, áudio toca uma vez por ciclo de 5 segundos.
- [x] Com múltiplos pedidos `RECEIVED`, continua um toque por ciclo.
- [x] Sem pedido `RECEIVED`, alerta não toca.
- [x] Status diferente de `RECEIVED` interrompe próximos alertas.
- [x] Áudio permanece condicionado ao botão `Ativar som`.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.

## Commit

`fix(admin): repeat sound for received orders`
