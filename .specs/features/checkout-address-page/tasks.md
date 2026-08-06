# Checkout Address Page Tasks

**Design**: `.specs/features/checkout-address-page/design.md`
**Status**: Done

## Execution Plan

`T1 → T2 → T3 → T4 → T5 → T6`

## Task Breakdown

### T1: Criar formulário de endereço em página

**Where**: `src/views/Cart/DeliveryAddressPage.tsx`
**Depends on**: None
**Requirements**: ADDRPAGE-02, ADDRPAGE-03, ADDRPAGE-04, ADDRPAGE-05

**Done when**:

- [x] Carrega endereço salvo sem persistir edições parciais.
- [x] Novo endereço revela campos após sugestão.
- [x] Salvar valida e persiste; cancelar não persiste.

### T2: Criar rota dedicada

**Where**: `src/app/cart/address/page.tsx`
**Depends on**: T1
**Requirement**: ADDRPAGE-01

**Done when**:

- [x] `/cart/address` renderiza formulário.

### T3: Integrar navegação no carrinho

**Where**: `src/views/Cart/index.tsx`
**Depends on**: T2
**Requirements**: ADDRPAGE-01, ADDRPAGE-06

**Done when**:

- [x] Selecionar/editar navega para rota.
- [x] Modal e estado local são removidos.
- [x] `initialStep` controla etapa inicial.

### T4: Restaurar etapa pelo search param

**Where**: `src/app/cart/page.tsx`
**Depends on**: T3
**Requirement**: ADDRPAGE-06

**Done when**:

- [x] `step=checkout` abre etapa 2.
- [x] Ausência do parâmetro mantém etapa 1.

### T5: Substituir estilos e remover modal

**Where**: `src/views/Cart/styles.ts`, `src/views/Cart/DeliveryAddressModal.tsx`
**Depends on**: T1, T3
**Requirements**: ADDRPAGE-01, ADDRPAGE-02

**Done when**:

- [x] Estilos da página existem.
- [x] Componente e estilos do modal não permanecem órfãos.

### T6: Validar e publicar

**Depends on**: T1-T5
**Requirements**: ADDRPAGE-01..06

**Done when**:

- [x] `npm run lint` passa.
- [x] `npm run build` passa.
- [x] `git diff --check` passa.
- [x] Commit atômico criado e enviado para `main`.
