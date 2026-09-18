# Relatórios da dashboard sob demanda — Specification

## Repositories in Scope

| Repository | Absolute path | Responsibility |
| --- | --- | --- |
| `delivery-web` | `C:\projetos-pessoais\delivery-app\delivery-web` | UI, URL state, queue, BFF client and frontend tests. |
| `delivery-api` | `C:\projetos-pessoais\delivery-app\delivery-api` | Go dashboard handlers, contracts, route registration and backend tests. |

## Problem Statement

A dashboard administrativa busca quase todos os relatórios em uma única chamada, mesmo quando o administrador ainda não chegou às seções inferiores. Isso atrasa a primeira renderização, acopla falhas e impede que cada relatório se recupere sozinho.

## Goals

- [ ] Carregar cada bloco de relatório sob demanda, na ordem visual, com até dois carregamentos visíveis em paralelo.
- [ ] Isolar estado de carregamento, vazio, falha e retry por bloco.
- [ ] Preservar filtros reproduzíveis na URL e eliminar a resposta monolítica antiga.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Alterar fórmulas ou agregações dos relatórios | Somente estratégia de entrega muda. |
| Persistir payloads entre navegações | Evitar dados analíticos desatualizados. |
| Alterar paginação interna do ranking além de corrigir falha confirmada | Ranking continua endpoint/paginação próprios. |

---

## User Stories

### P1: Carregamento progressivo de relatórios

**User Story**: Como administrador, quero que relatórios carreguem ao alcançá-los na rolagem para que a tela inicial fique utilizável rapidamente.

**Why P1**: É objetivo principal da feature.

**Acceptance Criteria**:

1. WHEN a tela abrir THEN system SHALL carregar os blocos visíveis em ordem visual, com no máximo dois requests simultâneos.
2. WHEN o usuário se aproximar do próximo bloco pendente THEN system SHALL buscar esse bloco sem buscar blocos posteriores fora de ordem.
3. WHEN houver blocos pendentes THEN system SHALL mostrar botão central `Carregar mais relatórios` como fallback para próxima unidade da fila.
4. WHEN todos os seis blocos forem carregados THEN system SHALL remover o botão global de fallback.

**Independent Test**: Abrir Analytics, observar apenas blocos visíveis carregarem e avançar a fila por scroll e botão.

---

### P1: Estados isolados e recuperação

**User Story**: Como administrador, quero entender quando um relatório está vazio ou indisponível e recuperá-lo sem perder os demais.

**Why P1**: Uma falha parcial não pode inutilizar dashboard.

**Acceptance Criteria**:

1. WHEN endpoint retornar sucesso sem dados THEN system SHALL mostrar estado `Sem resultados` naquele bloco.
2. WHEN endpoint falhar THEN system SHALL mostrar `Não foi possível carregar` e botão de retry somente naquele bloco.
3. WHEN retry for acionado THEN system SHALL recarregar apenas bloco falho e manter outros blocos intactos.
4. WHEN bloco falhar ou estiver vazio THEN system SHALL manter fila global apta a carregar blocos seguintes.

**Independent Test**: Simular resposta vazia e falha por endpoint; verificar mensagens e retry isolados.

---

### P1: Filtros e estado navegável

**User Story**: Como administrador, quero compartilhar ou retomar mesma análise usando URL para não perder contexto.

**Why P1**: Filtros definem conteúdo de todos relatórios.

**Acceptance Criteria**:

1. WHEN período, intervalo customizado, métrica ou modo do ranking mudar THEN system SHALL atualizar query params correspondentes.
2. WHEN filtro mudar THEN system SHALL abortar requests pendentes, limpar dados antigos e reiniciar fila do topo.
3. WHEN URL com filtros válidos abrir THEN system SHALL restaurar controles antes de iniciar carregamentos.
4. WHEN administrador navegar para fora e voltar THEN system SHALL restaurar filtros pela URL e reiniciar carga sob demanda, sem persistir payloads.

**Independent Test**: Alterar controles, recarregar URL e verificar mesmos filtros; trocar período durante request e confirmar que resposta antiga não aparece.

---

### P1: Contratos de relatório independentes

**User Story**: Como sistema, quero endpoints explícitos por relatório para que cargas e falhas sejam independentes.

**Why P1**: Frontend não consegue carregar blocos separadamente com contrato monolítico.

**Acceptance Criteria**:

1. WHEN frontend buscar overview, status, pagamentos, heatmap ou calendário THEN system SHALL usar endpoint dedicado sob `/admin/dashboard/` com `startDate`, `endDate` e `timezone`.
2. WHEN frontend buscar ranking THEN system SHALL manter `/admin/dashboard/performance` e sua paginação interna.
3. WHEN migração concluir THEN system SHALL remover `GET /admin/dashboard` e nenhum cliente do `delivery-web` deverá chamá-lo.
4. WHEN ranking inicial carregar THEN system SHALL liberar observer/paginação subsequente; se falha atual for reproduzida, system SHALL corrigi-la com teste.

**Independent Test**: Inspecionar requests e confirmar seis rotas; build/testes passam sem referência ao endpoint removido.

---

## Edge Cases

- WHEN request obsoleto concluir após troca de filtro THEN system SHALL descartá-lo.
- WHEN `IntersectionObserver` não estiver disponível THEN botão global SHALL permitir avanço da fila.
- WHEN ranking tiver mais páginas THEN system SHALL continuar sua paginação automática sem reutilizar botão global.
- WHEN datas URL forem inválidas ou incompletas THEN system SHALL usar período padrão seguro.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- |
| LDR-01 | Carga progressiva | Design | In Design |
| LDR-02 | Fallback e ordem | Design | In Design |
| LDR-03 | Estados isolados | Design | In Design |
| LDR-04 | Retry isolado | Design | In Design |
| LDR-05 | Filtros URL e cancelamento | Design | In Design |
| LDR-06 | Endpoints separados | Design | In Design |
| LDR-07 | Remoção endpoint monolítico | Design | In Design |
| LDR-08 | Ranking paginado confiável | Design | In Design |

## Success Criteria

- [ ] Analytics chega ao primeiro relatório sem esperar dados dos blocos inferiores.
- [ ] Uma falha isolada não bloqueia outros relatórios.
- [ ] URL restaura seleção de análise e não mostra dados de filtro antigo.
