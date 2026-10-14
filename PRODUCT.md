# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Clientes de restaurantes que consultam o cardápio e fazem pedidos, com experiência mobile-first.
- Equipe do restaurante que opera pedidos, cozinha e entregas pelo painel administrativo.
- Público confirmado pelo responsável pelo produto. Prioridade entre os públicos quando houver conflito: em aberto.

## Product Purpose

SaaS de pedidos para facilitar o pedido direto ao restaurante. Objetivos confirmados: aumentar conversão de vendas e ticket médio do restaurante. Esses objetivos não representam resultados já medidos nem garantias comerciais.

## Positioning

Pedido direto ao restaurante é o foco confirmado. Diferencial exclusivo frente a outros produtos, modelo comercial e indicadores de sucesso: em aberto.

## Operating Context

- O mesmo app atende clientes e administração de múltiplos restaurantes, separados por tenant.
- `/` é o cardápio; cliente consulta produtos, monta carrinho e acompanha pedidos.
- Código contempla entrega, retirada e pedido na mesa, além de conta do cliente e recuperação de senha.
- Painel possui áreas de pedidos, cozinha, entregas, mesas, catálogo, clientes, usuários, promoções, análises, impressão e configurações.
- Interface e conteúdo atuais usam português brasileiro.

## Capabilities and Constraints

Fatos técnicos e de escopo registrados no repositório:

- Next.js 16, React 19, TypeScript, Tailwind CSS e npm; App Router em `src/app`.
- Tenant vem do subdomínio; localhost usa `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`. Toda chamada ao backend deve enviar `X-Tenant-Slug`.
- Browser chama Route Handlers do Next, que chamam o backend real. JWT administrativo fica em cookie HttpOnly e não é acessado pelo browser.
- Identidade do restaurante vem da configuração do tenant. Compromisso confirmado: seguir cores primária e secundária definidas por tenant, usando variáveis/classes do tema.
- `/links` é opcional por tenant e segue `docs/tenant-landing-pages.md`; não substitui o cardápio em `/`.
- Checkout aceita preenchimento manual de endereço sem chave do Google Places. Cálculo rodoviário do frete pertence ao backend.
- Formulários usam React Hook Form e Zod quando a validação é não trivial.
- UI mobile-first; administração deve ser densa, operacional e escaneável.
- Existência de telas e opções no código não comprova disponibilidade de todos os recursos em produção.

## Brand Commitments

- Nome técnico do app: `delivery-web`; nome comercial da plataforma permanece em aberto.
- Preservar identidade própria de cada restaurante, sem impor uma marca única aos tenants.
- LP do Terraço Canecão usa material fornecido pela equipe em `public/landing-pages/terraco-canecao/index.html`, conforme documentação local.
- Cores primária e secundária de cada tenant são um compromisso confirmado pelo responsável pelo produto.

## Evidence on Hand

- `README.md`: contexto de MVP SaaS de delivery, integrações, autenticação e configuração local.
- `AGENTS.md`: regras de tenant, API, tema, formulários e UI.
- `src/app/`: rotas de cliente, administração, LP e conteúdo legal.
- `src/components/CartProvider/index.tsx`: modalidades de pedido e opções de pagamento no estado de checkout.
- `docs/tenant-landing-pages.md` e `public/landing-pages/terraco-canecao/`: documentação e material de LP por tenant.
- Público, objetivos e uso das cores por tenant foram confirmados pelo responsável pelo produto durante o init.
- Métricas de conversão, ticket médio, depoimentos e provas comerciais não foram fornecidos nesta etapa. Não inventar resultados ou alegações.

## Product Principles

1. Facilitar o caminho do cliente até o pedido direto ao restaurante.
2. Avaliar melhorias pela contribuição à conversão e ao ticket médio, sem inventar números.
3. Preservar isolamento e identidade de cada tenant.
4. Manter operação do restaurante fácil de consultar e executar.

## Open Decisions

- Prioridade entre cliente e equipe do restaurante em conflitos de produto.
- Diferencial competitivo, metas quantitativas e forma de medir sucesso.
- Requisitos específicos de acessibilidade e inclusão e compromissos adicionais de linguagem não foram definidos nesta etapa.
