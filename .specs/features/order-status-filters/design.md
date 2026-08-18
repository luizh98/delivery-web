# Detalhes operacionais de pedidos — Design

**Spec**: `.specs/features/order-status-filters/spec.md`
**Status**: Aprovado pelo pedido de implementação

## Arquitetura

- `AdminKitchenView` continua filtrando pedidos operacionais, mas entrega também `allOrders` ao componente compartilhado.
- `OrdersManager` calcula o ordinal por celular normalizado, ordenando o histórico pela data de recebimento e usando ID como desempate.
- O card mostra somente resumo iconográfico. A área de resumo abre modal local e acessível; controles de status permanecem independentes.
- O modal reutiliza dados já presentes em `OrderResponse`; nenhuma chamada ou alteração de backend.
- Google Maps usa `https://www.google.com/maps/search/?api=1&query=...` com endereço codificado.

## Componentes e interfaces

### `OrdersManagerProps`

- `initialOrders`: pedidos exibidos na tela.
- `allOrders?`: histórico completo usado apenas para calcular recorrência; fallback para `initialOrders`.

### Resumo do card

- Ordem: ID/status, cliente/ordinal, entrega, pagamento, tempo recebido.
- Interação: clique, Enter ou Espaço abre detalhes; hover/foco mostra affordance visual.

### Modal de detalhes

- Seções: cliente, entrega, produtos e valores.
- Fechamento: botão, clique no overlay ou tecla Esc.
- Permanece dentro de `OrdersManager`, inclusive em fullscreen.

## Reuso

- `Button`, `money`, `statusLabel`, tipos `OrderResponse`/`Address`.
- Padrão visual de overlay/dialog do `ConfirmationProvider`.
- Formatação de endereço baseada no fluxo do carrinho.

## Decisões

| Decisão | Escolha | Razão |
| --- | --- | --- |
| Identidade do cliente | Celular sem máscara | Campo estável disponível em todos os pedidos |
| Número no badge | Ordinal cronológico do pedido | Sustenta texto “Este é o N.º pedido” |
| Produtos no card | Não renderizar | Mantém grade de três cards escaneável |
| Mapa | Link externo com query | Sem nova dependência ou chave de API |

## Erros e ausências

- Sem endereço: texto informativo, sem link de mapa.
- Data inválida/ausente: desempate estável pelo ID.
- Sem pagamento: mantém “Pagamento não informado”.
