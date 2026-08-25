# Quick Task 019: Exibir total de desconto no carrinho

**Date:** 2026-08-25
**Status:** Done

## Result

- O subtotal exibido passou a representar o valor bruto dos itens.
- O desconto agregado aparece logo abaixo do subtotal no carrinho e na finalização.
- A linha de desconto permanece oculta quando o valor é zero.
- O total final continua representando os itens com desconto mais o frete.

## Verification

- `npm run lint` — aprovado.
- `npm run build` — aprovado, incluindo compilação e TypeScript.
- `git diff --check` — aprovado.

## Commit

`feat(cart): show total discount in checkout`
