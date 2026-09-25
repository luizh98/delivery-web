# Quick Task 021: Repetir alerta para pedidos recebidos a cada 15 segundos

**Date:** 2026-09-25
**Status:** Done

## Description

Reproduzir `new-order.mp3` ao entrar em `RECEIVED` e repetir a cada 15 segundos enquanto existir pedido nesse status; manter o alerta de primeira detecção para `CONFIRMED`.

## Files Changed

- `src/components/AdminOrderSoundNotifier/index.tsx` — acompanha pedidos recebidos e agenda lembretes recorrentes a cada 15 segundos.
- `.specs/quick/021-repeat-received-order-sound-15-seconds/TASK.md` — registra escopo e critérios.
- `.specs/quick/021-repeat-received-order-sound-15-seconds/SUMMARY.md` — registra implementação e verificação.
- `.specs/project/STATE.md` — registra conclusão da quick task.

## Verification

- [x] Entrada em `RECEIVED` toca imediatamente e mantém um toque por ciclo de 15 segundos enquanto houver pedidos recebidos.
- [x] Saída do último pedido de `RECEIVED` interrompe os próximos alertas.
- [x] `CONFIRMED` continua tocando uma vez ao detectar pedido novo.
- [x] Ambos usam `new-order.mp3` e respeitam a ativação do som no admin.
- [x] Lint do notifier (`npx eslint src/components/AdminOrderSoundNotifier/index.tsx`).
- [ ] `npm run lint` — falhou por erros preexistentes em `AdminDashboard/LazyAdminDashboard.tsx` e `AdminPrinter/index.tsx`.
- [x] `npm run build`.
- [x] `git diff --check`.

## Commit

`fix(admin): repeat received order sound every 15 seconds`
