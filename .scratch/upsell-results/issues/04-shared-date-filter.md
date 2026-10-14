# Padronizar filtro de período
Type: task
Status: claimed

Pedido: reutilizar select/calendário das Análises e padronizar filtros de datas.

Escopo: extrair DateRangeFilter, cálculos de presets e CSS; adotar em Análises ativa/legada, Pedidos/Cozinha, Entregas e Upsells. Remover duplicações, manter filtragem existente e usar aplicação direta no upsell. Hoje/ontem/7 dias/mês/personalizado. Não alterar campos de agendamento de campanhas ou feriados.

Verificação: testes de datas (virada de ano/mês, ano bissexto, dias inclusivos), suíte web, TypeScript, lint/build e navegador (presets, personalizado, cancelar, Escape, filtro preservado e mobile). Publicar atualização na staging, conforme autorização da feature.

## Checks
64 testes web, TypeScript, lint dos novos arquivos/consumidores exceto dois erros já existentes em effects de LazyAdminDashboard, build e detector aprovados. Browser confirmou selects em Análises/Pedidos/Cozinha/Entregas/Upsells, calendário personalizado, aplicação, cancelamento, Escape com retorno de foco, resets/paginação e mobile sem overflow. Capturas date-desktop.png/date-mobile.png. Nenhuma alteração backend; campos de agendamento preservados. Publicação pendente.
