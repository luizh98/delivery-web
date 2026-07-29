# Quick Task 002: Required option validation

**Date:** 2026-07-28
**Status:** Done

## Description

Impedir que produtos sejam adicionados ao carrinho sem preencher os grupos obrigatórios e destacar o texto "Obrigatório" em negrito.

## Files Changed

- `src/views/ProductDetails/index.tsx` — valida grupos obrigatórios e exibe o estado de erro.
- `src/views/ProductDetails/styles.ts` — estiliza a mensagem de validação.

## Verification

- [x] Produto não entra no carrinho quando grupo obrigatório está incompleto.
- [x] Grupo obrigatório respeita `minSelections`, com mínimo efetivo de 1.
- [x] Erro desaparece quando o grupo atinge o mínimo.
- [x] Texto "Obrigatório" usa negrito sem mudar o tamanho.
- [x] `npm run lint`
- [x] `npm run build`

## Commit

Não criado: worktree possui alterações anteriores ainda não commitadas.
