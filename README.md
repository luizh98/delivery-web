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
```

## Scripts

```powershell
npm run lint
npm run build
```

## Tenant

O app resolve tenant por subdominio. Em localhost, usa
`NEXT_PUBLIC_DEFAULT_TENANT_SLUG`.

Toda chamada ao backend passa por Route Handlers do Next, que enviam:

```http
X-Tenant-Slug: {tenantSlug}
```

## Admin Auth

`/admin/login` chama `/api/auth/login`. O token JWT volta do backend e fica em
cookie HttpOnly (`delivery_admin_token`).
