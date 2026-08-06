# Botão de voltar do cliente

## Problema

As telas internas do cliente precisam usar um controle de retorno consistente.
Produto e carrinho já usam a seta compartilhada, mas o histórico e o
acompanhamento de pedidos ainda não apresentam o mesmo controle.

## Objetivo

- Padronizar um botão com seta para voltar nas telas internas do cliente.
- Manter o retorno previsível para o cardápio.

## Fora de escopo

- Área administrativa.
- Tela inicial do cardápio, pois ela é o destino do retorno.
- Alterações no fluxo de navegação do navegador.

## Historia P1

Como cliente, quero encontrar o mesmo botão de voltar nas telas internas para
retornar facilmente ao cardápio.

### Critérios de aceitacao

1. WHEN o cliente visualizar um produto THEN a tela SHALL exibir um botão com
   seta para a esquerda.
2. WHEN o cliente visualizar o carrinho THEN a tela SHALL exibir o mesmo botão
   com seta para a esquerda.
3. WHEN o cliente acionar o botão THEN o sistema SHALL navegar para `/`.
4. WHEN tecnologia assistiva identificar o controle THEN o sistema SHALL
   anunciar "Voltar ao cardápio".
5. WHEN uma tela interna exibir título e botão de voltar THEN o sistema SHALL
   alinha-los horizontalmente na mesma linha.
6. WHEN o cliente visualizar Meus pedidos ou o acompanhamento de um pedido THEN
   a tela SHALL exibir o botão compartilhado com seta para a esquerda.
7. WHEN Meus pedidos exibir a ação textual de retorno ao cardápio THEN o sistema
   SHALL usar o mesmo padrão visual primário da tela de status do pedido.

## Rastreabilidade

| ID | Requisito | Status |
| --- | --- | --- |
| BACK-01 | Botão compartilhado com seta | Verificado |
| BACK-02 | Aplicação em produto e carrinho | Verificado |
| BACK-03 | Navegação para o cardápio | Verificado |
| BACK-04 | Rótulo acessivel | Verificado |
| BACK-05 | Título alinhado com a seta | Verificado |
| BACK-06 | Aplicação em histórico e acompanhamento de pedidos | Verificado |
| BACK-07 | CTA do histórico igual ao status do pedido | Verificado |

## Critério de sucesso

- Produto, carrinho, histórico e acompanhamento usam o mesmo componente.
- Histórico e acompanhamento usam o mesmo padrão primário no CTA de retorno.
- Lint e build concluem sem erros.
