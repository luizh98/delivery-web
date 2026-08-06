# Quick Task 011: Resumo

**Status:** Done
**Date:** 2026-08-06

## Resultado

- Modal acompanha a área realmente visível quando teclado virtual abre.
- Campo "Buscar endereço" permanece focado e é reposicionado no topo do modal.
- Outros campos não são reposicionados à força.

## Verificação

- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.
- UAT com teclado virtual — pendente; navegador indisponível no ambiente automatizado.

## Commit

`fix(cart): keep address search visible above keyboard`
