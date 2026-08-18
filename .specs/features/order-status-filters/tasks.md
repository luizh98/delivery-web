# Detalhes operacionais de pedidos — Tarefas

**Design**: `.specs/features/order-status-filters/design.md`
**Status**: Concluído

## Plano

T1 → T2 → T3 → T4 → T5 → T6 → T7

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

### T5: Implementar resumo financeiro e contorno

**Onde**: `src/components/OrdersManager/index.tsx`, `src/components/OrdersManager/styles.ts`, `delivery-api/.../OrderMessageFormatter.java`
**Depende de**: T4
**Requisitos**: ORD-FLT-21 a ORD-FLT-23, ORD-FLT-25, ORD-FLT-26
**Ferramentas**: edição local, context-mode

**Concluído quando**:

- [x] Rodapé mostra tempo e total em texto preto.
- [x] Troco positivo em dinheiro aparece no card e no modal.
- [x] Hover/foco mostra somente contorno primário no card inteiro.
- [x] Impressão não renderiza recibo abaixo da página.
- [x] Impressão de entrega inclui endereço completo; retirada não inclui.
- [x] Modal oferece imprimir, cancelar com motivo e próxima etapa contextual.

### T6: Implementar períodos rápidos e calendário

**Onde**: `package.json`, `package-lock.json`, `src/app/layout.tsx`, `src/components/OrdersManager/index.tsx`, `src/components/OrdersManager/styles.ts`
**Depende de**: T5
**Requisitos**: ORD-FLT-24
**Ferramentas**: `@daypicker/react`, edição local, context-mode

**Concluído quando**:

- [x] Últimos 7 dias fica ativo por padrão.
- [x] Ontem, hoje e este mês aplicam imediatamente.
- [x] Personalizado abre modal com intervalo marcado e só aplica seleção completa.
- [x] Calendário fica localizado em português e responsivo.

### T7: Validar e publicar ajustes

**Onde**: arquivos da feature e documentação
**Depende de**: T5, T6
**Requisitos**: ORD-FLT-21 a ORD-FLT-26
**Ferramentas**: context-mode, GitHub publish

**Concluído quando**:

- [x] TypeScript passa.
- [x] Lint passa.
- [x] Build passa.
- [x] Rastreabilidade fica verificada.
- [x] Commits publicados na `main`.
