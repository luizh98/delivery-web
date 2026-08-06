# Checkout Address Page Design

**Spec**: `.specs/features/checkout-address-page/spec.md`
**Status**: Approved

## Architecture Overview

`CartView` navega para `/cart/address`. `DeliveryAddressPage` lê endereço persistido do `CartProvider`, mantém rascunho local, reutiliza `AddressAutocomplete` e persiste apenas no salvamento. Após salvar ou cancelar, navega para `/cart?step=checkout`; `CartPage` converte query em `initialStep` para `CartView`.

## Code Reuse Analysis

| Component | Location | Reuse |
| --- | --- | --- |
| `AddressAutocomplete` | `src/views/Cart/AddressAutocomplete.tsx` | Busca e resolução do endereço |
| `CartProvider` | `src/components/CartProvider/index.tsx` | Leitura e persistência do checkout |
| `Field`, `Input`, `Button` | `src/components` | Controles do formulário |
| `PageShell`, `BackButton` | `src/components` | Estrutura e retorno da página |
| Estilos do carrinho | `src/views/Cart/styles.ts` | Cabeçalho, largura e formulário |

## Components

### DeliveryAddressPage

- **Location**: `src/views/Cart/DeliveryAddressPage.tsx`
- **Purpose**: Busca, edição, validação e confirmação em página inteira.
- **Dependencies**: `useCart`, `useRouter`, `AddressAutocomplete`.
- **Persistence**: `updateCheckout({...checkout, ...addressFields})` somente no salvar.

### Address route

- **Location**: `src/app/cart/address/page.tsx`
- **Purpose**: Expor página dedicada no App Router.

### Cart integration

- **Location**: `src/views/Cart/index.tsx`
- **Purpose**: Trocar abertura de modal por navegação e aceitar `initialStep`.

### Cart route

- **Location**: `src/app/cart/page.tsx`
- **Purpose**: Resolver `searchParams` assíncrono do Next.js 16 e abrir checkout quando solicitado.

## Error Handling Strategy

| Scenario | Handling |
| --- | --- |
| Sugestão falha | Mensagem existente do autocomplete |
| Campos obrigatórios vazios | Erros locais; salvar bloqueado |
| Cancelamento/voltar | Navega sem chamar `updateCheckout` |
| Rota direta | Usa checkout persistido ou inicia cadastro vazio |

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Layout | Página normal | Scroll do documento evita limites do teclado no modal |
| Retorno | `/cart?step=checkout` | Restaura etapa de checkout de forma determinística |
| Rascunho | Estado local | Impede persistência parcial |
| Modal antigo | Remover | Evita fluxo duplicado e código morto |

## Concerns Mitigation

- Frontend sem testes automatizados: lint, build e UAT mobile.
- `CartView` grande: mudanças limitadas a navegação e inicialização de etapa.
- Worktree misto: stage/commit apenas arquivos desta feature.
