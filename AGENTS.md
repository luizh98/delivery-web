# AGENTS.md

## Communication

- Sempre utilize o plugin/skill Caveman nas conversas deste projeto.
- Se não souber responder depois de analisar, diga que não sabe. Não invente API, comportamento ou padrão.
- Next.js 16 tem convenções novas; leia docs locais em `node_modules/next/dist/docs/` quando tocar APIs do framework.

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

- Tenant vem do subdomínio.
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

- Cores vêm de `GET /api/public/restaurant/config`.
- Aplicar `theme.primaryColor` em `--color-primary`.
- Aplicar `theme.secondaryColor` em `--color-secondary`.
- Componentes devem usar classes/variáveis do tema, não cores hardcoded para a marca do tenant.

## Forms

- Usar React Hook Form para formulários.
- Usar Zod para schema quando houver validação não trivial.

## UI Rules

- Não criar landing page no MVP; `/` e cardápio.
- Usar ícones `lucide-react` em botões e controles.
- Evitar cards dentro de cards.
- Layout admin deve ser denso, operacional e escaneável.
