# Validação — resultado dos upsells

Data: 2026-10-14 (America/Sao_Paulo)

## Checks locais

- API: 254 testes aprovados; go vet aprovado. Integrações opt-in de Mongo não executadas, Docker indisponível. Testes da feature cobrem finanças/status/filtros/fuso/legado e autorização admin/tenant/role/datas.
- Web: 62 testes existentes aprovados; TypeScript e ESLint dos arquivos alterados aprovados.
- Build de produção Webpack aprovado, incluindo nova rota /admin/catalog/upsell/results. Build inicial sem rede não baixou Google Fonts; repetição com rede aprovada.
- Detector Impeccable: zero ocorrências.
- Finish reviewer: visual aprovado. P2 de alternativa textual do gráfico corrigido com “Ver valores por dia”, tabela semântica de datas/valores. Expansão por Enter e dados diários aprovados no QA; lint, TypeScript e build final repetidos após correção, aprovados. Leitor de tela real não testado.
- Browser isolado com backend de fixtures (identificado como dados ilustrativos): paginação 10+2, ordenação por unidades/valor, filtro por campanha/datas, ausência de original, vazio, erro/retry, loading sem totais antigos e validação de datas passaram. Sem erro de JavaScript ou overflow da página em 1440×1000 e 390×844.
- Capturas: ../../.impeccable/review/upsell-results/desktop.png e mobile.png. Dados locais de demonstração; nenhum pedido real criado/alterado.

## Publicação

- API staging: 3a77d53 — feat(upsell): add historical sales report. Push e deploy concluídos; container running e health UP. Commit ativo 3a77d53b139c8f747cea9a9144fbf69b75e2c080.
- Smoke autenticado no Mongo da staging: relatório 200, cinco combinações históricas e 287 dias; somas dos itens reconciliadas com resumo e original − desconto = vendido. Filtro de campanha validado. Sem token 401, tenant diferente 403, data inválida 400. Somente leituras; sem criação/alteração de pedidos.
- Web staging: 8383067bec4e082e2d93defa8e300712313614d4 — feat(upsell): show campaign sales results. Push e deploy concluídos; container running. Build remoto padrão também aprovado.
- Browser autenticado na staging: login 200, navegação por Campanhas → Ver resultados, relatório 200 com cinco combinações e 287 datas. Tabela diária acessível expandida, quantidade de linhas conferida; soma da evolução diária reconciliada com valor vendido. Nenhum overflow em 1440×1000 e 390×844; zero erros de JavaScript. Capturas adicionais staging-desktop.png e staging-mobile.png no diretório de evidências.
- URL: https://dev-terraco-canecao.flyfoods.com.br/admin/catalog/upsell/results.
- Ambiente: Easypanel delivery-app-staging; fontes confirmadas origin/staging em API/web, autoDeploy ativo. Main não alterada.

## Limites

## Atualização — filtro de período padronizado

- DateRangeFilter único com CSS/calendário das Análises, usado em Análises ativa/legada, Pedidos/Cozinha, Entregas e Upsells. Select: Hoje, Ontem, Últimos 7 dias, Este mês, Personalizado; aplicação direta, cancelar/Escape, foco restaurado e popup posicionado dentro da tela. Relatórios mantêm limite de 366 dias.
- 64 testes web, TypeScript, lint do novo componente/consumidores, build e detector aprovados. Dois erros de lint preexistentes em effects do LazyAdminDashboard e warning da view legada mantidos. Browser local confirmou presets/calendário/cancelar/Escape/aplicação nas cinco telas, sem overflow. Capturas date-desktop.png/date-mobile.png.
- Staging c5c944a1e528eeca6db04eb7dda38229dfd1607e: deploy done, commit ativo conferido. Browser com login real validou calendário por select e consulta personalizada, relatório 200, cinco combinações e 287 dias reconciliados; navegação e filtro compartilhado funcionando nas outras quatro telas. Sem erros de runtime ou alteração de pedidos.

Sem custo/margem, conversão por exibições, causalidade, exportação ou comparação de períodos. Receita apresentada é valor dos produtos após descontos dos itens, sem adicionais/frete/cupom geral. Histórico sem identidade de campanha não pode ser atribuído; preço original ausente sinalizado, sem reconstrução por catálogo atual.
