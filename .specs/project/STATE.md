# State

## Domínios dedicados de integração — 2026-10-28

- Usuário autorizou adoção em staging e produção; corrigiu host de staging para `dev-integration.flyfoods.com.br`. Produção: `integration.flyfoods.com.br`.
- DNS wildcard A já aponta ambos ao Easypanel; registros existentes preservados. Rotas HTTPS explícitas para web staging:3000 e web produção:80. Variáveis de origem/domínio configuradas nos serviços; PORT=80 explícito em produção preserva porta atual.
- Promoção da central para main preparada por cherry-picks dos quatro commits de staging. Árvore resultante idêntica à staging já validada; 13 testes focados WhatsApp passaram. Nenhuma mudança em API ou dependências.
- Meta exige cadastro dos dois hosts na lista JSSDK; solicitado ao usuário. Não automatizar autorização de conta ou concluir vínculo real. Documentação atualizada em `docs/meta-tech-provider.md` e `.specs/quick/032-whatsapp-integration-domains/`.

## Conexão WhatsApp centralizada — 2026-10-28

- Implementação autorizada somente para staging com tlc-spec-driven. Painéis abrem central no host já autorizado `dev-terraco-canecao.flyfoods.com.br/integrations/whatsapp`; nonce em fragmento, origem/janela verificadas, conclusão pela sessão admin e tentativa one-shot originais. API não alterada.
- Runtime no web staging: `WHATSAPP_SIGNUP_ORIGIN=https://dev-terraco-canecao.flyfoods.com.br`, `WHATSAPP_SIGNUP_TENANT_DOMAIN=flyfoods.com.br`. Sem configuração mantém SDK direto; central sem opener é bloqueada. Produção não configurada/publicada.
- 104 testes da suíte passaram, depois cinco testes focados incluindo fechamento/timeout; TypeScript, lint, build Webpack, detector e diff check passaram. Navegador local com API/Meta simuladas confirmou dois tenants, ambos fluxos, ordem inversa de eventos, cancelamento e desktop/mobile.
- Commits funcionais: a27ce27 e 129c39d, publicados em staging por 7af5573. Smoke direto após 60 segundos confirmou configuração, central protegida e SDK real carregado entre os subdomínios dev-terraco e dev-terraco-canecao; sem acompanhar build/deploy. Autorização real Meta e conclusão autenticada em staging dependem do titular; fluxo completo foi validado localmente com fixtures.
- Spec, desenho, tarefas e evidências textuais em `.specs/features/whatsapp-central-signup/`.

## Coexistência WhatsApp — 2026-10-26

- Admin usa um único Conectar WhatsApp para habilitar escolha na Meta entre número novo e conta Business existente; aceita conclusão de coexistência sem phone_number_id e mantém FINISH padrão e orientação sobre uso/revogação no WhatsApp Business.
- Registro tlc-spec-driven: `.specs/features/whatsapp-coexistence/spec.md`; requisitos completos no repositório delivery-api.
- 81 testes, TypeScript e lint aprovados na base staging atualizada; build aprovado com o mesmo código. API: 63 testes WhatsApp/Meta e build passaram; falha preexistente de impressão confirmada na base remota limpa. Usuário autorizou staging; encerrar no push e manter homologação real como pendência externa.

## Próxima abertura da loja — 2026-10-19

- Mensagem compartilhada pelo cardápio/carrinho distingue hoje, amanhã e dia da semana em São Paulo.
- API passa a respeitar feriados ao calcular nextOpeningAt. Regressão original reproduzida nos dois repositórios.
- Configuração real da dev-terraco-canecao: domingo fechado; segunda a sábado 05:30–23:45. Testes com domingo fixo, sem alterar dados ou relógio do ambiente.
- Especificação e evidências: `.specs/features/store-next-opening/`.

## Paginação do desempenho — 2026-10-14

- Ranking ativo de itens e opcionais com 10 registros por página, Anterior/Próxima e reinício ao trocar tipo ou período.
- 40 testes, TypeScript e build aprovados; detector Impeccable sem ocorrências. Dois erros anteriores de lint em effects do dashboard permanecem. Inspeção visual em navegador pendente.
- Registro: `.specs/quick/025-dashboard-performance-pagination/`.

## Indicadores do acompanhamento — 2026-10-13

