# Upsell em carrossel

## Objetivo

Exibir sugestões de upsell do carrinho em um carrossel responsivo, mantendo a seleção e validação das ofertas existentes.

## Requisitos

- **UC-1**: Sugestões aparecem em cartões horizontais com rolagem por toque no mobile e por controles no desktop e mobile.
- **UC-2**: Cartões preservam imagem, nome, preço original, preço da oferta, economia e ação de adicionar.
- **UC-3**: Controles indicam quando não há mais conteúdo em cada direção e são acessíveis por teclado.
- **UC-4**: Layout funciona em larguras mobile e desktop, com pistas visuais de que há mais sugestões.
- **UC-5**: Avisos e fluxo de validação/adicionar oferta mantêm comportamento atual.

## Verificação

- Lint e build passam.
- Inspeção visual em larguras mobile e desktop com várias sugestões.
- Navegação por toque, mouse e teclado; estados inicial, intermediário e final.
