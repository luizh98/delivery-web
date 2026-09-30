# LP de links por tenant — desenho

**Spec:** `.specs/features/tenant-links-lp/spec.md`  
**Status:** Template compartilhado implementado; Terraço passou a usar seu HTML original por pedido posterior do usuário.

## Arquitetura escolhida

Uma rota Next `/links` usa o tenant do host para buscar arquivos públicos da pasta `public/landing-pages/<slug>/`. O cardápio permanece em `/`. A LP usa HTML gerado no servidor e uma estrutura compartilhada, sem React Client Components próprios e sem consulta à API. Cada pasta de tenant contém todo o conteúdo visual que pode variar.

**Exceção do Terraço Canecão:** `src/proxy.ts` reescreve `/links` para `public/landing-pages/terraco-canecao/index.html` somente nos hosts reconhecidos do tenant. O HTML original é servido sem o layout React; caminhos de imagens e o link do cardápio foram ajustados para este app. Scripts, animações, fontes externas e Pixel do arquivo fornecido permanecem. O template compartilhado continua disponível para os demais tenants.

O layout atual em `src/app/layout.tsx` envolve todas as páginas com configuração de restaurante, autenticação, carrinho, consentimento e tracking. Um layout aninhado de `/links` não remove esse trabalho. Por isso, a implementação proposta separa **dois layouts raiz**:

```text
src/app/
  (product)/layout.tsx          # layout atual, movido sem mudança funcional
  (product)/page.tsx            # cardápio; URL continua /
  (product)/cart/...            # demais páginas públicas
  (product)/admin/...           # painel
  (landing)/layout.tsx          # HTML/CSS mínimos, sem providers de produto
  (landing)/links/page.tsx      # URL /links
  api/...                       # Route Handlers mantidos nas URLs atuais

public/landing-pages/
  <tenant-slug>/
    config.json
    hero-mobile.webp
    hero-desktop.webp
    logo.webp
    social.webp
```

Não haverá `src/app/layout.tsx` acima desses grupos. Grupos entre parênteses não entram na URL. Navegação entre os dois layouts raiz faz carregamento completo, comportamento documentado do Next.js; o botão principal usa link normal para `/`. O custo é aceito para isolar a LP do estado e do JavaScript do produto. Antes de migrar, inventariar todas as rotas e verificar uma a uma que seus caminhos continuam iguais.

## Fluxo e interfaces

1. `src/proxy.ts` mantém resolução de tenant para rotas existentes; a LP resolve identidade diretamente do host recebido, com a função existente `resolveTenantFromHost` e regra explícita para domínio raiz/host inválido. Header `X-Tenant-Slug` enviado pelo visitante não seleciona pasta da LP.
2. `loadLandingConfig(slug): Promise<LandingConfig | null>` lê `public/landing-pages/<slug>/config.json` no servidor. Validar slug antes de formar caminho; retornar `null` para pasta ausente. Em produção, cachear por processo (conteúdo imutável até novo deploy); em desenvolvimento, reler para facilitar edição. Limitar cache ao número de pastas configuradas. Não importar nem buscar essa configuração pelo navegador.
3. `validateLandingConfig(raw, slug): LandingConfig` usa schema compartilhado no validador de build e no loader. Confere `schemaVersion`, `tenantSlug`, campos obrigatórios, URLs HTTPS, tamanho de textos, cores e nomes de imagens restritos à mesma pasta. Toda imagem referenciada deve existir. A validação de build percorre todas as pastas e falha se alguma estiver inválida. Para executar o schema TypeScript no script Node, adicionar `tsx` como dependência de desenvolvimento, com versão escolhida e fixada na execução; não depender de suporte experimental de TypeScript do Node.
4. `/links` renderiza marca, título, descrição, imagem hero e links. `menu` é sempre `/` no mesmo host. Links opcionais só aparecem quando configurados. `generateMetadata` da rota usa título, descrição e imagem social daquela pasta.
5. `config.json` contém apenas informação pública. Como está em `public/`, o arquivo é acessível por URL direta; não colocar chaves, tokens, informação privada ou integrações nesse arquivo.

## Formato previsto da pasta

Exemplo de contrato, a ajustar na implementação somente se os testes de build exigirem:

```json
{
  "schemaVersion": 1,
  "tenantSlug": "restaurante-exemplo",
  "name": "Restaurante Exemplo",
  "headline": "Peça seu favorito",
  "description": "Cardápio, localização e contato em um só lugar.",
  "logo": "logo.webp",
  "heroMobile": "hero-mobile.webp",
  "heroDesktop": "hero-desktop.webp",
  "heroAlt": "Prato servido pelo Restaurante Exemplo",
  "colors": { "background": "#FFFFFF", "foreground": "#202124", "accent": "#0F766E" },
  "menuLabel": "Ver cardápio",
  "addressLabel": "Como chegar",
  "mapsUrl": "https://maps.google.com/?q=...",
  "whatsappUrl": "https://wa.me/55...",
  "systemUrl": "https://flyfoods.com.br/",
  "extraLinks": [],
  "seo": {
    "title": "Restaurante Exemplo | links",
    "description": "Acesse o cardápio e veja como chegar.",
    "image": "social.webp"
  }
}
```