- Status atual e anteriores preenchidos com check; apenas próximo passo pulsa. Horários preservados; cancelados/finalizados sem pulso; movimento reduzido respeitado.
- Quick task: `.specs/quick/025-tracking-next-status/`. Base atualizada: `origin/staging` em `6d45cc5`; checkout principal preservado.
- Validação: 45 testes, TypeScript, lint alterado e build Webpack aprovados; navegador 390/1280 px sem overflow. Turbopack local limitado pela junção de node_modules; deploy usa instalação própria.
- Publicação autorizada exclusivamente em staging, com deploy automático no Easypanel.
## WhatsApp admin configuration — 2026-10-05

- Conta Meta cadastrável em Configurações > Pedidos e alertas > WhatsApp dos pedidos: ID, token, três templates e versão Graph. Mantidos seis accordions e único Salvar alterações.
- Settings usa GET admin uncached, recebe somente resumo/tokenConfigured. Token input password sem valor salvo; blank mantém, replacement troca, campo limpo após save. PUT parcial inclui integração somente se alterada.
- Backend persiste restaurant_configs.whatsappIntegration cifrada por tenant e lê por envio. Plano/validação canônicos ../delivery-api/.specs/features/whatsapp-admin/.
- Impeccable: identidade existente preservada. Capturas .impeccable/review/ desktop/mobile, sem overflow; fix de contraste aprovado 5.05:1. Documenter não alterou sistema. Launcher/detector indisponíveis pelo cache fora do sandbox.
- 31 testes web, tsc e scoped eslint passaram; Playwright fixture validou cadastro/blank/token rotation/template edit. Sem envio real ou deploy.
- Branch isolada feat/whatsapp-admin-settings, base origin/staging 6729199, para preservar checkout delivery-web em deploy/printer-history-pagination-main.

## WhatsApp order status — 2026-10-05

- Checkbox por restaurante em Configurações → Pedidos, default false: `whatsappNotificationsEnabled`. Schema, payload parcial e tipo de API atualizados.
- Plano canônico no repositório irmão `delivery-api/.specs/features/whatsapp-order-status/`; backend UAzapi e fila implementados.
- 28 testes, TypeScript e lint dos arquivos alterados passaram. Lint global mantém três erros preexistentes em LazyAdminDashboard/AdminPrinter. Sem publicação nesta tarefa.

## Desconto no produto — 2026-10-06

- Desconto opcional por porcentagem inteira ou preço final. Cadastro com prévia; cardápio/carrossel/detalhe usam paleta da tenant. API preserva preço original e calcula preço efetivo; carrinho, combos e pedidos aplicam desconto sem afetar adicionais.
- Especificação e evidências: `.specs/features/product-discounts/`. API no repositório irmão `delivery-api`.
- Go: 196 testes; web: 31 testes; TypeScript, build e lint dos arquivos alterados aprovados. Lint geral mantém erros anteriores em Dashboard/Impressora. Browser validado com backend de teste em memória.

## Active Work

- Download do instalador Windows: arquivo 0.1.13 publicado no GCS; botão pronto para `staging`. Produção depende da promoção do recurso do conector; ver `.specs/features/windows-installer-download/spec.md`.
- Lazy dashboard reports: cross-repository feature. Frontend: `C:\projetos-pessoais\delivery-app\delivery-web`; backend: `C:\projetos-pessoais\delivery-app\delivery-api`. Canonical plan: `.specs/features/lazy-dashboard-reports/`.
- Status: specification, design and tasks drafted; implementation not started.

**Last Updated:** 2026-10-03
**Current Work:** Data do pedido nos modais de Pedidos e Cozinha - implementação validada, publicação em staging autorizada

---

## Recent Decisions (Last 60 days)

### AD-001: Endereço em página dedicada (2026-08-06)

**Decision:** Substituir modal de endereço por `/cart/address`.
**Reason:** Teclado virtual continuava cortando formulário dentro do modal.
**Trade-off:** Navegação adicional entre checkout e endereço.
**Impact:** Novo e editar endereço usam página com scroll natural e retornam à etapa 2.

---

### AD-002: Alerta sonoro configurado por navegador (2026-08-25)

**Decision:** Manter o notifier no layout protegido e mover seu controle para um
checkbox nas configurações, persistido em `localStorage`.
**Reason:** Autoplay exige gesto no navegador e a preferência pertence ao dispositivo,
enquanto pedidos auto-confirmados precisam ser detectados por ID, não por status.
**Impact:** Pedido novo em `CONFIRMED` toca uma vez. `RECEIVED` toca ao entrar e
repete a cada 3 segundos enquanto houver pedido nesse status.

