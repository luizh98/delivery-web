# Botao de voltar do cliente

## Problema

As telas internas do cliente nao usam um controle de retorno consistente. A tela
de produto possui uma seta com estilo local, enquanto o carrinho nao apresenta
o mesmo controle no cabecalho.

## Objetivo

- Padronizar um botao com seta para voltar nas telas internas do cliente.
- Manter o retorno previsivel para o cardapio.

## Fora de escopo

- Area administrativa.
- Tela inicial do cardapio, pois ela e o destino do retorno.
- Alteracoes no fluxo de navegacao do navegador.

## Historia P1

Como cliente, quero encontrar o mesmo botao de voltar nas telas internas para
retornar facilmente ao cardapio.

### Criterios de aceitacao

1. WHEN o cliente visualizar um produto THEN a tela SHALL exibir um botao com
   seta para a esquerda.
2. WHEN o cliente visualizar o carrinho THEN a tela SHALL exibir o mesmo botao
   com seta para a esquerda.
3. WHEN o cliente acionar o botao THEN o sistema SHALL navegar para `/`.
4. WHEN tecnologia assistiva identificar o controle THEN o sistema SHALL
   anunciar "Voltar ao cardapio".
5. WHEN uma tela interna exibir titulo e botao de voltar THEN o sistema SHALL
   alinha-los horizontalmente na mesma linha.

## Rastreabilidade

| ID | Requisito | Status |
| --- | --- | --- |
| BACK-01 | Botao compartilhado com seta | Verificado |
| BACK-02 | Aplicacao em produto e carrinho | Verificado |
| BACK-03 | Navegacao para o cardapio | Verificado |
| BACK-04 | Rotulo acessivel | Verificado |
| BACK-05 | Titulo alinhado com a seta | Verificado |

## Criterio de sucesso

- Produto e carrinho usam o mesmo componente.
- Lint e build concluem sem erros.
