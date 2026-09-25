# Quick Task 021: Resumo

**Status:** Done
**Date:** 2026-09-25

## Resultado

- Pedidos tocam `new-order.mp3` ao entrar em `RECEIVED` e recebem lembrete a cada 15 segundos enquanto algum pedido permanecer nesse status.
- Um único toque é enfileirado por ciclo, mesmo com vários pedidos recebidos.
- Ao sair o último pedido de `RECEIVED`, o intervalo é cancelado.
- `CONFIRMED` mantém o alerta de primeira detecção e o áudio permanece condicionado à ativação explícita no admin.

## Verificação

- `npx eslint src/components/AdminOrderSoundNotifier/index.tsx` — passou.
- `npm run lint` — falhou por três erros preexistentes: dois em `AdminDashboard/LazyAdminDashboard.tsx` e um em `AdminPrinter/index.tsx`, todos `react-hooks/set-state-in-effect`.
- `npm run build` — passou.
- `git diff --check` — passou.

## Commit

`fix(admin): repeat received order sound every 15 seconds`
