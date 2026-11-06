# Quick Task 033: Isolar sacola da mesa e delivery

**Date:** 2026-11-06
**Status:** Done

## Description

Impedir que acesso anterior pelo QR Code faça `/cart` enviar `TABLE` sem token, separando sacola e checkout por mesa e recuperando o estado legado do delivery.

## Scope

- `src/components/CartProvider/index.tsx`: armazenamento/cache por token nas rotas de mesa; delivery mantém chave existente e recupera `TABLE` como `DELIVERY`.
- `src/views/Cart/index.tsx`: modalidade do formulário e payload limitadas pelo contexto; mesa nunca envia endereço.
- `src/components/CartProvider/isolation.test.mjs`: regressões de armazenamento, navegação, conclusão e payload real do checkout.

## Acceptance

- [x] `/cart` aceita somente `DELIVERY` ou `PICKUP`, mesmo com modalidade antiga `TABLE`.
- [x] Endereço, itens e histórico existentes não são apagados na recuperação.
- [x] Mesa compartilha sacola entre cardápio, produto e checkout, isolada do delivery e de outras mesas.
- [x] Concluir pedido na mesa não limpa sacola do delivery.
- [x] Payload de mesa contém token e omite endereço, mesmo com formulário desatualizado.
- [x] Suíte web, TypeScript, lint dos arquivos alterados e build aprovados.

## Publication

Autorizada publicação de web em staging. Encerrar após push, sem acompanhar deploy.

## Audit

Não aplicável: backend e gravações de negócio não alterados. Mudança restrita ao estado local e montagem de requisição no frontend.
