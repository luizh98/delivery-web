# Quick Task 016: Resumo

**Status:** Done
**Date:** 2026-08-24

## Resultado

- Notifier global monitora novos pedidos em qualquer rota protegida do admin.
- Primeiro polling cria baseline e não toca pedidos existentes.
- Botão `Ativar som` executa reprodução sob gesto do usuário e mantém estado durante navegação interna.
- Falha por política de autoplay gera toast com orientação direta.
- Reprodução local foi removida de `OrdersManager`, preservando atualização e impressão sem áudio duplicado.

## Verificação

- Browser: antes da ativação, `NotAllowedError` reproduzido e toast exibido.
- Browser: clique em `Ativar som` resolveu `play()` com volume 1.
- Browser: pedido simulado no dashboard gerou segunda reprodução resolvida.
- Browser: estado `Som ativo` permaneceu em `/admin/orders`.
- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.

## Commit

`fix(admin): play new order sound across admin`
