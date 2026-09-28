# Quick Task 023: Desmarcar adicional de escolha única

**Date:** 2026-09-28
**Status:** Done

## Description

Permitir que o cliente retire um adicional já selecionado em grupo de escolha única ao tocar nele novamente.

## Files Changed

- `src/views/ProductDetails/index.tsx` — trata novo clique no rádio selecionado.

## Verification

- [x] Clique no rádio já selecionado remove a opção do estado.
- [x] Seleção inicial e troca por outra opção continuam usando `onChange`.
- [x] Grupo obrigatório vazio continua bloqueado pela validação ao adicionar produto.
- [x] `npx eslint src/views/ProductDetails/index.tsx` passou.
- [x] `npm run build` passou.
- [ ] `npm run lint` geral: erros preexistentes em `AdminDashboard/LazyAdminDashboard.tsx`.

## Commit

`fix(product): allow deselecting single-choice option`
