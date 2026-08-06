# Quick Task 010: Adicionar título ao status do pedido

**Date:** 2026-08-06
**Status:** Done

## Description

Exibir o título "Status do pedido" ao lado do botão de voltar e fazer esse botão abrir "Meus pedidos", padronizando o cabeçalho da tela de acompanhamento.

## Files Changed

- `src/views/OrderTracking/index.tsx` — exibe o cabeçalho em todos os estados e direciona o botão de voltar para "Meus pedidos".
- `src/views/OrderTracking/styles.ts` — define layout e tipografia do cabeçalho.
- `.specs/quick/010-order-status-title/TASK.md` — registra escopo e verificação.
- `.specs/quick/010-order-status-title/SUMMARY.md` — registra resultado final.

## Verification

- [x] Título "Status do pedido" aparece ao lado do botão de voltar.
- [x] Cabeçalho aparece nos estados de carregamento, sucesso e erro.
- [x] Botão de voltar abre `/orders` e possui rótulo acessível correspondente.
- [x] Tela mantém somente um título principal `h1`.
- [x] Lint e build do frontend passam.
- [x] `git diff --check` passa.

## Commit

`feat(tracking): standardize order status header`
