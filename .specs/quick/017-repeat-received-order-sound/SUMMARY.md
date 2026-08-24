# Quick Task 017: Resumo

**Status:** Done
**Date:** 2026-08-24

## Resultado

- Alerta toca uma vez por polling enquanto existir pedido `RECEIVED`.
- Quantidade de pedidos recebidos não multiplica toques no mesmo ciclo.
- Ao sair de `RECEIVED`, próximos ciclos ficam silenciosos.
- Ativação explícita do áudio continua obrigatória.

## Verificação

- Browser: teste de ativação em `1225 ms`.
- Browser: alertas recorrentes em `6259 ms` e `11271 ms`, intervalos de aproximadamente 5 segundos.
- Browser: múltiplos pedidos `RECEIVED` produziram um toque por ciclo.
- Browser: após mudança para `CONFIRMED`, zero novas reproduções em 6 segundos.
- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.

## Commit

`fix(admin): repeat sound for received orders`
