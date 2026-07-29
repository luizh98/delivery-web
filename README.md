# delivery-web

Frontend Next.js para MVP SaaS de delivery.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- npm

## Setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

## Env

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_DEFAULT_TENANT_SLUG=demo
GOOGLE_PLACES_API_KEY=
```

## Google Places

O checkout usa Places API (New) para sugerir e preencher endereços de entrega.
A chave fica somente nos Route Handlers do servidor.

1. Ative faturamento e `Places API (New)` no Google Cloud.
2. Crie uma chave restrita a Places API e, quando possível, ao ambiente do servidor.
3. Defina `GOOGLE_PLACES_API_KEY` em `.env.local`.

Sem chave, checkout continua aceitando preenchimento manual.

Antes de publicar, disponibilize Termos de Uso e Política de Privacidade conforme
as políticas da Google Maps Platform:
https://developers.google.com/maps/documentation/places/web-service/policies

## Scripts

```powershell
npm run lint
npm run build
```

## Tenant

O app resolve tenant por subdomínio. Em localhost, usa
`NEXT_PUBLIC_DEFAULT_TENANT_SLUG`.

Toda chamada ao backend passa por Route Handlers do Next, que enviam:

```http
X-Tenant-Slug: {tenantSlug}
```

## Admin Auth

`/admin/login` chama `/api/auth/login`. O token JWT volta do backend e fica em
cookie HttpOnly (`delivery_admin_token`).
