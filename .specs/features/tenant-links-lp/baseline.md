# Baseline T01 — 2026-09-30

Comando: `node scripts/smoke-existing-routes.mjs`, servidor Next local em `127.0.0.1:3100`, hosts `demo.localhost` e `segundo.localhost`.

| Rota | Ambos hosts | Observação |
| --- | --- | --- |
| `/` | 200 HTML | `src/app/page.tsx` renderiza `HomeView` e mantém `force-dynamic`. |
| `/products/1` | 404 HTML | Produto 1 não existe sem backend disponível; navegação de produto não verificável. |
| `/cart` | 200 HTML | Renderização de rota verificada. |
| `/cart/address` | 200 HTML | Renderização da etapa de checkout verificada, sem criar pedido. |
| `/admin/login` | 200 HTML | Renderização de rota verificada. |
| `/api/backend/public/menu` | 503 JSON | Backend local indisponível. |

`route-baseline.json` registra todos os 37 caminhos de página e Route Handler existentes. Smoke passa nos dois hosts e falha com rota ausente, status ou tipo de conteúdo fora dos valores registrados. Teste de adicionar produto e avançar com dados reais depende do backend; T01 permanece parcial até esse teste.
