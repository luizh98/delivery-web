# Quick Task 006: Resumo

**Status:** Done
**Date:** 2026-08-06

## Resultado

- Cardápio não exibe mais o atalho direto "Acompanhar pedido".
- Usuário com histórico local vê somente "Meus pedidos", que abre `/orders`.
- Ação mantém estilo secundário, ícone semântico e foco visível; compra continua como objetivo principal do cardápio.
- Usuário sem pedidos recentes não vê controle vazio.

## Verificação

- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.
- Revisão estática confirmou que estrutura e estilos responsivos não foram alterados.
- Validação visual automatizada não executada: nenhum navegador estava disponível no ambiente.

## Commit

`fix(menu): keep only orders history shortcut`
