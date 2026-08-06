# Identificador do pedido no admin

## Problema

O cliente vê um identificador curto do pedido, mas o admin não exibe esse mesmo valor, dificultando localizar rapidamente o pedido informado pelo cliente.

## Objetivo

- Exibir no card do pedido no admin o mesmo identificador curto mostrado ao cliente.

## Fora de escopo

- Alterar o identificador persistido ou o código de rastreamento.
- Mudar endpoints ou contratos da API.
- Adicionar busca ou filtro por identificador.

## História P1

Como operador do admin, quero ver o identificador informado ao cliente para localizar o pedido correspondente com facilidade.

### Critérios de aceitação

1. WHEN um pedido for exibido no admin THEN o sistema SHALL mostrar `Pedido #XXXXXX` junto aos dados do cliente.
2. WHEN o identificador for exibido THEN o sistema SHALL usar os últimos seis caracteres do ID interno em maiúsculas, mesma regra usada na resposta pública.
3. WHEN o ID interno tiver menos de seis caracteres THEN o sistema SHALL mostrar todo o ID em maiúsculas.

**Teste independente:** comparar o número exibido no acompanhamento do cliente com o card correspondente em `/admin/orders`.

## Rastreabilidade

| Requisito | História | Status |
| --- | --- | --- |
| AON-01 | P1 | Verified |
| AON-02 | P1 | Verified |
| AON-03 | P1 | Verified |

## Critérios de sucesso

- [x] Cliente e admin exibem o mesmo identificador curto para o mesmo pedido.
- [x] Lint, build e `git diff --check` passam.
