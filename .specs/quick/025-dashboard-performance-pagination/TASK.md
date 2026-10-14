# Quick Task 025: Paginação do desempenho

**Date:** 2026-10-14
**Status:** Implemented

## Description

Paginar o ranking de desempenho de itens e opcionais com 10 registros por página, substituindo a rolagem infinita.

## Steps

1. Usar o endpoint existente com `page` e `size=10`, substituindo os registros a cada página.
2. Adicionar Anterior/Próxima e indicador de página, reiniciando ao trocar tipo ou período.
3. Verificar navegação, carregamento, falhas e cancelamento de respostas antigas.

## Files Changed

- `src/views/AdminDashboard/LazyAdminDashboard.tsx`: paginação do dashboard ativo.
- `src/views/AdminDashboard/styles.ts`: controles responsivos usando o tema existente.
- `src/views/AdminDashboard/pagination.test.mjs`: regressão com requisições controladas.

## Verification

- [x] 10 registros por página para itens e opcionais; última página parcial.
- [x] Limites de navegação, carregamento, erro e tentativa novamente na mesma página.
- [x] Trocar tipo ou período retorna à primeira página; carregar outro relatório preserva a página.
- [x] Respostas antigas são ignoradas após cancelamento.
- [x] `npm test`: 40 testes aprovados.
- [x] `npx tsc --noEmit`: aprovado.
- [x] `npm run build`: aprovado.
- [x] Detector Impeccable: nenhuma ocorrência nos arquivos de UI alterados.
- [x] Lint dos arquivos alterados com a regra preexistente `react-hooks/set-state-in-effect` desabilitada: aprovado.
- [ ] Lint sem exceção: dois erros anteriores em effects do dashboard.
- [ ] Inspeção visual em navegador.
