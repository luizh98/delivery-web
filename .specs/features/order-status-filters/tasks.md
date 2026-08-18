# Detalhes operacionais de pedidos — Tarefas

**Design**: `.specs/features/order-status-filters/design.md`
**Status**: Concluído

## Plano

T1 → T2 → T3 → T4

## Tarefas

### T1: Disponibilizar histórico completo na cozinha

**Onde**: `src/components/OrdersManager/types.ts`, `src/views/AdminKitchen/index.tsx`
**Requisitos**: ORD-FLT-19
**Ferramentas**: edição local, context-mode

**Concluído quando**:

- [x] Prop opcional `allOrders` tipada.
- [x] Cozinha passa histórico completo sem alterar lista operacional exibida.
- [x] Build TypeScript passa.

### T2: Implementar resumo e modal

**Onde**: `src/components/OrdersManager/index.tsx`
**Depende de**: T1
**Requisitos**: ORD-FLT-14 a ORD-FLT-20
**Ferramentas**: edição local, context-mode

**Concluído quando**:

- [x] Produtos removidos do card e exibidos no modal.
- [x] Cliente, endereço, mapa e totais aparecem no modal.
- [x] Ordinal por cliente é calculado pelo histórico completo.
- [x] Card segue ordem iconográfica solicitada.
- [x] Modal fecha por botão, overlay e Esc.

### T3: Estilizar card clicável e modal

**Onde**: `src/components/OrdersManager/styles.ts`
**Depende de**: T2
**Requisitos**: ORD-FLT-14 a ORD-FLT-20
**Ferramentas**: edição local, context-mode

**Concluído quando**:

- [x] Hover/foco deixa interação evidente.
- [x] Modal é responsivo e rolável.
- [x] Badge ordinal possui destaque cinza e tooltip nativo.

### T4: Validar e publicar

**Onde**: arquivos da feature e documentação
**Depende de**: T1, T2, T3
**Ferramentas**: context-mode, GitHub publish

**Concluído quando**:

- [x] Lint passa.
- [x] Build passa.
- [x] Rastreabilidade fica verificada.
- [x] Commits publicados na `main`.
