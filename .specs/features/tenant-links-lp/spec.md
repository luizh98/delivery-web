# LP de links por tenant — especificação

**Status:** LP real do `terraco-canecao` implementada e validada em laboratório; fluxo de compra com backend e revisão final de conteúdo pendentes.
**Data:** 2026-09-29.

## Problema e objetivo

Cada restaurante precisa de uma página curta para o link da bio do Instagram: cardápio como ação principal, endereço e links secundários. A equipe quer editar essa página por uma pasta com o mesmo slug do tenant, dentro do `delivery-web`, sem alterar o cardápio atual. A primeira impressão deve ser rápida em celular e em rede móvel.

## Escopo e decisões já tomadas

- URL: `https://<tenant>.flyfoods.com.br/links` (ou domínio raiz configurado), resolvida pelo tenant do host.
- `/` continua sendo o cardápio. O botão principal da LP aponta para `/` no mesmo host.
- Uma pasta `public/landing-pages/<tenant-slug>/` contém `config.json` e imagens da LP. Criar a pasta com configuração válida e publicar nova versão torna `/links` disponível para aquele tenant. Nenhum registro manual por tenant.
- Uma única estrutura de LP atende todos os tenants; texto, cores, imagens e links variam por configuração. Componentes próprios por cliente ficam fora do MVP.
- LP sem dependência do cardápio, autenticação do cliente ou consulta à API na renderização. Conteúdo operacional da loja não aparece na LP: endereço e contatos da LP são cópias de marketing, atualizadas junto da pasta.
- Sem pasta válida, `/links` responde 404; `/` e demais rotas continuam funcionando.

## Fora do escopo

| Item | Motivo |
| --- | --- |
| Substituir `/` pela LP | Preservar cardápio e links/QRs existentes. |
| Painel para editar LP, CMS ou edição sem deploy | Configuração inicial por arquivos versionados. |
| Layout livre ou código React por restaurante | Impede manutenção e controle de performance previsível. |
| Mudar backend, modelo de tenant ou fluxo de pedidos | LP apenas apresenta links. |
| Embeds de mapas, vídeos, pixels e scripts de terceiros na LP | Peso e chamadas extras na primeira visita. |
| Publicação/deploy | Requer autorização explícita do usuário após os gates. |

## Histórias e critérios de aceite

### P1 — Entrada do restaurante (LP-01, LP-02)

Como visitante vindo da bio, quero reconhecer o restaurante e abrir o cardápio imediatamente.

1. **WHEN** acesso `/links` em host de tenant com pasta válida, **THEN** a página **SHALL** mostrar marca, título, descrição curta e botão de cardápio sem buscar `/api/public/menu`.
2. **WHEN** aciono o botão de cardápio, **THEN** navego para `/` no mesmo host e vejo o mesmo cardápio existente.
3. **WHEN** acesso `/` diretamente, **THEN** continuo vendo o cardápio, sem passar pela LP.
4. **Teste independente:** visitar `/links`, clicar no botão, abrir `/` diretamente e comparar funcionamento do cardápio.

### P1 — Configuração por pasta de tenant (LP-03, LP-04)

Como desenvolvedor, quero criar uma pasta chamada como o slug do tenant e configurar conteúdo/arquivos nela.

1. **WHEN** adiciono `public/landing-pages/<slug>/config.json` válido e imagens referenciadas e faço novo build/deploy, **THEN** `/links` desse host **SHALL** usar essa configuração sem editar registro central.
2. **WHEN** dois tenants têm pastas distintas, **THEN** cada `/links` **SHALL** mostrar apenas conteúdo e imagens do próprio tenant.
3. **WHEN** uma pasta está ausente, inválida ou aponta para arquivo inexistente, **THEN** o build **SHALL** falhar para configuração inválida; em produção, tenant sem pasta **SHALL** receber 404 sem afetar `/`.
4. **WHEN** a configuração contém URL externa, **THEN** validação **SHALL** aceitar apenas HTTPS e renderização **SHALL** impedir abertura com acesso à janela de origem.
5. **Teste independente:** adicionar dois fixtures de tenant, validar a pasta, abrir ambos os hosts e confirmar isolamento; testar configuração inválida.

### P1 — Ações essenciais (LP-05)

Como visitante, quero encontrar endereço e demais canais da loja.

1. **WHEN** endereço/mapa estiver configurado, **THEN** a LP **SHALL** exibir botão de localização.
2. **WHEN** WhatsApp e divulgação do sistema estiverem configurados, **THEN** a LP **SHALL** exibir botões opcionais com destino correto.
3. **WHEN** campo opcional não existir, **THEN** a LP **SHALL** omitir seu botão sem espaço vazio ou erro.
4. **Teste independente:** conferir destinos dos botões e ausência dos opcionais em tenant mínimo.

