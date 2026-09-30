# LP de links por tenant — tarefas

**Design:** `.specs/features/tenant-links-lp/design.md`  
**Status:** T02–T08 e T10 verificados com fixtures; T01, T09, T11 e T12 pendentes de gates reais; T13 documentado.  
**Regra:** implementar em branch própria, em commits pequenos; parar antes de publicar se qualquer gate falhar. Publicação depende de autorização explícita.

## Andamento em 2026-09-30

| Tarefa | Estado | Evidência ou pendência |
| --- | --- | --- |
| T01 | Parcial | Inventário e smoke antes da migração; backend 503 impediu produto e checkout real. |
| T02 | Verificada | Build e inventário de 37 rotas antigas passaram após migração. Lint geral tem erros anteriores fora da LP. |
| T03–T05 | Verificadas | Schema, loader, validador e testes de pasta inválida passaram. |
| T06–T08 | Verificadas com fixtures | Duas LPs, 404, CTA, opcionais, metadata e UTMs passaram no build de produção. |
| T09 | Pendente | Slug, textos e imagens finais do primeiro cliente não fornecidos. |
| T10 | Verificada com fixture | Lighthouse registra 0 chamadas de API e 0 recursos externos na LP. |
| T11 | Parcial | Smoke de rotas passou; backend 503 impediu fluxo de compra. |
| T12 | Parcial | Lighthouse mobile com fixture: mediana 99; cache verificado. Repetir com imagens finais. |
| T13 | Documentada | Guia de onboarding e AGENTS.md atualizados; validar primeiro tenant real após T09. |

## Sequência

`T01 → T02 → T03 → (T04 e T05) → T06 → T07 → T08 → T09 → T10 → T11 → T12 → T13`

T04 e T05 são independentes entre si após T03. T06 exige T05; T07 exige T04 e T06. Não usar agentes paralelos sem pedido explícito do usuário.

## T01 — Registrar baseline de rotas e fluxo

**Entrega:** inventário verificável das rotas atuais e smoke test de cardápio/checkout antes da migração.  
**Onde:** `scripts/smoke-existing-routes.mjs` e relatório de baseline junto desta feature.  
**Depende de:** nenhuma. **Requisitos:** LP-02, LP-07.  
**Commit previsto:** `test(routes): capture menu baseline`.

**Concluído quando:** URLs de `/`, produto, carrinho, checkout, login/admin e `/api/backend/**` têm resultado registrado para `demo.localhost` e segundo host de tenant; chamada de menu e fluxo de pedido até checkout foram observados sem criar pedido real.

**Verificar:** executar smoke contra servidor local e guardar resultado antes da mudança. O script deve falhar para URL ausente ou conteúdo inesperado.

## T02 — Separar layouts sem alterar URLs

**Entrega:** mover páginas existentes e layout atual para `src/app/(product)/`, criar `src/app/(landing)/layout.tsx` mínimo, manter `src/app/api/**` onde está e retirar o layout raiz antigo.  
**Onde:** `src/app/`, principalmente layouts e arquivos de rota.  
**Depende de:** T01. **Requisitos:** LP-02, LP-06, LP-07.  
**Commit previsto:** `refactor(routes): isolate landing layout`.

**Concluído quando:** build passa; inventário de URLs coincide com T01; `/` continua `HomeView`; metadados, CSS, providers e sessão do produto continuam no layout `(product)`; `(landing)` não importa providers nem funções de API.

**Verificar:** `rtk npm run lint`, `rtk npm run build`, smoke T01 e inspeção da árvore de layouts. Conferir especificamente que não há conflito de rota entre grupos e que `src/app/api/**` segue acessível.

## T03 — Definir contrato e schema da LP

**Entrega:** tipo `LandingConfig` e schema Zod para `config.json`.  
**Onde:** `src/landing/config/schema.ts`.  
**Depende de:** T02. **Requisitos:** LP-03, LP-04, LP-05.  
**Commit previsto:** `feat(landing): define tenant config schema`.

**Concluído quando:** campos obrigatórios/opcionais do desenho estão tipados; slug tem formato permitido; URLs externas aceitam só HTTPS; nomes de imagens só podem ser arquivos locais da pasta; cores, textos e máximo de links extras são validados.

**Verificar:** `rtk npm test` com casos válidos, campos ausentes, `../`, URL insegura, slug divergente e excesso de links. Resultado esperado: válidos aceitos; inválidos rejeitados com erro legível.

