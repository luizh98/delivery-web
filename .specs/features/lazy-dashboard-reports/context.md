# Context — Relatórios da dashboard sob demanda

## Decisões do Grill

- Carregamento automático por scroll via sentinela; botão central `Carregar mais relatórios` é fallback.
- Ao trocar filtro, limpar lista, abortar requests e reiniciar no topo.
- Tratar sucesso vazio como `Sem resultados`; falha como `Não foi possível carregar` com retry.
- Carregar blocos visíveis em paralelo, máximo dois, respeitando ordem visual.
- Seis unidades: overview (indicadores + gráfico), tempos por status, pagamentos, ranking, heatmap e calendário mensal.
- Falha/vazio nunca bloqueia próxima unidade; retry é local ao card.
- Ranking preserva auto-scroll e não compartilha botão global.
- Dados já obtidos ficam em memória enquanto componente estiver montado; não refetch ao voltar viewport.
- URL preserva período, datas customizadas, métrica e modo do ranking; timezone continua detectado no browser.
- Criar contratos explícitos: `/overview`, `/status-times`, `/payment-methods`, `/performance`, `/order-heatmap`, `/monthly-sales`, sob `/admin/dashboard/`.
- Remover endpoint antigo `GET /admin/dashboard` após migração; usuário afirmou não haver consumidores.
- Validar e corrigir, se reproduzir, travamento de loading inicial do ranking que impede observer.

## Fatos verificados

- `AdminDashboardView` está em `src/views/AdminDashboard/index.tsx`.
- BFF é catch-all em `src/app/api/backend/[...path]/route.ts`; não há proxy específico de dashboard para apagar no frontend.
- Backend Go: `C:\projetos-pessoais\delivery-app\delivery-api`.
- Rotas atuais ficam em `delivery-api/internal/app/server.go`; handlers e agregações em `delivery-api/internal/app/admin.go`; contratos em `delivery-api/internal/app/models.go`; testes em `delivery-api/internal/app/admin_dashboard_test.go`.
- `GET /api/admin/dashboard` é monolítico e `GET /api/admin/dashboard/performance` já é paginado. A feature cria cinco rotas novas, preserva performance e remove a rota monolítica.
