# Closed Store Order Block Tasks

**Design**: `.specs/features/closed-store-order-block/design.md`
**Status**: Done

## Execution Plan

T1 -> T2 -> T3 -> T4 -> T5

## Task Breakdown

### T1: Calcular disponibilidade

**What**: Criar serviço que avalia agenda semanal, feriados, turno noturno e próxima abertura.
**Where**: `delivery-api/src/main/java/com/delivery/api/service/**`
**Depends on**: None
**Requirement**: HOURS-02, HOURS-05

**Done when**:

- [x] Casos aberto, fechado, feriado e noturno têm testes.
- [x] Fuso vem de configuração.

**Verify**: `.\mvnw.cmd test`

### T2: Expor status público

**What**: Adicionar disponibilidade à resposta de configuração.
**Where**: DTO e serviço de configuração da API.
**Depends on**: T1
**Requirement**: HOURS-01, HOURS-02

**Done when**:

- [x] Resposta contém `open` e `nextOpeningAt`.
- [x] Testes existentes compilam e passam.

**Verify**: `.\mvnw.cmd test`

### T3: Proteger criação do pedido

**What**: Rejeitar pedido quando disponibilidade indicar loja fechada.
**Where**: `OrderServiceImpl` e teste.
**Depends on**: T1
**Requirement**: HOURS-04

**Done when**:

- [x] Pedido fechado lança `BadRequestException`.
- [x] Pedido aberto mantém comportamento.

**Verify**: `.\mvnw.cmd test`

### T4: Exibir aviso na home

**What**: Renderizar aviso vermelho, contornado e textual no topo da home.
**Where**: tipos, utilitário e arquivos da view Home.
**Depends on**: T2
**Requirement**: HOURS-01, HOURS-02

**Done when**:

- [x] Aviso aparece somente fechado.
- [x] Próxima abertura é formatada sem inventar dado.
- [x] `npm run lint` passa.

**Verify**: `npm run lint`

### T5: Bloquear checkout

**What**: Carregar disponibilidade no carrinho, mostrar aviso e desabilitar envio.
**Where**: página e view Cart.
**Depends on**: T2, T4
**Requirement**: HOURS-03

**Done when**:

- [x] Botão fica desabilitado fechado.
- [x] Carrinho permanece revisável.
- [x] `npm run build` passa.

**Verify**: `npm run lint`; `npm run build`
