# Quick Task 009: Foco na busca de endereço

**Date:** 2026-08-06
**Status:** Done

## Description

Manter o campo "Buscar endereço" focado e visível ao abrir o modal, sem rolar automaticamente para o final do formulário.

## Files Changed

- `src/views/Cart/DeliveryAddressModal.tsx` — foco explícito no combobox sem rolagem automática e reposicionamento do modal no topo.
- `.specs/quick/009-focus-address-search/TASK.md` — registra escopo e verificação.
- `.specs/quick/009-focus-address-search/SUMMARY.md` — registra resultado final.

## Verification

- [x] O combobox de busca é o alvo explícito do foco ao abrir o modal.
- [x] O foco usa `preventScroll` e o modal é reposicionado no topo.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.
- [ ] UAT em dispositivo mobile com teclado virtual — navegador indisponível no ambiente automatizado.

## Commit

`fix(cart): keep address search focused`
