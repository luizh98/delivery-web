# Quick Task 006: Simplificar acesso aos pedidos no cardápio

**Date:** 2026-08-06
**Status:** Done

## Description

Remover o atalho direto "Acompanhar pedido" do cardápio e manter somente "Meus pedidos", reduzindo escolhas duplicadas sem tirar o acesso ao acompanhamento.

## Files Changed

- `src/views/Home/CustomerMenu.tsx` — mantém apenas o atalho para o histórico de pedidos.
- `.specs/quick/006-menu-orders-shortcut/TASK.md` — registra escopo e verificação.
- `.specs/quick/006-menu-orders-shortcut/SUMMARY.md` — registra resultado final.
- `.specs/project/STATE.md` — registra a quick task concluída.

## UX/UI Decision

- Exibir "Meus pedidos" somente quando houver pedidos recentes neste navegador.
- Manter tratamento visual secundário: consultar pedidos é ação auxiliar; explorar o cardápio continua sendo objetivo principal da tela.
- Usar ícone `ClipboardList` e área clicável de botão já existente, com foco de teclado visível.

## Verification

- [x] Cardápio não exibe "Acompanhar pedido".
- [x] Cardápio exibe apenas "Meus pedidos" quando há histórico local.
- [x] Botão "Meus pedidos" abre `/orders`.
- [x] Não há controle vazio quando não existem pedidos recentes.
- [x] Lint e build do frontend passam.
- [x] Estrutura e estilos responsivos existentes permanecem inalterados.

Validação visual automatizada não executada porque nenhum navegador estava disponível no ambiente.

## Commit

`fix(menu): keep only orders history shortcut`