## T04 — Carregar configuração pelo host

**Entrega:** loader server-only que resolve host, localiza pasta do tenant e lê configuração sem registro manual.  
**Onde:** `src/landing/config/load.ts`.  
**Depende de:** T03. **Requisitos:** LP-01, LP-03, LP-04.  
**Commit previsto:** `feat(landing): load config by tenant host`.

**Concluído quando:** `tenant.localhost` usa pasta `tenant`; `X-Tenant-Slug` do cliente não altera seleção; domínio raiz/slug ausente retornam `null`; caminho fica contido em `public/landing-pages/<slug>`; cache de produção é limitado aos tenants publicados, com releitura no desenvolvimento.

**Verificar:** `rtk npm test` com dois tenants, host inexistente, host raiz e header forjado. Resultado esperado: nenhum vazamento entre tenants; ausente retorna `null`.

## T05 — Validar todas as pastas no build

**Entrega:** script TypeScript que percorre `public/landing-pages/*/config.json`, aplica o mesmo schema e confere imagens referenciadas; integrar ao script `build` com `tsx` como dependência de desenvolvimento fixada.  
**Onde:** `scripts/validate-landing-pages.ts`, `package.json` e lockfile.  
**Depende de:** T03. **Requisitos:** LP-03, LP-04, LP-06.  
**Commit previsto:** `build(landing): validate tenant assets`.

**Concluído quando:** pasta válida passa; config malformada, slug divergente, imagem ausente ou formato/tamanho acima do orçamento fazem o build falhar com slug e causa. Nenhuma pasta não configurada exige registro manual.

**Verificar:** `rtk npm run build` com configuração válida; testes de fixture inválida devem retornar código diferente de zero. Confirmar que Docker mantém as pastas, pois já copia `public/`.

## T06 — Criar apresentação compartilhada

**Entrega:** visual responsivo da LP como Server Component, com links HTML e imagens locais otimizadas, sem `"use client"`.  
**Onde:** `src/landing/LandingPage.tsx` e estilos locais.  
**Depende de:** T03, T05. **Requisitos:** LP-01, LP-05, LP-06.  
**Commit previsto:** `feat(landing): add lightweight page template`.

**Concluído quando:** cardápio aparece em primeiro lugar com `href="/"`; mapa, WhatsApp, divulgação do sistema e até 3 links extras aparecem só quando configurados; imagens têm dimensões e alt; hero mobile é priorizado; não há embed, carrossel, import de menu ou script de terceiros.

**Verificar:** `rtk npm test`, render de fixture mínimo/completo e inspeção do HTML: destinos corretos, ausência de botões vazios e de JavaScript específico da LP.

## T07 — Expor `/links` e 404 seguro

**Entrega:** rota que carrega o tenant e renderiza o template; sem pasta válida chama `notFound()`.  
**Onde:** `src/app/(landing)/links/page.tsx`.  
**Depende de:** T04, T06. **Requisitos:** LP-01, LP-04, LP-05.  
**Commit previsto:** `feat(landing): serve tenant links route`.

**Concluído quando:** dois hosts retornam conteúdo diferente em `/links`; host sem pasta retorna 404; `/` permanece cardápio; botão principal abre `/` no mesmo host.

**Verificar:** `rtk npm run build` e smoke HTTP dos dois tenants, host sem pasta e acesso direto a `/`.

## T08 — Metadados e UTMs

**Entrega:** metadata própria por tenant e preservação somente de `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` e `utm_term` no CTA de cardápio.  
**Onde:** `src/app/(landing)/links/page.tsx` ou módulo auxiliar de URL, se necessário.  
**Depende de:** T07. **Requisitos:** LP-08.  
**Commit previsto:** `feat(landing): add tenant metadata and utm links`.

**Concluído quando:** dois hosts têm título/descrição/imagem social corretos; `href` do cardápio preserva apenas UTMs aceitas, codificadas; nenhum parâmetro muda o host ou destino interno.

**Verificar:** `rtk npm test` e inspeção de HTML com URLs de teste contendo UTM e parâmetro estranho.

## T09 — Adicionar primeira pasta real

**Entrega:** `public/landing-pages/<slug-real>/config.json` e imagens finais fornecidas pelo cliente/equipe.  
**Onde:** pasta com nome exato do tenant.  
**Depende de:** T05, T07. **Requisitos:** LP-03, LP-05, LP-06.  
**Commit previsto:** `content(landing): add <slug-real> page`.

