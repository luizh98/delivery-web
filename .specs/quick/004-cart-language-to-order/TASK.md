# Quick Task 004: Trocar linguagem de carrinho por pedido

**Date:** 2026-07-29
**Status:** Done

## Description

Trocar textos visiveis de carrinho por pedido e exibir o titulo "Seu pedido" uma unica vez na tela de fechamento.

## Files Changed

- `src/views/Home/CustomerMenu.tsx` — atualiza textos do cardapio, botao fixo, feedback e acessibilidade.
- `src/views/Cart/index.tsx` — atualiza textos da tela e remove o titulo interno repetido.
- `src/views/AdminSettings/SettingsForm.tsx` — atualiza a descricao padrao configuravel.

## Verification

- [x] Nenhum texto visivel ou acessivel em `src` usa "carrinho".
- [x] Tela de pedido exibe "Seu pedido" uma unica vez.
- [x] ESLint dos arquivos alterados passa.
- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`

## Commit

Nao criado: worktree possui alteracoes anteriores ainda nao commitadas.
