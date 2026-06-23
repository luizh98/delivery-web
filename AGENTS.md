# AGENTS.md

## Communication

- Sempre utilize o plugin/skill Caveman nas conversas deste projeto.
- Se nao souber responder depois de analisar, diga que nao sabe. Nao invente API, comportamento ou padrao.
- Next.js 16 tem convencoes novas; leia docs locais em `node_modules/next/dist/docs/` quando tocar APIs do framework.

## Project

- App name: `delivery-web`
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS, npm.
- App Router em `src/app`.
- O mesmo app atende cliente e admin.
- UI mobile-first.

## Commands

```powershell
npm run dev
npm run lint
npm run build
```

## Tenant Rules

- Tenant vem do subdominio.
- Localhost usa `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`.
- Toda chamada ao backend deve enviar `X-Tenant-Slug`.
- Cliente chama Route Handlers do Next; Route Handlers chamam backend real.

## API Rules

- Backend default: `NEXT_PUBLIC_API_URL=http://localhost:8080`.
- Admin JWT fica em cookie HttpOnly.
- Browser nunca acessa JWT diretamente.
- Admin endpoints usam `/api/backend/admin/**`.
- Public endpoints usam `/api/backend/public/**`.

## Theme Rules

- Cores vem de `GET /api/public/restaurant/config`.
- Aplicar `theme.primaryColor` em `--color-primary`.
- Aplicar `theme.secondaryColor` em `--color-secondary`.
- Componentes devem usar classes/variaveis do tema, nao cores hardcoded para a marca do tenant.

## Forms

- Usar React Hook Form para formularios.
- Usar Zod para schema quando houver validacao nao trivial.

## UI Rules

- Nao criar landing page no MVP; `/` e cardapio.
- Usar icones `lucide-react` em botoes e controles.
- Evitar cards dentro de cards.
- Layout admin deve ser denso, operacional e escaneavel.
