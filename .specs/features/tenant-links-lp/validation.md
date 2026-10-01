# Validação da LP de links — 2026-09-30

**Branch:** `feat/tenant-links-lp`. **Estado atual:** o Terraço usa seu HTML original em `/links` por pedido posterior do usuário. As tabelas e capturas abaixo registram a versão anterior do template e não descrevem a LP ativa.

## Revisão do HTML original

- `src/proxy.ts` serve `public/landing-pages/terraco-canecao/index.html` no host do Terraço. Os demais tenants continuam no template compartilhado.
- Diferenças em relação ao arquivo recebido: URLs de favicon, imagem social e duas imagens apontam para arquivos versionados; o cardápio aponta para `/` no mesmo host. CSS, conteúdo, animações, cálculo de horário, combos, fontes e Pixel foram mantidos.
- Smoke local e público: `/links` retorna o HTML estático idêntico ao arquivo versionado (normalizando apenas CRLF/LF); logo, foto e `/` retornam 200. O botão de pedido no DOM da staging aponta para `/?utm_source=qa&utm_medium=link_bio&utm_campaign=staging`. Build, 24 testes e lint direcionado passaram na base atual da staging.
- Staging: `https://dev-terraco-canecao.flyfoods.com.br/links`, commit `ef795a1`; deploy EasyPanel `cmuomo2ex005t07pg91qkd3sg` concluído em 2026-09-30. Captura visual: `terraco-html-staging-mobile.png`.
- Lighthouse mobile da versão HTML original, build de produção local (3 execuções comparáveis): Performance **77, 79, 78; mediana 78**. LCP **3917, 3789, 3798 ms; mediana 3798 ms**. CLS **0,0054, 0,0064, 0,0044**. TTFB **8, 7, 7 ms**. Transferência mediana **383391 B**.
- Rede por execução: **11 recursos, 0 chamadas `/api/`, 7 recursos externos** de Google Fonts e Meta/Facebook. Os relatórios são `terraco-html-lighthouse-{1,2,3}.json`. A meta original de Performance >= 90 não é atingida por esta versão; o usuário priorizou fidelidade ao HTML para o teste em staging.

## Histórico: template compartilhado anterior

## Requisitos e regressão

| Gate | Resultado |
| --- | --- |
| LP-01, LP-03–LP-05, LP-08 | `/links` do Terraço retorna 200 com marca, texto, endereço, imagem, links, metadata e CTA com somente UTMs aceitas; host sem pasta retorna 404. Duas fixtures comprovam isolamento e header forjado ineficaz. Build valida pasta e imagens. |
| LP-02, LP-07 | `/` segue `HomeView`/cardápio. Inventário das 37 rotas antigas preservado; smoke de `/`, produto, carrinho, endereço de checkout, admin e BFF em `demo.localhost` e `segundo.localhost` reproduz baseline. Produto `1` retorna 404 e BFF 503 sem backend local; adicionar produto e concluir checkout continua sem validação. |
| LP-06 | Template Server Component sem JavaScript próprio da LP, provider de produto, consulta à API ou recurso externo. Três relatórios reais registram 13 recursos por execução, 0 `/api/`, 0 terceiros. O runtime Next carrega 8 scripts. |
| Testes | `npm test`: 22/22; `npm run build`: passa, `OK terraco-canecao`; lint direcionado da LP e scripts novos: passa; `git diff --check`: passa. |
| Lint geral | Falha em 3 erros anteriores de `react-hooks/set-state-in-effect` em `AdminDashboard` e `AdminPrinter`, mais 1 aviso anterior. Não atribuídos à LP; gate geral ainda aberto. |
| Cache local | `/links`: `private, no-cache, no-store, max-age=0, must-revalidate`; logo versionado: `public, max-age=31536000, immutable`; `config.json`: `public, max-age=0`. CDN/hospedagem real ainda não verificada. |

## Conteúdo do primeiro tenant

Fonte: `inbox/terraco-site/index.html`, `logo.webp` e `batata-costela.webp`, fornecidos pelo usuário. Slug `terraco-canecao` confirmado pelo destino do cardápio no HTML. Configuração em `public/landing-pages/terraco-canecao/config.json`; arquivos versionados preservam as imagens originais. Logo: 15.950 B, 180×180. Hero: 52.262 B, 320×320. Soma inicial: **68.212 B**; abaixo do orçamento de 250 KB. O hero original de 320 px é exibido até 420 px no desktop; uma imagem maior poderá melhorar nitidez depois.

O template compartilhado usa título, frase do Ancho, endereço, CTA, mapa, WhatsApp, Instagram, reserva e eventos do material enviado. A URL de divulgação do FlyFoods não foi fornecida como link, então `systemUrl` foi omitido. O limite de três links extras deixou o link de avaliação Google de fora. Seções de combo, horário dinâmico, Pixel e scripts do HTML de origem não entram na LP conforme spec e escolha do usuário. Conteúdo ainda requer revisão final da equipe antes de publicar.

Capturas finais: `terraco-mobile.png` (390×844) e `terraco-desktop.png` (1440×900). Smoke reproduzível: `SMOKE_TENANT_SLUG=terraco-canecao node scripts/smoke-tenant-landing.mjs`, com `SMOKE_ORIGIN` apontando ao servidor de produção local. Confere conteúdo, destinos no HTML, CTA, metadata, cache, `/` e 404.

## Lighthouse mobile — tenant real

Chrome headless, Lighthouse 13.5.0, build de produção local, perfil mobile com throttling `simulate`, URL `http://terraco-canecao.localhost:3104/links`, três execuções comparáveis após a revisão visual final.

| Execução | Performance | LCP | CLS | TTFB | Transferência |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 98 | 2469 ms | 0 | 15 ms | 227369 B |
| 2 | 98 | 2441 ms | 0 | 13 ms | 227369 B |
| 3 | 98 | 2459 ms | 0 | 14 ms | 227369 B |
| **Mediana** | **98** | **2459 ms** | **0** | **14 ms** | **227369 B** |

Relatórios: `terraco-lighthouse-1.json`, `terraco-lighthouse-2.json`, `terraco-lighthouse-3.json`. Auditoria de rede: `node scripts/audit-landing-network.mjs <relatórios>`. Os três relatórios anteriores `lighthouse-{1,2,3}.json` usam fixture com hero de cor sólida; mediana 99 e não representam conteúdo real. Metas de campo p75 para LCP, INP e CLS aguardam tráfego suficiente.

## Gates antes de publicação

1. Revalidar produto → carrinho → checkout em dois tenants quando o backend estiver disponível; comparar entrada direta em `/` com entrada via `/links`.
2. Resolver os 3 erros anteriores do lint geral ou aprovar exceção explícita do gate pela equipe.
3. Revisar conteúdo e destinos finais do Terraço com a equipe, inclusive se haverá link de divulgação do FlyFoods e avaliação Google dentro do limite de extras.
4. Verificar cache/CDN e métricas reais após autorização de publicação. **Não publicar sem autorização do usuário.**
