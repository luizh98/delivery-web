# Relatórios da dashboard sob demanda — Tasks

**Design**: `.specs/features/lazy-dashboard-reports/design.md`
**Status**: Draft — backend source mapped

## Execution Plan

```text
Backend contract tasks (T1–T6) -> frontend types/state (T7–T8) -> UI queue (T9) -> tests (T10) -> remove legacy route (T11)
```

## Task Breakdown

### T1: Implementar endpoint overview

**What**: Criar `GET /admin/dashboard/overview` com summary e série.
**Where**: `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\{server,admin,models}.go`; teste em `internal\app\admin_dashboard_test.go`.
**Depends on**: None.
**Requirement**: LDR-06.
**Tools**: `rg`, testes backend existentes.
**Done when**: Endpoint valida datas/timezone e retorna payload tipado; teste do handler passa.

### T2: Implementar endpoints status e pagamentos [P]

**What**: Criar endpoints explícitos para tempos e meios de pagamento.
**Where**: `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\{server,admin,models}.go`; teste em `internal\app\admin_dashboard_test.go`.
**Depends on**: T1 contract conventions.
**Requirement**: LDR-06.
**Tools**: `rg`, testes backend existentes.
**Done when**: Cada endpoint responde isoladamente e tem teste de sucesso/vazio.

### T3: Implementar endpoint heatmap [P]

**What**: Criar `GET /admin/dashboard/order-heatmap`.
**Where**: `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\{server,admin,models}.go`; teste em `internal\app\admin_dashboard_test.go`.
**Depends on**: T1 contract conventions.
**Requirement**: LDR-06.
**Tools**: `rg`, testes backend existentes.
**Done when**: Retorna células e horários com validação de filtro.

### T4: Implementar endpoint calendário [P]

**What**: Criar `GET /admin/dashboard/monthly-sales`.
**Where**: `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\{server,admin,models}.go`; teste em `internal\app\admin_dashboard_test.go`.
**Depends on**: T1 contract conventions.
**Requirement**: LDR-06.
**Tools**: `rg`, testes backend existentes.
**Done when**: Retorna calendário compatível com componente atual.

### T5: Verificar e corrigir ranking paginado [P]

**What**: Garantir carga inicial e paginação de performance confiáveis.
**Where**: `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\admin_dashboard_test.go` e `C:\projetos-pessoais\delivery-app\delivery-web\src\views\AdminDashboard\index.tsx`.
**Depends on**: T1–T4 para integração final; frontend pode iniciar diagnóstico já.
**Requirement**: LDR-08.
**Tools**: `rg`, `npm test`, testes backend.
**Done when**: Loading inicial termina e observer pode requisitar próxima página; teste cobre regressão reproduzida.

### T6: Remover endpoint dashboard monolítico

**What**: Remover `GET /admin/dashboard` após clientes migrarem.
**Where**: `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\{server,admin,models}.go`; teste em `internal\app\admin_dashboard_test.go`.
**Depends on**: T1–T5 e T10.
**Requirement**: LDR-07.
**Tools**: `rg`, testes backend.
**Done when**: Nenhum cliente/rota usa endpoint removido e suíte backend passa.

### T7: Separar tipos de payload da dashboard

**What**: Substituir tipo monolítico por seis tipos de resposta no frontend.
**Where**: `src/types/api.ts`.
**Depends on**: Contratos T1–T4 confirmados.
**Requirement**: LDR-06.
**Tools**: `rg`, `npm run lint`, `npm run build`.
**Done when**: Tipos correspondem aos seis contratos e não há uso de `AdminDashboardResponse`.

### T8: Implementar estado de filtros pela URL

**What**: Restaurar/sincronizar período, datas, métrica e ranking na URL, cancelando geração antiga.
**Where**: `src/views/AdminDashboard/index.tsx`.
**Depends on**: T7.
**Requirement**: LDR-05.
**Tools**: `rg`, `npm test`, `npm run lint`.
**Done when**: URL válida restaura controles; troca de filtro não aplica resposta obsoleta.

### T9: Implementar fila e estados por bloco

**What**: Carregar seis blocos em ordem visual, máximo dois ativos, sentinel e botão fallback global; isolar loading/empty/error/retry.
**Where**: `src/views/AdminDashboard/index.tsx` e componentes coesos extraídos somente se necessário.
**Depends on**: T7, T8.
**Requirement**: LDR-01, LDR-02, LDR-03, LDR-04.
**Tools**: `rg`, `npm test`, `npm run lint`, `npm run build`.
**Done when**: Cada bloco é independente; botão avança fila; erro/vazio não bloqueiam próximo bloco.

### T10: Cobrir regressões e integração frontend

**What**: Adicionar testes para fila, URL, abort, estados e ranking.
**Where**: Testes próximos de `src/views/AdminDashboard`.
**Depends on**: T5, T8, T9.
**Requirement**: LDR-01, LDR-03, LDR-05, LDR-08.
**Tools**: `npm test`, `npm run lint`, `npm run build`.
**Done when**: Casos de aceitação automatizáveis passam.

### T11: Atualizar rastreabilidade e verificar fim a fim

**What**: Marcar requisitos verificados e executar validação integrada.
**Where**: `.specs/features/lazy-dashboard-reports/{spec,tasks}.md`.
**Depends on**: T6, T10.
**Requirement**: LDR-01 a LDR-08.
**Tools**: `npm test`, `npm run lint`, `npm run build`, testes backend.
**Done when**: Todas IDs estão `Verified` e nenhuma referência ao endpoint legado permanece.
