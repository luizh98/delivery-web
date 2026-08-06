# Quick Task 001: Localizar enums e imprimir pedido

**Date:** 2026-08-06
**Status:** Done

## Description

Exibir tipo de entrega e forma de pagamento em português no painel administrativo e fazer o botão de impressão abrir o diálogo nativo do navegador.

## Files Changed

- `src/components/OrdersManager/index.tsx` — traduz enums e aciona impressão com tratamento de erro.

## Verification

- [x] O painel não exibe valores crus dos enums de entrega e pagamento.
- [x] O botão abre o diálogo de impressão com o texto retornado pela API.
- [x] Falhas de API ou bloqueio de pop-up mostram mensagem ao usuário.
- [x] Lint e build passam.

## Commit

`901cebd` — `fix(admin): localize order details and print receipt`