**Concluído quando:** textos, marca, mapa, contato e link de divulgação estão corretos; nenhuma URL de exemplo permanece; hero mobile <= 150 KB e imagens iniciais somadas <= 250 KB; validador e build passam.

**Verificar:** `rtk npm run build`, revisão visual mobile/desktop e cliques em todos os destinos. **Dependência externa:** conteúdo real do primeiro tenant deve estar disponível na execução; não inventar conteúdo.

## T10 — Provar ausência de trabalho do produto na LP

**Entrega:** verificação automatizada ou reproduzível de rede e bundle para `/links`.  
**Onde:** script de smoke/relatório desta feature.  
**Depende de:** T07, T09. **Requisitos:** LP-06.  
**Commit previsto:** `test(landing): enforce lean page loading`.

**Concluído quando:** carregamento direto de `/links` não pede `/api/customer/me`, `/api/public/menu` ou `/api/public/restaurant/config`; não monta providers do produto; CSS/JS da home/admin não são enviados como código específico da LP.

**Verificar:** executar build de produção com DevTools/automação de rede, guardar HAR ou relatório de requisições e comparar chunks. Falha se alguma das chamadas proibidas ocorrer.

## T11 — Testar regressões do produto

**Entrega:** rodar baseline T01 após a migração e registrar diferenças.  
**Onde:** relatório de validação da feature; ajustes ficam em commits corretivos separados se necessários.  
**Depende de:** T08, T10. **Requisitos:** LP-02, LP-07.  
**Commit previsto:** `test(landing): verify menu regression gate`.

**Concluído quando:** todas as rotas antigas passam; `/` direto e `/links` → `/` mostram mesmo cardápio; produto → carrinho → checkout funciona em dois tenants; admin e BFF funcionam; nenhum fluxo de pedido é alterado. Falha bloqueia publicação.

**Verificar:** `rtk npm test`, `rtk npm run lint`, `rtk npm run build`, `rtk git diff --check` e smoke T01 no build de produção.

## T12 — Medir performance e configurar cache de imagens

**Entrega:** relatório de performance mobile e política de cache para imagens versionadas no ambiente real.  
**Onde:** configuração de headers/CDN aplicável e `.specs/features/tenant-links-lp/validation.md`.  
**Depende de:** T10, T11. **Requisitos:** LP-06.  
**Commit previsto:** `perf(landing): validate mobile loading`.

**Concluído quando:** Lighthouse mobile tem mediana >= 90 em 3 medições comparáveis no build de produção; tamanhos de imagens atendem orçamento; headers de cache de imagens foram verificados; LCP/CLS/TTFB e recursos carregados estão registrados. Metas de campo p75 ficam pendentes até haver tráfego suficiente.

**Verificar:** executar auditoria mobile 3 vezes com mesmo perfil, guardar relatórios; testar resposta HTTP de imagens e de `/links` para garantir cache por host correto. Se gate falhar, otimizar e repetir apenas a medição afetada.

## T13 — Documentar inclusão de novo cliente

**Entrega:** instrução curta para criar pasta por slug, preencher config, preparar imagens, validar e publicar; atualizar `AGENTS.md` que ainda diz não criar LP no MVP.  
**Onde:** `README.md` ou `docs/` e `AGENTS.md`.  
**Depende de:** T12. **Requisitos:** LP-03, LP-04.  
**Commit previsto:** `docs(landing): explain tenant onboarding`.

**Concluído quando:** outra pessoa consegue adicionar tenant só criando sua pasta, rodando validação/build e implantando; documentação explica que `/` é cardápio, `/links` é opcional e config é pública.

**Verificar:** seguir instruções com fixture de segundo tenant; `rtk npm run build` passa e `/links` desse tenant aparece sem alterar registro central.

## Gate final de execução futura

- [ ] Requisitos LP-01 a LP-08 verificados e anotados em `validation.md`.
- [ ] Nenhuma alteração de URL ou comportamento do cardápio/checkout/admin.
- [ ] LP mobile rápida pelos critérios da spec, sem chamadas à API do produto.
- [ ] Primeiro tenant contém conteúdo real e aprovado pela equipe.
- [ ] Sem deploy até revisão do resultado e autorização de publicação na sessão de execução.
