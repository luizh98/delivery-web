# Detalhes operacionais de pedidos — Design

**Spec**: `.specs/features/order-status-filters/spec.md`
**Status**: Aprovado pelo pedido de implementação

## Arquitetura

- `AdminKitchenView` continua filtrando pedidos operacionais, mas entrega também `allOrders` ao componente compartilhado.
- `OrdersManager` calcula o ordinal por celular normalizado, ordenando o histórico pela data de recebimento e usando ID como desempate.
- O card mostra somente resumo iconográfico. A área de resumo abre modal local e acessível; controles de status permanecem independentes.
- O modal reutiliza dados já presentes em `OrderResponse`; nenhuma chamada ou alteração de backend.
- Google Maps usa `https://www.google.com/maps/search/?api=1&query=...` com endereço codificado.
- O filtro temporal usa períodos derivados em horário local e `@daypicker/react` no modo `range` para o intervalo personalizado.
- A impressão mantém conteúdo somente na janela temporária; nenhum estado renderiza cópia do recibo na página administrativa. O formatador da API inclui endereço completo somente para entrega.

## Componentes e interfaces

### `OrdersManagerProps`

- `initialOrders`: pedidos exibidos na tela.
- `allOrders?`: histórico completo usado apenas para calcular recorrência; fallback para `initialOrders`.

### Resumo do card

- Ordem: ID/status, cliente/ordinal, entrega, pagamento, troco opcional e rodapé com tempo/total.
- Interação: clique, Enter ou Espaço abre detalhes; hover/foco desenha contorno primário ao redor do card inteiro.

### Filtro de período

- Presets: últimos 7 dias (padrão), ontem, hoje, este mês e personalizado.
- Presets aplicam datas locais inclusivas imediatamente.
- Personalizado mantém seleção temporária no modal e só altera o filtro ao confirmar início e fim.
- `DayPicker` usa `mode="range"`, locale `ptBR` e estilos customizados pela cor primária.

### Modal de detalhes

- Seções: cliente, entrega, produtos e valores.
- Fechamento: botão, clique no overlay ou tecla Esc.
- Permanece dentro de `OrdersManager`, inclusive em fullscreen.
- Rodapé fixo: imprimir, cancelar com motivo e próxima etapa contextual.
- Fluxo: recebido → confirmado → preparando → pronto → saiu para entrega → concluído; retirada pula saída para entrega.

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
| Calendário | `@daypicker/react` em modo range | Mostra visualmente início, meio e fim do período |
| Período padrão | Últimos 7 dias, incluindo hoje | Visão operacional recente sem ação inicial |
| Troco | Mostrar `changeForCents` positivo como "Troco para" | Preserva o significado usado no checkout |
| Seleção do card | `outline` primário externo | Contorno único sem sombra ou fundo interno |
| Impressão | Janela temporária com `window.print()` + endereço na API | Abre visualização/PDF sem duplicar conteúdo e identifica destino da entrega |
| Próxima etapa | Derivada de status e tipo de entrega | Evita seleção manual e não envia retirada para entrega |

## Erros e ausências

- Sem endereço: texto informativo, sem link de mapa.
- Data inválida/ausente: desempate estável pelo ID.
- Sem pagamento: mantém “Pagamento não informado”.
- Intervalo personalizado incompleto: botão de aplicar desabilitado.
- Dinheiro sem troco positivo: linha de troco omitida.
