# Quick Task 009: Resumo

**Status:** Done
**Date:** 2026-08-06

## Resultado

- Campo "Buscar endereço" agora recebe foco explícito ao abrir o modal.
- Foco não provoca rolagem automática e o conteúdo do modal permanece no topo.

## Verificação

- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.
- UAT com teclado virtual — pendente; navegador indisponível no ambiente automatizado.

## Commit

`fix(cart): keep address search focused`
