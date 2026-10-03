# Quick Task 024: Data do pedido nos modais

**Date:** 2026-10-03
**Status:** Done (implementação validada; publicação acompanhada após o push)

## Description

Exibir data e hora do pedido no modal compartilhado de Pedidos e Cozinha e publicar em staging.

## Files Changed

- `src/components/OrdersManager/index.tsx`: campo no cabeçalho usando `createdAt`, com fallback para recebimento e proteção para datas ausentes ou inválidas.

## Verification

- [x] Data/hora em pt-BR, no fuso local usado pelos filtros existentes.
- [x] Datas ausentes ou inválidas exibem Data indisponível.
- [x] Lint do componente alterado e build aprovados; 24 testes existentes e 5 verificações de datas passaram.
- Lint geral: 3 erros e 1 aviso preexistentes em AdminDashboard/AdminPrinter; arquivos idênticos a origin/staging.
- Publicação: push exclusivo para staging, cujo serviço Easypanel possui deploy automático; confirmar conclusão após push.

## Commit

`feat(admin): show order date in orders and kitchen modals`
