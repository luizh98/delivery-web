# Delivery Web

**Vision:** Frontend mobile-first para MVP SaaS de delivery, atendendo cliente final e painel admin no mesmo app.
**For:** Restaurantes que vendem por cardapio web e operam pedidos em painel simples.
**Solves:** Permite pedido online, checkout visitante, personalizacao visual por tenant e gestao operacional basica.

## Goals

- Renderizar cardapio e checkout usando dados tenant-scoped do backend.
- Proteger admin com JWT em cookie HttpOnly.
- Aplicar tema do restaurante via cores vindas do backend.

## Tech Stack

**Core:**

- Framework: Next.js 16.2.9
- Language: TypeScript
- UI: React 19, Tailwind CSS

**Key dependencies:**

- React Hook Form
- Zod
- `@hookform/resolvers`
- Lucide React

## Scope

**v1 includes:**

- Cardapio publico mobile-first.
- Carrinho e checkout visitante.
- Admin login.
- Admin pedidos, status, cancelamento e impressao simples.
- Admin config restaurante, categorias e produtos.
- Tenant por subdominio e header `X-Tenant-Slug`.
- Tema por `primaryColor` e `secondaryColor`.

**Explicitly out of scope:**

- Pagamento online.
- Login de cliente final.
- Design system completo.
- UAZapi UI avancada.

## Constraints

- Mesmo app para cliente e admin.
- Backend multi-tenant exige `X-Tenant-Slug`.
- JWT admin deve ficar em cookie HttpOnly.
