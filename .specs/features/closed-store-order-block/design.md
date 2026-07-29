# Closed Store Order Block Design

**Spec**: `.specs/features/closed-store-order-block/spec.md`
**Status**: Approved

## Architecture Overview

Backend será fonte de verdade. Serviço de disponibilidade avalia configuração no fuso operacional, alimenta resposta pública e protege criação do pedido. Frontend consome `open` e `nextOpeningAt` para aviso e bloqueio preventivo.

## Code Reuse Analysis

| Existing component | Location | How to use |
| --- | --- | --- |
| `RestaurantConfig` | `delivery-api/.../model/RestaurantConfig.java` | Reusar horários semanais e feriados |
| `BadRequestException` | `delivery-api/.../exception/runtime/BadRequestException.java` | Responder 400 no pedido fechado |
| `getRestaurantConfig` | `delivery-web/src/services/api/server.ts` | Carregar status na home e carrinho |
| `Button` | `delivery-web/src/components/Button` | Estado desabilitado no checkout |
| Home styles | `delivery-web/src/views/Home/styles.ts` | Manter fonte e linguagem visual existentes |

## Components

### RestaurantAvailabilityService

- **Purpose**: calcular estado atual e próxima abertura.
- **Location**: `delivery-api/src/main/java/com/delivery/api/service`
- **Interface**: `evaluate(RestaurantConfig): RestaurantAvailability`
- **Dependencies**: `AppProperties.operations.zoneId`
- **Reuses**: `BusinessHour`, `HolidayHour`

### RestaurantConfigResponse

- **Purpose**: expor `open` e `nextOpeningAt` ao storefront.
- **Location**: `delivery-api/src/main/java/com/delivery/api/model/response`

### Closed Store Notice

- **Purpose**: substituir o horário da home pelo fechamento, usando "hoje" para abertura na data atual.
- **Location**: `delivery-web/src/views/Home`
- **Dependencies**: status público e formatador de próxima abertura.

### Checkout Guard

- **Purpose**: desabilitar envio enquanto loja estiver fechada.
- **Location**: `delivery-web/src/views/Cart`
- **Dependencies**: configuração carregada pela página server-side.

## Data Models

```text
RestaurantAvailability {
  open: boolean
  nextOpeningAt: OffsetDateTime?
}
```

```typescript
RestaurantConfigResponse {
  open?: boolean;
  nextOpeningAt?: string;
}
```

## Error Handling Strategy

| Scenario | Handling | User impact |
| --- | --- | --- |
| Loja fechada no checkout | Botão desabilitado e mensagem | Pedido não é enviado |
| Chamada direta ou estado desatualizado | API responde 400 | Pedido não é criado |
| Sem próxima abertura | Aviso mostra somente “Loja fechada” | Sem horário inventado |

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Fonte de verdade | Backend | Evita contorno do frontend |
| Fuso | `America/Sao_Paulo`, configurável por env | Evita depender do fuso do servidor |
| Sem agenda semanal | Considerar aberto | Preserva tenants antigos sem agenda |
| Feriado | Substitui agenda semanal | Semântica esperada do cadastro |