`whatsappUrl`, `systemUrl`, `extraLinks` e `seo.image` são opcionais; `menuLabel` pode ter padrão. Limitar quantidade de links extras (proposta: 3). Não aceitar caminhos absolutos, `..`, URL externa como imagem nem HTML arbitrário. Usar arquivo WebP/AVIF/PNG com tamanho/dimensões conhecidos. O nome da pasta deve corresponder exatamente ao slug do tenant. Mudanças exigem build/deploy, não painel.

## Performance por desenho

| Risco atual | Tratamento planejado |
| --- | --- |
| Layout global chama configuração da API e monta providers em qualquer página | LP com layout raiz próprio, sem chamadas de produto. |
| `CustomerAuthProvider` chama `/api/customer/me` no mount | Fora da árvore da LP. |
| Home busca menu e renderiza componente cliente grande | `/links` não importa `HomeView`, `CustomerMenu` ou `getMenu`. |
| Imagens de campanha podem dominar LCP | Versão mobile pré-otimizada, dimensões fixas, recurso principal prioritário; sem carrossel/vídeo. |
| `public/` tem cache padrão conservador | Arquivos com nome versionado; definir e verificar cache de imagem/CDN no ambiente de produção, sem cache longo do JSON mutável. |
| Pico da campanha e pedidos compartilham processo Next | Medir carga. Se houver disputa real, colocar cache/CDN na frente de `/links` ou separar sua entrega no futuro sem mudar URL pública. |

Como o tenant vem do host, o HTML pode exigir renderização por requisição; o arquivo lido em cache e ausência de backend reduzem custo. Não assumir que a rota será pré-renderizada estaticamente. Medir TTFB e HTML em produção. Não habilitar `cacheComponents` ou outras mudanças globais só por esta feature.

## Preservação do cardápio

- Congelar inventário de URLs e resposta esperada antes de mover os arquivos para `(product)`. `page.tsx` do cardápio permanece o mesmo componente e `dynamic = "force-dynamic"` permanece como está.
- Preservar `generateMetadata`, `RootLayout`, estilos e providers atuais no layout do grupo `(product)`, sem refatoração comportamental na mesma tarefa.
- Manter `src/app/api/**`, `src/proxy.ts`, BFF e backend sem alteração funcional. Revisar imports relativos após mover arquivos.
- Criar testes/smoke de host `demo.localhost` e outro tenant para `/`, `/links`, produto, carrinho, checkout, login/admin e BFF. Comparar URL, conteúdo e rede antes/depois.
- Validar fluxo completo: entrar direto no cardápio, adicionar produto, abrir carrinho e avançar até checkout; depois repetir via `/links`.
- Se qualquer URL anterior, sessão ou fluxo divergir, reverter a migração dos layouts antes de publicar a LP.

## Erros e observabilidade

| Caso | Resposta |
| --- | --- |
| Tenant sem pasta | 404 em `/links`; cardápio intacto. |
| Config inválida em build | Build falha com slug e campo inválido. |
| Config inválida em runtime | 404/erro controlado, registro sem dados sensíveis; nunca usar configuração de outro tenant. |
| Link externo inválido | Build falha; nenhum `javascript:`/HTTP publicado. |
| Imagem ausente | Build falha; evitar hero quebrado em produção. |

## Fontes e pontos verificados no código

- `src/app/page.tsx`: `/` renderiza `HomeView` e é dinâmica.
- `src/views/Home/index.tsx`: Home busca configuração e menu.
- `src/app/layout.tsx`: configuração, metadata, providers e tracking globais.
- `src/components/CustomerAuthProvider/index.tsx`: chamada a `customer/me` no mount.
- `src/utils/tenant.ts` e `src/proxy.ts`: resolução de slug por host/header.
- `Dockerfile`: copia `public/` para imagem de execução.
- Next.js, grupos de rotas/layouts raiz: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Next.js, arquivos públicos e cache: https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder
- Google, limites de Core Web Vitals: https://web.dev/articles/vitals

## Decisões e limites após a execução local

- O material em `inbox/terraco-site` foi inicialmente adaptado ao template. Após revisão visual do usuário, o HTML original completo passou a ser servido apenas para esse tenant. `config.json` permanece como fallback, sem controlar a apresentação ativa do Terraço.
- Política de cache/CDN disponível na hospedagem real. O repositório tem Dockerfile, mas não informa como o tráfego de produção é distribuído.
- Se a equipe quiser exibir endereço/horário operacionais atualizados automaticamente, isso muda a decisão de LP sem API e exige um desenho de cache próprio.
