# Filtros de pedidos por status e busca

## Problema

As telas de Pedidos e Cozinha não oferecem uma leitura rápida do volume por status nem uma forma direta de localizar um pedido específico.

## Objetivos

- Exibir a quantidade de pedidos por status nas duas telas.
- Permitir filtrar pedidos pelo status selecionado.
- Permitir buscar por nome, ID do pedido ou celular do cliente.
- Permitir filtrar pedidos por período.
- Melhorar leitura operacional do tempo e dos itens do pedido.
- Permitir operação em tela cheia sem o menu administrativo.

## Fora de escopo

- Alterar endpoints ou persistir filtros.
- Paginação ou ordenação.

## Histórias e critérios de aceite

### P1: Filtrar por status

Como operador, quero ver e selecionar os totais por status para focar na etapa desejada.

1. WHEN a tela carregar THEN o sistema SHALL mostrar um contador para cada status disponível na tela.
2. WHEN o operador clicar em um contador THEN o sistema SHALL listar somente pedidos daquele status.
3. WHEN o operador clicar novamente no status ativo THEN o sistema SHALL remover o filtro de status.
4. WHEN um pedido mudar de status THEN o sistema SHALL atualizar os contadores e a lista filtrada.
5. WHEN a tela estiver em largura desktop THEN o sistema SHALL mostrar todos os filtros de status em uma única linha.
6. WHEN os filtros forem exibidos THEN cada status SHALL possuir um ícone visual correspondente.

### P1: Localizar pedido

Como operador, quero buscar por nome, ID ou celular para localizar rapidamente um pedido.

1. WHEN o operador digitar parte do nome THEN o sistema SHALL filtrar sem diferenciar maiúsculas ou acentos.
2. WHEN o operador digitar o ID completo ou trecho exibido THEN o sistema SHALL retornar o pedido correspondente.
3. WHEN o operador digitar celular com ou sem máscara THEN o sistema SHALL retornar o pedido correspondente.
4. WHEN busca e status estiverem ativos THEN o sistema SHALL aplicar ambos os filtros.
5. WHEN nenhum pedido corresponder THEN o sistema SHALL mostrar estado vazio.

### P1: Acompanhar operação

Como operador, quero enxergar tempo de espera e itens rapidamente para priorizar o preparo.

1. WHEN um pedido possuir evento de recebimento THEN o sistema SHALL mostrar há quanto tempo ele foi recebido.
2. WHEN a tela permanecer aberta THEN o sistema SHALL atualizar o tempo decorrido a cada minuto.
3. WHEN um pedido possuir vários itens THEN o sistema SHALL mostrá-los lado a lado com quebra responsiva.

### P1: Filtrar por período

Como operador, quero definir datas inicial e final para analisar pedidos de um período específico.

1. WHEN uma data inicial for definida THEN o sistema SHALL mostrar pedidos recebidos nessa data ou depois.
2. WHEN uma data final for definida THEN o sistema SHALL mostrar pedidos recebidos nessa data ou antes.
3. WHEN o período mudar THEN os contadores por status SHALL refletir os pedidos do período.
4. WHEN período, busca e status estiverem ativos THEN o sistema SHALL combinar os filtros.

### P1: Operar em tela cheia

Como operador, quero expandir o painel para usar toda a tela sem distrações do menu.

1. WHEN o operador clicar no botão de expandir THEN o sistema SHALL exibir somente o painel em tela cheia.
2. WHEN o painel estiver em tela cheia THEN o sistema SHALL oferecer botão para sair desse modo.
3. WHEN o operador pressionar Esc THEN o sistema SHALL restaurar o layout administrativo.

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
| ORD-FLT-06 | Filtros em linha única no desktop | Verificado |
| ORD-FLT-07 | Ícone semântico por status | Verificado |
| ORD-FLT-08 | Tempo desde o recebimento | Verificado |
| ORD-FLT-09 | Filtro inclusivo por período | Verificado |
| ORD-FLT-10 | Contadores respeitam período | Verificado |
| ORD-FLT-11 | Itens lado a lado | Verificado |
| ORD-FLT-12 | Painel em tela cheia | Verificado |

## Critério de sucesso

- Operador consegue encontrar e isolar pedidos sem recarregar a página.
- Lint e build do projeto concluem sem erros.
