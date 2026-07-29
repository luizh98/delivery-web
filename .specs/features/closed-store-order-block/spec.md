# Closed Store Order Block Specification

## Problem Statement

Clientes conseguem avançar até o envio do pedido mesmo fora do expediente. A loja precisa comunicar quando está fechada, informar a próxima abertura e impedir novos pedidos tanto na interface quanto na API.

## Goals

- [x] Exibir estado fechado no topo do cardápio.
- [x] Informar próxima abertura quando houver horário futuro configurado.
- [x] Bloquear finalização no carrinho e criação direta pela API.
- [x] Respeitar horários semanais, feriados e turnos noturnos.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Bloquear navegação e montagem do carrinho | Cliente ainda pode revisar e preparar itens |
| Configurar fuso por tenant | MVP opera em `America/Sao_Paulo` |
| Atualização em tempo real sem navegação | API valida novamente no envio |

## User Stories

### P1: Comunicar loja fechada

**User Story**: Como cliente, quero ver que a loja está fechada e quando abre para não tentar concluir um pedido indisponível.

**Acceptance Criteria**:

1. WHEN loja estiver fora do expediente THEN home SHALL substituir o horário de funcionamento pelo aviso vermelho contornado.
2. WHEN próxima abertura ocorrer na data atual THEN aviso SHALL informar "abre hoje às {hora}".
3. WHEN próxima abertura ocorrer em outra data THEN aviso SHALL informar o dia da semana e a hora.
4. WHEN loja estiver aberta THEN aviso de fechamento SHALL não aparecer.
5. WHEN loja estiver aberta THEN home SHALL exibir o horário de funcionamento normal.

**Independent Test**: Abrir home com configuração fechada e verificar aviso; abrir com configuração aberta e verificar ausência.

### P1: Impedir pedido fora do expediente

**User Story**: Como operador, quero rejeitar pedidos fora do expediente para não receber pedidos que não posso atender.

**Acceptance Criteria**:

1. WHEN loja estiver fechada THEN checkout SHALL desabilitar envio do pedido.
2. WHEN cliente chamar criação de pedido diretamente fora do expediente THEN API SHALL responder `400`.
3. WHEN loja estiver aberta THEN checkout e API SHALL permitir fluxo normal.

**Independent Test**: Testar botão fechado e chamada do serviço em horário fechado/aberto.

## Edge Cases

- WHEN fechamento for menor que abertura THEN sistema SHALL tratar expediente como turno noturno.
- WHEN houver feriado na data THEN horário de feriado SHALL substituir horário semanal.
- WHEN não houver horário semanal configurado THEN sistema SHALL manter compatibilidade e considerar loja aberta.
- WHEN não houver próxima abertura configurada THEN mensagem SHALL omitir hora futura.

## Requirement Traceability

| Requirement ID | Story | Status |
| --- | --- | --- |
| HOURS-01 | Comunicar loja fechada | Verified |
| HOURS-02 | Informar próxima abertura | Verified |
| HOURS-03 | Bloquear checkout | Verified |
| HOURS-04 | Rejeitar criação pela API | Verified |
| HOURS-05 | Tratar feriados e turnos noturnos | Verified |

**Coverage:** 5 total, 5 mapped, 0 unmapped.

## Success Criteria

- [x] Todos os requisitos `HOURS-*` verificados.
- [x] Testes da API passam.
- [x] Lint e build do frontend passam.
