# Quick Task 013: Scroll interno no modal de endereço

**Date:** 2026-08-06
**Status:** Done

## Description

Permitir scroll somente no conteúdo do formulário, mantendo cabeçalho e ações visíveis.

## Files Changed

- `src/views/Cart/DeliveryAddressModal.tsx` — agrupa busca e campos em região rolável.
- `src/views/Cart/styles.ts` — define grid fixo e scroll interno contido.
- `.specs/quick/013-address-modal-inner-scroll/TASK.md` — registra escopo e verificação.
- `.specs/quick/013-address-modal-inner-scroll/SUMMARY.md` — registra resultado final.

## Verification

- [x] Cabeçalho fica fora da região rolável.
- [x] Busca e campos rolam dentro do modal.
- [x] Ações ficam fora da região rolável.
- [x] Scroll não se propaga para página por overscroll.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.
- [ ] UAT em dispositivo mobile com teclado virtual.

## Commit

`fix(cart): add inner scroll to address modal`
