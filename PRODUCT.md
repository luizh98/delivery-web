# Flyfoods

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Clientes fazem pedidos; administradores dos restaurantes configuram e operam seu próprio estabelecimento. Cozinha, entregadores e salão participam dos fluxos existentes.

## Product Purpose

Plataforma de pedidos e operação de restaurantes, com cardápio público e administração por estabelecimento.

## Operating Context

O mesmo app web atende cliente e admin. Restaurante é identificado pelo tenant. Administração deve funcionar em computador e celular. Avisos do pedido são enviados pelo número do restaurante via WhatsApp integrado à Meta.

## Capabilities and Constraints

- Configurações e credenciais são isoladas por restaurante; credenciais permanecem no servidor.
- Há três avisos de WhatsApp: confirmado e em preparo, saiu para entrega, concluído e avaliação.
- Cliente desta tarefa é o lojista que administra o restaurante. Ele quer editar textos já preenchidos, inserir dados do pedido arrastando parâmetros e visualizar resultado no próprio admin.
- Na confirmação, um único modelo atende entrega e retirada: informação de endereço inclui frase e endereço adequados à modalidade.
- Modelos de mensagem dependem de aprovação da Meta; prévia local não envia mensagem nem confirma aprovação ou entrega.
- Edição mantém versão aprovada em uso enquanto nova versão aguarda aprovação; prévia e rascunho não alteram os envios.

## Brand Commitments

Nome existente: Flyfoods. Textos de WhatsApp devem ser próximos e carismáticos, conforme modelos definidos com o usuário. A interface desta tarefa preserva identidade visual atual do admin.

## Evidence on Hand

- Implementação atual em src/views/AdminSettings/ e componentes compartilhados de formulário.
- Instruções de interface em AGENTS.md: admin operacional, escaneável, mobile-first, componentes e cores existentes.
- Contexto de produto e requisitos da integração em ../.specs/project/ e ../.specs/features/meta-whatsapp-tech-provider/.
- Preferências de edição e prévia confirmadas pelo usuário em 27/10/2026.

## Product Principles

- Começar com conteúdo útil preenchido; não exigir que lojista aprenda formato da API.
- Prévia deve mostrar fielmente transformações e limites do envio.
- Distinguir texto salvo de modelo aprovado e mensagem efetivamente enviada.
- Preservar operação e isolamento de cada restaurante.

## Accessibility & Inclusion

Arrastar parâmetros também deve ter alternativa por clique e teclado; celular não pode depender de arrastar. Estados e erros devem ter texto, além de cor.
