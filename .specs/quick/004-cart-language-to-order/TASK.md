# Quick Task 004: Trocar linguagem de carrinho por pedido

**Date:** 2026-07-29
**Status:** Done

## Description

Trocar textos visíveis de carrinho por pedido e exibir o título "Seu pedido" uma única vez na tela de fechamento.

## Files Changed

- `src/views/Home/CustomerMenu.tsx` — atualiza textos do cardápio, botão fixo, feedback e acessibilidade.
- `src/views/Cart/index.tsx` — atualiza textos da tela e remove o título interno repetido.
- `src/views/AdminSettings/SettingsForm.tsx` — atualiza a descrição padrão configurável.

## Verification

- [x] Nenhum texto visível ou acessivel em `src` usa "carrinho".
- [x] Tela de pedido exibe "Seu pedido" uma única vez.
- [x] ESLint dos arquivos alterados passa.
- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`

## Commit

Não criado: worktree possui alterações anteriores ainda não commitadas.