### P1 — Performance e estabilidade (LP-06, LP-07)

Como visitante, quero uma página rápida; como operador, quero o cardápio estável.

1. **WHEN** `/links` é carregada, **THEN** não **SHALL** montar `CustomerAuthProvider`, `CartProvider` ou `TrackingProvider`, nem requisitar `/api/customer/me`, `/api/public/menu` ou `/api/public/restaurant/config`.
2. **WHEN** `/links` é carregada, **THEN** não **SHALL** incluir JavaScript cliente específico da LP, embed ou fonte externa adicional; imagens acima da dobra **SHALL** ter dimensões, versão mobile e formato otimizado.
3. **WHEN** o projeto compila, **THEN** todas as URLs públicas e de admin anteriores **SHALL** conservar seu caminho; especialmente `/`, `/cart`, `/products/[id]`, `/admin/login` e `/api/backend/**`.
4. **WHEN** entram visitas na LP, **THEN** nenhum dado do cardápio, pedido ou sessão **SHALL** mudar pela visita.
5. **Teste independente:** inspeção da rede, comparação de rotas antes/depois, smoke test de cardápio e checkout, auditoria mobile de performance.

### P2 — Compartilhamento e atribuição (LP-08)

1. **WHEN** URL da LP é compartilhada, **THEN** título, descrição e imagem social **SHALL** refletir o tenant.
2. **WHEN** a URL contém parâmetros UTM permitidos, **THEN** o botão do cardápio **SHALL** preservá-los em `/`; outros parâmetros são descartados.
3. **Teste independente:** inspecionar HTML/metadados de dois tenants e destino do botão com UTM.

## Orçamento e medição de performance

- Critério de implementação: 0 chamadas à API no carregamento de `/links`; 0 JavaScript cliente escrito especificamente para a LP; hero mobile inicial até 150 KB, imagens iniciais somadas até 250 KB. Orçamentos de imagem são limites iniciais e podem ser ajustados após medição documentada.
- Gate de laboratório: Lighthouse mobile, build de produção, mediana de 3 medições no mesmo perfil de rede/dispositivo, nota Performance >= 90. Guardar relatório e tamanho de recursos.
- Meta em campo, após volume suficiente: percentil 75 mobile com LCP <= 2,5 s, INP <= 200 ms e CLS <= 0,1. Sem tráfego real, registrar como meta posterior, não afirmar que foi atingida.
- Comparar `/` antes e depois: rotas, requisições e resultado de fluxo de compra; investigar qualquer regressão atribuível à LP.

## Casos de borda

- Slug de host desconhecido, `www`, domínio raiz e host malformado: nunca escolher pasta de outro tenant silenciosamente.
- Header `X-Tenant-Slug` fornecido pelo visitante: não pode trocar a LP exibida; identidade pública da LP deriva do host normalizado.
- Configuração malformada ou sem imagem obrigatória: falha de validação no build, erro controlado/404 em runtime.
- Imagem grande, sem dimensões, link inseguro ou caminho fora da pasta do tenant: falha de validação.
- Link do endereço ausente e campos opcionais vazios: botão omitido.
- Navegação de `/links` para `/`: carrinho e autenticação do cardápio continuam funcionando como em uma visita direta.

## Rastreabilidade

| ID | Requisito | Tarefas | Status |
| --- | --- | --- | --- |
| LP-01 | `/links` por host | T04, T06, T07 | Verificado com fixtures e tenant real |
| LP-02 | `/` preservado e CTA principal | T01, T02, T06, T07, T11 | Parcial: checkout real pendente |
| LP-03 | Pasta/config automática por slug | T03, T04, T05, T09, T13 | Verificado com tenant real; conteúdo requer revisão antes de publicar |
| LP-04 | Isolamento e validação | T03, T04, T05, T07, T13 | Verificado com fixtures e tenant real |
| LP-05 | Endereço e links opcionais | T03, T06, T09 | Verificado com tenant real; divulgação do sistema omitida por não haver URL no material |
| LP-06 | LP leve | T02, T05, T06, T10, T12 | Laboratório: mediana 98, sem API ou recurso externo; campo/CDN pendentes |
| LP-07 | Regressão do cardápio | T01, T02, T11 | Parcial: backend indisponível |
| LP-08 | Metadados e UTM | T08 | Verificado com fixtures e tenant real |

**Cobertura:** 8 requisitos, 8 mapeados para tarefas.

## Fontes técnicas

- Next.js, grupos de rotas/layouts raiz: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Next.js, diretório `public` e cache padrão: https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder
- Google, Core Web Vitals e percentil 75: https://web.dev/articles/vitals
