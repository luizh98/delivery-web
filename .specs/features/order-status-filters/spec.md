# Filtros de pedidos por status e busca

## Problema

As telas de Pedidos e Cozinha não oferecem uma leitura rápida do volume por status nem uma forma direta de localizar um pedido específico.

## Objetivos

- Exibir a quantidade de pedidos por status nas duas telas.
- Permitir filtrar pedidos pelo status selecionado.
- Permitir buscar por nome, ID do pedido ou celular do cliente.

## Fora de escopo

- Alterar endpoints ou persistir filtros.
- Paginação, ordenação ou filtros por data.

## Histórias e critérios de aceite

### P1: Filtrar por status

Como operador, quero ver e selecionar os totais por status para focar na etapa desejada.

1. WHEN a tela carregar THEN o sistema SHALL mostrar um contador para cada status disponível na tela.
2. WHEN o operador clicar em um contador THEN o sistema SHALL listar somente pedidos daquele status.
3. WHEN o operador clicar novamente no status ativo THEN o sistema SHALL remover o filtro de status.
4. WHEN um pedido mudar de status THEN o sistema SHALL atualizar os contadores e a lista filtrada.

### P1: Localizar pedido

Como operador, quero buscar por nome, ID ou celular para localizar rapidamente um pedido.

1. WHEN o operador digitar parte do nome THEN o sistema SHALL filtrar sem diferenciar maiúsculas ou acentos.
2. WHEN o operador digitar o ID completo ou trecho exibido THEN o sistema SHALL retornar o pedido correspondente.
3. WHEN o operador digitar celular com ou sem máscara THEN o sistema SHALL retornar o pedido correspondente.
4. WHEN busca e status estiverem ativos THEN o sistema SHALL aplicar ambos os filtros.
5. WHEN nenhum pedido corresponder THEN o sistema SHALL mostrar estado vazio.

## Casos de borda

- Busca vazia não restringe resultados.
- Status sem pedidos exibe contador zero e lista vazia quando selecionado.
- Espaços externos na busca são ignorados.

## Rastreabilidade

| ID | Requisito | Status |
| --- | --- | --- |
| ORD-FLT-01 | Contadores por status | Verificado |
| ORD-FLT-02 | Clique filtra e desfaz filtro | Verificado |
| ORD-FLT-03 | Busca por nome, ID e celular | Verificado |
| ORD-FLT-04 | Combinação dos filtros | Verificado |
| ORD-FLT-05 | Atualização após mudança de status | Verificado |

## Critério de sucesso

- Operador consegue encontrar e isolar pedidos sem recarregar a página.
- Lint e build do projeto concluem sem erros.
