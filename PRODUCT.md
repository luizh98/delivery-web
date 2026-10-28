# Flyfoods

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Clientes de restaurantes que consultam o cardápio e fazem pedidos, com experiência mobile-first.
- Equipe do restaurante que opera pedidos, cozinha e entregas pelo painel administrativo. Cozinha, entregadores e salão participam dos fluxos existentes.
- Público confirmado pelo responsável pelo produto. Prioridade entre os públicos quando houver conflito: em aberto.
- No editor de mensagens de WhatsApp, o usuário é o lojista que administra o restaurante.

## Product Purpose

Plataforma de pedidos e operação de restaurantes, com cardápio público e administração por estabelecimento. Objetivos confirmados: aumentar conversão de vendas e ticket médio do restaurante, facilitando o pedido direto. Esses objetivos não representam resultados já medidos nem garantias comerciais.

## Positioning

Pedido direto ao restaurante é o foco confirmado. Diferencial exclusivo frente a outros produtos, modelo comercial e indicadores de sucesso: em aberto.

## Operating Context

- O mesmo app atende clientes e administração de múltiplos restaurantes, separados por tenant.
- `/` é o cardápio; cliente consulta produtos, monta carrinho e acompanha pedidos.
- Código contempla entrega, retirada e pedido na mesa, além de conta do cliente e recuperação de senha.
- Painel possui áreas de pedidos, cozinha, entregas, mesas, catálogo, clientes, usuários, promoções, análises, impressão e configurações.
- Administração deve funcionar em computador e celular.
- Avisos do pedido são enviados pelo número do restaurante via WhatsApp integrado à Meta.
- Interface e conteúdo atuais usam português brasileiro.

## Capabilities and Constraints

Fatos técnicos e de escopo registrados no repositório:

- Next.js 16, React 19, TypeScript, Tailwind CSS e npm; App Router em `src/app`.
- Tenant vem do subdomínio; localhost usa `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`. Toda chamada ao backend deve enviar `X-Tenant-Slug`.
- Browser chama Route Handlers do Next, que chamam o backend real. JWT administrativo fica em cookie HttpOnly e não é acessado pelo browser.
- Configurações e credenciais são isoladas por restaurante; credenciais permanecem no servidor.
- Identidade do restaurante vem da configuração do tenant. Compromisso confirmado: seguir cores primária e secundária definidas por tenant, usando variáveis/classes do tema.
- `/links` é opcional por tenant e segue `docs/tenant-landing-pages.md`; não substitui o cardápio em `/`.
- Checkout aceita preenchimento manual de endereço sem chave do Google Places. Cálculo rodoviário do frete pertence ao backend.
- Formulários usam React Hook Form e Zod quando a validação é não trivial.
- UI mobile-first; administração deve ser densa, operacional e escaneável.
- Existência de telas e opções no código não comprova disponibilidade de todos os recursos em produção.
- Há três avisos de WhatsApp: confirmado e em preparo, saiu para entrega, concluído e avaliação.
- O lojista quer editar textos já preenchidos, inserir dados do pedido arrastando parâmetros e visualizar resultado no próprio admin.
- Na confirmação, um único modelo atende entrega e retirada: informação de endereço inclui frase e endereço adequados à modalidade.
- Modelos de mensagem dependem de aprovação da Meta; prévia local não envia mensagem nem confirma aprovação ou entrega.
- Edição mantém versão aprovada em uso enquanto nova versão aguarda aprovação; prévia e rascunho não alteram os envios.

## Brand Commitments

- Nome técnico do app: `delivery-web`; nome existente da plataforma: Flyfoods.
- Preservar identidade própria de cada restaurante, sem impor uma marca única aos tenants.
- LP do Terraço Canecão usa material fornecido pela equipe em `public/landing-pages/terraco-canecao/index.html`, conforme documentação local.
- Cores primária e secundária de cada tenant são um compromisso confirmado pelo responsável pelo produto.
- Textos de WhatsApp devem ser próximos e carismáticos, conforme modelos definidos com o usuário. O editor preserva identidade visual atual do admin.

## Evidence on Hand

- `README.md`: contexto de MVP SaaS de delivery, integrações, autenticação e configuração local.
- `AGENTS.md`: regras de tenant, API, tema, formulários e UI operacional, escaneável e mobile-first.
- `src/app/`: rotas de cliente, administração, LP e conteúdo legal.
- `src/components/CartProvider/index.tsx`: modalidades de pedido e opções de pagamento no estado de checkout.
- `docs/tenant-landing-pages.md` e `public/landing-pages/terraco-canecao/`: documentação e material de LP por tenant.
- Público, objetivos e uso das cores por tenant foram confirmados pelo responsável pelo produto durante o init.
- Métricas de conversão, ticket médio, depoimentos e provas comerciais não foram fornecidos nesta etapa. Não inventar resultados ou alegações.
- Implementação do editor em `src/views/AdminSettings/` e componentes compartilhados de formulário.
- Contexto de produto e requisitos da integração em `../.specs/project/` e `../.specs/features/meta-whatsapp-tech-provider/`.
- Preferências de edição e prévia confirmadas pelo usuário em 27/10/2026.

## Product Principles

1. Facilitar o caminho do cliente até o pedido direto ao restaurante.
2. Avaliar melhorias pela contribuição à conversão e ao ticket médio, sem inventar números.
3. Preservar operação, isolamento e identidade de cada tenant.
4. Manter operação do restaurante fácil de consultar e executar.
5. Começar com conteúdo útil preenchido; não exigir que lojista aprenda formato da API.
6. Prévia deve mostrar fielmente transformações e limites do envio.
7. Distinguir texto salvo de modelo aprovado e mensagem efetivamente enviada.

## Accessibility & Inclusion

Arrastar parâmetros também deve ter alternativa por clique e teclado; celular não pode depender de arrastar. Estados e erros devem ter texto, além de cor.

## Open Decisions

- Prioridade entre cliente e equipe do restaurante em conflitos de produto.
- Diferencial competitivo, metas quantitativas e forma de medir sucesso.
- Requisitos específicos de acessibilidade e inclusão além dos definidos para o editor de mensagens, e compromissos adicionais de linguagem, permanecem em aberto.
