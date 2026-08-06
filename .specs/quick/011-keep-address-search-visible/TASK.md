# Quick Task 011: Manter busca de endereço visível

**Date:** 2026-08-06
**Status:** Done

## Description

Manter o campo "Buscar endereço" focado e totalmente visível quando o teclado virtual reduzir a área útil do modal.

## Files Changed

- `src/views/Cart/DeliveryAddressModal.tsx` — sincroniza overlay com viewport visual e reposiciona a busca ativa.
- `.specs/quick/011-keep-address-search-visible/TASK.md` — registra escopo e verificação.
- `.specs/quick/011-keep-address-search-visible/SUMMARY.md` — registra resultado final.

## Verification

- [x] Overlay acompanha altura e deslocamento do viewport visual.
- [x] Busca ativa volta ao topo do scroll interno após abertura do teclado.
- [x] Listeners e frames são removidos ao fechar modal.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] `git diff --check`.
- [ ] UAT em dispositivo mobile com teclado virtual — navegador indisponível no ambiente automatizado.

## Commit

`fix(cart): keep address search visible above keyboard`
