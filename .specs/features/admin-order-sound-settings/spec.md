# Admin Order Sound Settings Specification

## Problem Statement

O alerta sonoro depende de um botão no menu e atualmente observa apenas pedidos em
`RECEIVED`. Pedidos confirmados automaticamente podem passar sem alerta, e a ativação
do som precisa ficar na tela de configurações sem perder o monitoramento global.

## Goals

- [x] Controlar o alerta por checkbox nas configurações do admin.
- [x] Tocar uma vez por pedido novo, independentemente do status retornado.
- [x] Repetir o alerta enquanto existir pedido em `RECEIVED`.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Persistir preferência no backend | Permissão de áudio pertence ao navegador/dispositivo. |
| Alterar intervalo de polling | Cinco segundos já é o comportamento validado. |
| Alterar confirmação ou impressão automática | Fluxos existentes devem ser preservados. |

## P1: Configurar alerta sonoro

**User Story**: Como administrador, quero ativar o alerta nas configurações para
receber avisos sonoros sem ocupar espaço no menu.

**Acceptance Criteria**:

1. WHEN o admin abrir o menu THEN o sistema SHALL não exibir botão de som.
2. WHEN o admin marcar o checkbox THEN o sistema SHALL tocar uma amostra e persistir
   a preferência no navegador.
3. WHEN o admin desmarcar o checkbox THEN o sistema SHALL parar e desativar alertas.
4. WHEN o navegador rejeitar a reprodução THEN o sistema SHALL desmarcar a opção e
   mostrar erro visível.

## P1: Alertar pedidos novos e recebidos

**User Story**: Como operador, quero ouvir cada chegada e lembretes de pedidos
recebidos para não perder pedidos, inclusive com confirmação automática.

**Acceptance Criteria**:

1. WHEN surgir um ID após o baseline inicial THEN o sistema SHALL enfileirar um toque
   para esse pedido, qualquer que seja seu status.
2. WHEN múltiplos IDs surgirem no mesmo polling THEN o sistema SHALL enfileirar um
   toque por pedido.
3. WHEN existir qualquer pedido `RECEIVED` sem pedido novo no ciclo THEN o sistema
   SHALL tocar uma vez no ciclo de cinco segundos.
4. WHEN um pedido chegar já `CONFIRMED` por confirmação automática THEN o sistema
   SHALL tocar pelo menos uma vez por seu ID novo.

## Edge Cases

- Primeiro polling alerta pedidos criados após o início do monitoramento e estabelece
  baseline sem tocar pedidos confirmados antigos.
- Pedido `RECEIVED` presente no primeiro polling gera lembrete.
- Vários pedidos `RECEIVED` geram um lembrete por ciclo, não um por pedido.
- Alertas não acumulam enquanto a opção estiver desativada.

## Requirement Traceability

| Requirement ID | Requirement | Status |
| --- | --- | --- |
| ORDER-SOUND-01 | Checkbox nas configurações e remoção do menu | Verified |
| ORDER-SOUND-02 | Preferência por navegador e tratamento de bloqueio | Verified |
| ORDER-SOUND-03 | Um toque enfileirado por novo ID | Verified |
| ORDER-SOUND-04 | Repetição enquanto houver `RECEIVED` | Verified |
| ORDER-SOUND-05 | Alerta para pedido auto-confirmado | Verified |

## Success Criteria

- [x] Todos os critérios P1 verificados por código e build.
- [x] `npm run lint`, `npm run build` e `git diff --check` passam.
