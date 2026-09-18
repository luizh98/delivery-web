# Relatórios da dashboard sob demanda — Design

**Spec**: `.specs/features/lazy-dashboard-reports/spec.md`
**Status**: Draft — backend source mapped

## Architecture Overview

`AdminDashboardView` passa de estado global `data/loading/error` para estado por bloco. Uma fila ordenada expõe no máximo duas unidades visíveis por vez; cada unidade usa `AbortController`, mantém seu resultado enquanto o componente estiver montado e renderiza loading, vazio, erro/retry ou conteúdo. Mudança de query/filter cancela a geração anterior antes de criar nova fila.

Frontend consumirá, pelo BFF existente, as seis rotas:

| Bloco | Endpoint | Payload atual a preservar |
| --- | --- | --- |
| Overview | `admin/dashboard/overview` | `summary`, `seriesGranularity`, `metricSeries` |
| Tempos | `admin/dashboard/status-times` | `averageStatusTimes` |
| Pagamentos | `admin/dashboard/payment-methods` | `paymentMethods` |
| Ranking | `admin/dashboard/performance` | página de `items`/`options` |
| Heatmap | `admin/dashboard/order-heatmap` | `orderHeatmap`, `heatmapSchedules` |
| Calendário | `admin/dashboard/monthly-sales` | `monthlySales` |

Todas rotas recebem `startDate`, `endDate` e `timezone`; ranking mantém `type`, `page` e `size`.

## Code Reuse Analysis

| Recurso | Local | Uso |
| --- | --- | --- |
| BFF autenticado/tenant | `src/app/api/backend/[...path]/route.ts` | Reusar sem nova route handler. |
| Cliente com sinal abortável | `src/services/api/client.ts` | Reusar para cada bloco. |
| Observer/paginação ranking | `src/views/AdminDashboard/index.tsx` | Corrigir e preservar para ranking. |
| Gráficos existentes | `src/views/AdminDashboard/charts.tsx` | Manter props, trocar origem de dados. |
| Formatação/estilos dashboard | `src/views/AdminDashboard/*` | Preservar componentes e tema. |

## Components and Interfaces

### Dashboard report state

- **Location**: `src/views/AdminDashboard/index.tsx` or módulo coeso extraído após inspeção.
- **Purpose**: Representar geração de filtros e estado independente de cada report.
- **Interface**: `idle | loading | ready | empty | error`, com `retry()` e `AbortController` por request.
- **Dependencies**: `clientApi`, query params e payloads tipados.

### Report queue

- **Location**: `src/views/AdminDashboard/index.tsx`.
- **Purpose**: Carregar próximo bloco somente quando visível ou solicitado no fallback; máximo dois ativos e ordem visual estável.
- **Fallback**: Botão global carrega próxima unidade pendente; não controla páginas internas do ranking.

### URL filter state

- **Location**: `src/views/AdminDashboard/index.tsx`.
- **Purpose**: Ler/escrever período, datas customizadas, métrica e modo de ranking na URL antes de iniciar requests.
- **Invalid data**: Aplicar preset `today` em vez de lançar ou enviar datas incompletas.

## Data Models

Tipos do frontend devem dividir `AdminDashboardResponse` em seis payloads exportados em `src/types/api.ts`, sem alterar formatos de cada gráfico. `AdminDashboardResponse` deve desaparecer após remoção completa de consumidores.

## Error Handling Strategy

| Cenário | Tratamento | Impacto usuário |
| --- | --- | --- |
| Sucesso sem dados | Estado `empty` por bloco | `Sem resultados` naquele card. |
| Erro HTTP/rede | Estado `error` por bloco | `Não foi possível carregar` + retry local. |
| Troca de filtro | Abort e incremento de geração | Nunca mistura dados antigos. |
| Observer indisponível | Fila não autoavança | Botão global permanece utilizável. |
| Ranking inicial travado | Reproduzir e testar antes de corrigir | Paginação volta a liberar observer. |

## Tech Decisions

| Decisão | Escolha | Racional |
| --- | --- | --- |
| Granularidade backend | Seis endpoints explícitos | Falha e entrega independentes. |
| Ordem | Ordem visual, máximo dois visíveis | Previsível, sem rajada API. |
| Cache | Memória do componente | Sem flicker ao voltar viewport; sem payload entre navegações. |
| Compatibilidade | Remover endpoint monolítico | Usuário confirmou ausência de consumidores. |

## Backend Implementation Locations

| Concern | Repository and file |
| --- | --- |
| Route registration | `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\server.go` |
| Dashboard handlers and aggregation helpers | `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\admin.go` |
| JSON response types | `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\models.go` |
| Dashboard unit tests | `C:\projetos-pessoais\delivery-app\delivery-api\internal\app\admin_dashboard_test.go` |

The backend source is available. Endpoint work can proceed after task/tool confirmation.