---

## Active Blockers

Nenhum.

---

## Lessons Learned

### L-001: Autoplay precisa de gesto após carregar o admin

**Context:** Alerta de novo pedido era iniciado por polling depois do login.
**Problem:** Chrome retornava `NotAllowedError` porque o clique no login aconteceu no documento anterior à navegação.
**Solution:** Expor `Ativar som` dentro do admin para reproduzir o áudio sob gesto explícito e manter o notifier no layout protegido.
**Prevents:** Alertas silenciosamente bloqueados por política de autoplay após login ou recarga.

---

### L-002: Ativação não deve depender do elemento MP3

**Context:** Alguns navegadores recusaram o `play()` mesmo após o clique explícito.
**Problem:** O elemento de áudio era criado antes do gesto e a exceção era descartada.
**Solution:** Criar e liberar um `AudioContext` no próprio clique, gerar o sinal localmente e exibir o nome da exceção quando houver falha.
**Prevents:** Falhas por download, codec, elemento de mídia obsoleto e diagnóstico genérico.

---

## Quick Tasks Completed

024: Data e hora nos modais de Pedidos e Cozinha (2026-10-03). Commit: `feat(admin): show order date in orders and kitchen modals`. Build, lint do componente, 24 testes e 5 verificações de datas aprovados. Lint geral com falhas preexistentes em Dashboard/Impressora. Publicação em staging acompanhada após push.

| # | Description | Date | Commit | Status |
| --- | --- | --- | --- | --- |
| 006 | Manter somente Meus pedidos no cardápio | 2026-08-06 | `fix(menu): keep only orders history shortcut` | ✅ Done |
| 007 | Corrigir primeiro toque no botão Continuar do carrinho mobile | 2026-08-06 | `fix(cart): handle continue on first mobile tap` | ✅ Done |
| 010 | Padronizar cabeçalho e retorno do status do pedido | 2026-08-06 | `feat(tracking): standardize order status header` | ✅ Done |
| 009 | Manter foco na busca de endereço sem rolar o modal | 2026-08-06 | `fix(cart): keep address search focused` | ✅ Done |
| 011 | Manter busca de endereço visível acima do teclado | 2026-08-06 | `fix(cart): keep address search visible above keyboard` | ✅ Done |
| 012 | Exibir campos de endereço somente após seleção | 2026-08-06 | `fix(cart): reveal address fields after selection` | ✅ Done |
| 013 | Adicionar scroll interno ao modal de endereço | 2026-08-06 | `fix(cart): add inner scroll to address modal` | ✅ Done |
| 015 | Padronizar cor dos botões primários com a categoria da home | 2026-08-06 | `style(button): match home category color` | ✅ Done |
| 001 | Localizar enums e imprimir pedido no admin | 2026-08-06 | `901cebd` | ✅ Done |
| 016 | Tornar alerta de novo pedido global e ativável no admin | 2026-08-24 | `fix(admin): play new order sound across admin` | ✅ Done |
| 017 | Repetir alerta enquanto houver pedido recebido | 2026-08-24 | `fix(admin): repeat sound for received orders` | ✅ Done |
| 018 | Corrigir ativação do som no navegador | 2026-08-24 | — | ✅ Done |
| 019 | Exibir total de desconto no carrinho e na finalização | 2026-08-25 | `feat(cart): show total discount in checkout` | ✅ Done |
| 020 | Alterar gráfico da dashboard de faturamento para linhas | 2026-08-25 | `feat(admin): change dashboard chart to line` | ✅ Done |
| 021 | Repetir alerta para pedidos recebidos a cada 15 segundos | 2026-09-25 | `fix(admin): repeat received order sound every 15 seconds` | ✅ Done |
| 022 | Reduzir intervalo do alerta de pedido recebido para 3 segundos | 2026-09-25 | `fix(admin): repeat received order sound every 3 seconds` | ✅ Done |
| 023 | Permitir desmarcar adicional de escolha única | 2026-09-28 | `fix(product): allow deselecting single-choice option` | ✅ Done |

---

## Deferred Ideas

Nenhuma.

---

## Todos

Nenhum.

---

## Preferences

**Model Guidance Shown:** never
