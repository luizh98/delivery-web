# Overdue Card Aura Specification

## Problem Statement

Cards de pedidos atrasados usam preenchimento vermelho e uma borda neon fixa. Isso
reduz a leitura do conteúdo operacional e não comunica urgência com a qualidade
visual desejada nos fluxos de Pedidos e Cozinha.

## Goals

- [x] Destacar pedido atrasado somente pela área externa do card.
- [x] Usar aura neon animada com transição âmbar, coral, vermelho e rosa.
- [x] Manter texto, ações, regra de atraso e alerta sonoro atuais.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Alterar cálculo de atraso | Estado operacional existente permanece igual. |
| Alterar som ou polling | Efeito é exclusivamente visual. |
| Mudar cards não atrasados | Evita expansão de escopo. |

## P1: Destacar atraso sem comprometer leitura

**User Story**: Como operador, quero identificar pedidos atrasados por um alerta
visual moderno para priorizá-los sem perder legibilidade do card.

**Acceptance Criteria**:

1. WHEN pedido estiver atrasado THEN sistema SHALL manter superfície interna normal
   e exibir aura externa animada.
2. WHEN aura for exibida THEN sistema SHALL usar gradiente contínuo entre âmbar,
   coral, vermelho e rosa, sem borda estática.
3. WHEN card aparecer em Pedidos ou Cozinha THEN sistema SHALL apresentar mesmo
   efeito, pois ambos reutilizam `OrdersManager`.
4. WHEN preferência de movimento reduzido estiver ativa THEN sistema SHALL manter
   sinal visual externo sem animação.

## Edge Cases

- Card em hover ou foco mantém indicador de foco existente acima do efeito.
- Aura não captura clique nem teclado.

## Requirement Traceability

| Requirement ID | Requirement | Status |
| --- | --- | --- |
| OVERDUE-AURA-01 | Superfície interna permanece neutra | Verified |
| OVERDUE-AURA-02 | Aura externa possui gradiente em movimento | Verified |
| OVERDUE-AURA-03 | Fallback para movimento reduzido | Verified |

## Success Criteria

- [x] Cards atrasados em Pedidos e Cozinha têm aura externa, sem fundo de alerta.
- [x] `npm run lint`, `npm run build` e `git diff --check` passam.
