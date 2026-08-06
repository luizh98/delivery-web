# Quick Task 014: Resumo

**Status:** Done
**Date:** 2026-08-06

## Resultado

- Botão "Atualizar status" removido da tela pública de acompanhamento.
- Polling de 60 segundos e atualização ao retornar para aba continuam responsáveis por buscar novo status.
- Tentativa manual continua disponível somente quando pedido não pôde ser carregado inicialmente.

## Verificação

- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.

## Commit

`fix(tracking): remove manual status refresh`
