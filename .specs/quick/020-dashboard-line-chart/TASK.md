# Quick Task 020: Alterar gráfico da dashboard para linhas

**Date:** 2026-08-25
**Status:** Done

## Description

Substituir o gráfico principal em barras da dashboard de faturamento por um gráfico em linhas.

## Files Changed

- `src/views/AdminDashboard/charts.tsx` — renderiza a série do indicador como linha SVG com pontos, valores e rótulos.
- `src/views/AdminDashboard/styles.ts` — substitui estilos das barras pelos elementos visuais do gráfico em linhas.

## Verification

- [x] Exibir os indicadores selecionados como gráfico em linhas.
- [x] Preservar valores, rótulos, acessibilidade e rolagem horizontal.
- [x] Executar lint e build do frontend.

## Commit

`feat(admin): change dashboard chart to line`
