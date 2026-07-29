# Quick Task 002: Required option validation

**Date:** 2026-07-28
**Status:** Done

## Description

Impedir que produtos sejam adicionados ao carrinho sem preencher os grupos obrigatorios e destacar o texto "Obrigatorio" em negrito.

## Files Changed

- `src/views/ProductDetails/index.tsx` — valida grupos obrigatorios e exibe o estado de erro.
- `src/views/ProductDetails/styles.ts` — estiliza a mensagem de validacao.

## Verification

- [x] Produto nao entra no carrinho quando grupo obrigatorio esta incompleto.
- [x] Grupo obrigatorio respeita `minSelections`, com minimo efetivo de 1.
- [x] Erro desaparece quando o grupo atinge o minimo.
- [x] Texto "Obrigatorio" usa negrito sem mudar o tamanho.
- [x] `npm run lint`
- [x] `npm run build`

## Commit

Nao criado: worktree possui alteracoes anteriores ainda nao commitadas.
