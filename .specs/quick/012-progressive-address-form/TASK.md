# Quick Task 012: Formulário progressivo de endereço

**Date:** 2026-08-06
**Status:** Done

## Description

Abrir cadastro e edição mostrando somente a busca; exibir demais campos após selecionar um endereço.

## Files Changed

- `src/views/Cart/DeliveryAddressModal.tsx` — formulário inicia sem rascunho, mesmo durante edição.
- `.specs/quick/012-progressive-address-form/TASK.md` — registra escopo e verificação.
- `.specs/quick/012-progressive-address-form/SUMMARY.md` — registra resultado final.

## Verification

- [x] Novo endereço abre somente com a busca.
- [x] Edição abre somente com a busca.
- [x] Selecionar sugestão libera os campos complementares.
- [x] Cancelar preserva endereço salvo.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.

## Commit

`fix(cart): reveal address fields after selection`
