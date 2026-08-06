# Checkout Address Page Specification

## Problem Statement

O formulário de endereço dentro de modal continua sendo cortado pelo teclado virtual em dispositivos móveis. Seleção e edição devem acontecer em página própria, usando o scroll natural do documento.

## Goals

- [x] Substituir modal por rota dedicada de endereço.
- [x] Preservar busca, edição, validação e persistência existentes.
- [x] Retornar cliente diretamente ao checkout após salvar ou cancelar.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Múltiplos endereços | Checkout mantém um único endereço confirmado |
| Alteração da API Google Places | Integração existente será reutilizada |
| Mudança no payload do pedido | Campos atuais continuam válidos |

## User Stories

### P1: Gerenciar endereço em página própria ⭐ MVP

**User Story**: Como cliente, quero cadastrar ou editar endereço em página própria para usar o formulário sem cortes causados pelo modal e teclado.

**Acceptance Criteria**:

1. WHEN cliente clicar em selecionar ou editar endereço THEN sistema SHALL navegar para `/cart/address`.
2. WHEN não existir endereço salvo THEN página SHALL mostrar busca e manter campos adicionais ocultos até seleção válida.
3. WHEN existir endereço salvo THEN página SHALL mostrar campos preenchidos e permitir nova busca para substituição.
4. WHEN cliente salvar endereço válido THEN sistema SHALL persistir via `CartProvider` e navegar para `/cart?step=checkout`.
5. WHEN cliente cancelar ou voltar THEN sistema SHALL descartar rascunho e navegar para `/cart?step=checkout`.
6. WHEN página de carrinho receber `step=checkout` THEN sistema SHALL abrir etapa de checkout.

**Independent Test**: Abrir rota por novo e edição, salvar/cancelar e confirmar retorno à etapa 2 com resumo correto.

## Edge Cases

- WHEN endereço não possuir número ou bairro THEN página SHALL mostrar erro e impedir salvamento.
- WHEN Places falhar THEN página SHALL mostrar erro existente sem perder formulário.
- WHEN rota for aberta diretamente sem endereço salvo THEN página SHALL permitir novo cadastro.
- WHEN cliente sair sem salvar THEN endereço persistido SHALL permanecer inalterado.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| ADDRPAGE-01 | Página dedicada | Validate | Implemented; UAT pending |
| ADDRPAGE-02 | Novo endereço progressivo | Validate | Implemented; UAT pending |
| ADDRPAGE-03 | Edição preenchida | Validate | Implemented; UAT pending |
| ADDRPAGE-04 | Persistência confirmada | Validate | Implemented; UAT pending |
| ADDRPAGE-05 | Cancelamento seguro | Validate | Implemented; UAT pending |
| ADDRPAGE-06 | Retorno ao checkout | Validate | Implemented; UAT pending |

**Coverage:** 6 total, 6 mapped, 0 unmapped.

## Success Criteria

- [x] Nenhum modal de endereço permanece no fluxo.
- [ ] Página usa scroll natural com teclado virtual — UAT mobile pendente.
- [x] Endereço só muda após salvar.
- [x] Checkout reabre na etapa 2.
