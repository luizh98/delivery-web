# Padronizar filtro de período
Type: task
Status: resolved

Pedido: reutilizar select/calendário das Análises e padronizar filtros de datas.

Escopo: extrair DateRangeFilter, cálculos de presets e CSS; adotar em Análises ativa/legada, Pedidos/Cozinha, Entregas e Upsells. Remover duplicações, manter filtragem existente e usar aplicação direta no upsell. Hoje/ontem/7 dias/mês/personalizado. Não alterar campos de agendamento de campanhas ou feriados.

Verificação: testes de datas (virada de ano/mês, ano bissexto, dias inclusivos), suíte web, TypeScript, lint/build e navegador (presets, personalizado, cancelar, Escape, filtro preservado e mobile). Publicar atualização na staging, conforme autorização da feature.

## Checks
64 testes web, TypeScript, lint dos novos arquivos/consumidores exceto dois erros já existentes em effects de LazyAdminDashboard, build e detector aprovados. Browser confirmou selects em Análises/Pedidos/Cozinha/Entregas/Upsells, calendário personalizado, aplicação, cancelamento, Escape com retorno de foco, resets/paginação e mobile sem overflow. Capturas date-desktop.png/date-mobile.png. Nenhuma alteração backend; campos de agendamento preservados. Publicação pendente.

## Answer
Commit c5c944a1e528eeca6db04eb7dda38229dfd1607e publicado na staging; deploy done e commit ativo conferido. Smoke com login real confirmou select/calendário nas cinco telas e consulta personalizada 01/01/2026–14/10/2026 no relatório (200, cinco combinações, 287 datas, totais reconciliados). Desktop/mobile sem overflow; zero erros de JavaScript. Nenhum pedido alterado. Seletor de cancelamento do QA foi restringido ao dialog após detectar ambiguidade com ações dos pedidos; nenhuma delas foi acionada.
