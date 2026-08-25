# Quick Task 019: Exibir total de desconto no carrinho

**Date:** 2026-08-25
**Status:** Done

## Description

Exibir o desconto total abaixo do subtotal no carrinho e na finalização quando houver itens com desconto.

## Files Changed

- `src/views/Cart/index.tsx` — calcula o subtotal bruto e exibe o desconto agregado nas duas etapas.

## Verification

- [x] Exibir subtotal bruto e desconto total no carrinho quando o desconto for maior que zero.
- [x] Exibir subtotal bruto e desconto total na finalização quando o desconto for maior que zero.
- [x] Ocultar a linha de desconto quando o carrinho não tiver desconto.
- [x] Manter o total final como valor líquido dos itens mais o frete.
- [x] Executar lint e build do frontend.

## Commit

`feat(cart): show total discount in checkout`
