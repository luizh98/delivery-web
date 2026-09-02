# Overdue Card Aura Specification

## Problem Statement

Cards de pedidos atrasados usam preenchimento vermelho e uma borda neon fixa. Isso
reduz a leitura do conteúdo operacional e não comunica urgência com a qualidade
visual desejada nos fluxos de Pedidos e Cozinha.

## Goals

- [x] Destacar pedido atrasado somente pela área externa do card.
- [x] Manter vermelho dominante na aura neon animada, com reflexos coral e rosa.
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
2. WHEN pedido estiver atrasado THEN sistema SHALL pulsar neon vermelho visível
   em todo o perímetro externo do card, sem preencher seu interior.
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
| OVERDUE-AURA-02 | Aura externa vermelha possui gradiente em movimento | Verified |
| OVERDUE-AURA-03 | Fallback para movimento reduzido | Verified |
| OVERDUE-AURA-04 | Pulso vermelho externo fica visível no card atrasado | Verified |

## Success Criteria

- [x] Cards atrasados em Pedidos e Cozinha pulsam vermelho externamente, sem fundo de alerta.
- [ ] `npm run build` passa — bloqueado por `AdminNavigation.tsx`, fora deste escopo.
- [x] `npm run lint` e `git diff --check` passam.
