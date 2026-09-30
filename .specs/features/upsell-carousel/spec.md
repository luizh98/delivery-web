# Upsell em carrossel

## Objetivo

Exibir sugestões de upsell do carrinho em um carrossel responsivo, mantendo a seleção e validação das ofertas existentes.

## Requisitos

- **UC-1**: Sugestões aparecem em cartões compactos com rolagem horizontal nativa, sem botões de passagem.
- **UC-2**: Cartões preservam imagem, preço original, preço da oferta e economia; nomes longos ficam em até duas linhas com reticências e preços alinhados na base.
- **UC-3**: Um botão `+` no canto inferior direito da foto mantém o fluxo de adicionar ou selecionar adicionais, com nome acessível e alvo de toque adequado.
- **UC-4**: Layout funciona em larguras mobile e desktop, com pistas visuais de que há mais sugestões.
- **UC-5**: Avisos de atualização ou indisponibilidade desaparecem após seis segundos; fluxo de validação/adicionar oferta mantém comportamento atual.

## Verificação

- Lint dos arquivos alterados e build passam.
- Inspeção visual em larguras mobile e desktop com várias sugestões.
- Rolagem por toque, mouse e teclado; botão `+` nas ofertas com e sem adicionais.
