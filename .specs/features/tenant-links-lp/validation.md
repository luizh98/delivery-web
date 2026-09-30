# Validação da LP de links — 2026-09-30

**Branch:** `feat/tenant-links-lp`. **Estado:** implementação técnica pronta para revisão; publicação bloqueada por conteúdo real e gates de backend. Nenhum deploy foi feito.

## Evidência

| Gate | Resultado |
| --- | --- |
| `npm test` | 22/22 testes passam, inclusive schema, isolamento de dois tenants, imagens e UTMs. |
| `npm run build` | Passa com duas fixtures temporárias e, após removê-las, passa novamente sem tenant real; inventário mantém 37 rotas anteriores e adiciona `/links`. |
| Smoke T01/T11 | `/`, `/cart`, `/cart/address`, `/admin/login`, produto e BFF mantêm os status registrados em `demo.localhost` e `segundo.localhost`. `/` ainda renderiza `HomeView`. |
| Smoke da LP | `lp-test-a.localhost` e `lp-test-b.localhost` recebem conteúdo próprio; `X-Tenant-Slug` forjado não troca página; host sem pasta e host raiz recebem 404; CTA leva a `/` e mantém apenas UTMs aceitas. |
| HTML/metadados | Marca, texto, hero, links opcionais, título, descrição e imagem social por tenant conferidos. Links externos usam `noopener noreferrer`. |
| Rede | Três relatórios Lighthouse: 13 recursos, 0 chamadas `/api/`, 0 recursos externos por execução. Código da LP não tem Client Component próprio; layout não importa providers do produto. |
| Cache | Imagem `.v1.webp`: `Cache-Control: public, max-age=31536000, immutable`; `config.json`: `max-age=0`; `/links`: `private, no-cache, no-store`. |
| CSS/UI | Capturas `landing-mobile.png` (390×844) e `landing-desktop.png` (1440×900), geradas com fixture. |
| Lint | Arquivos novos da LP sem erros. Lint geral falha em três regras preexistentes de `react-hooks/set-state-in-effect` em `AdminDashboard` e `AdminPrinter`; aviso anterior de variável não usada no dashboard. |

## Lighthouse mobile — fixture local

Chrome headless, Lighthouse 13.5.0, build de produção, perfil mobile com throttling `simulate`, URL `http://lp-test-a.localhost:3102/links`, três execuções comparáveis.

| Execução | Performance | LCP | CLS | TTFB | Transferência |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 1660 ms | 0 | 11 ms | 159779 B |
| 2 | 99 | 1661 ms | 0 | 12 ms | 159779 B |
| 3 | 100 | 1663 ms | 0 | 10 ms | 159779 B |
| **Mediana** | **99** | **1661 ms** | **0** | **11 ms** | **159779 B** |

Relatórios completos: `lighthouse-1.json`, `lighthouse-2.json`, `lighthouse-3.json`. A fixture tem hero mobile de 1252 B com cor sólida. Repetir as três medições com imagens finais; números acima não representam campanha real. Metas de campo p75 para LCP, INP e CLS aguardam tráfego suficiente.

## Pendências para concluir gates

1. Conteúdo aprovado do primeiro tenant: slug, textos, logo, hero mobile/desktop, mapa, WhatsApp e links. T09 depende desses dados; não há pasta real versionada.
2. Backend local respondeu 503 durante baseline e regressão. `/products/1` respondeu 404; por isso não foi possível adicionar produto e avançar com carrinho real até checkout. T01/T11 continuam parciais. O primeiro smoke anterior à migração usou URL por IP com header `Host`; Next recebeu `127.0.0.1`. O script foi corrigido para URLs `*.localhost` diretas no teste posterior. Não reivindicar isolamento por host no baseline anterior.
3. Reexecutar smoke completo, Lighthouse mobile e revisão visual com conteúdo final. Lint geral precisa de correção nos módulos existentes ou exceção explícita do gate antes de publicar.
4. Verificar cache/CDN na hospedagem real após autorização de publicação. Aqui foram verificados headers do Next local. Sem dados de produção, TTFB real e metas p75 permanecem desconhecidos.
