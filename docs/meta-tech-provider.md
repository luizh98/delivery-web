# Conexão WhatsApp no admin

## Domínio central para múltiplos tenants

Configuração runtime opcional no **web**, sem alteração de credenciais da API:

```
WHATSAPP_SIGNUP_ORIGIN=https://dev-integration.flyfoods.com.br
WHATSAPP_SIGNUP_TENANT_DOMAIN=flyfoods.com.br
```

Na staging, os painéis abrem `https://dev-integration.flyfoods.com.br/integrations/whatsapp`. Em produção, configurar `WHATSAPP_SIGNUP_ORIGIN=https://integration.flyfoods.com.br`, mantendo `WHATSAPP_SIGNUP_TENANT_DOMAIN=flyfoods.com.br`. Usuário clica **Continuar na Meta** na janela central; cadastro padrão e coexistência continuam disponíveis.

Na Meta, cadastrar os dois hosts HTTPS em **Domínios permitidos para o SDK JavaScript**, preservando entradas antigas durante a transição. Se o fluxo exigir URI OAuth, usar a URL completa `/integrations/whatsapp` do ambiente correspondente. Não tratar carregamento do SDK como validação de retorno OAuth.

Rotas Easypanel: `dev-integration.flyfoods.com.br` → `delivery-app-staging/delivery-web:3000`; `integration.flyfoods.com.br` → `delivery-app/delivery-web:80`. Produção mantém `PORT=80` explicitamente para preservar a porta já usada pelo serviço. DNS wildcard existente atende ambos; não substituir registros da zona.

Não abra a página central manualmente: ela exige janela de origem e nonce aleatório por tentativa. Código OAuth volta por postMessage validando origem exata, janela e nonce, sem URL/storage. O painel original conclui pela sessão admin e tentativa de uso único existentes, preservando tenant e proteção same-origin. Nenhum JWT ou token persistente é transferido à central.

Variáveis ausentes preservam conexão direta anterior. Configuração inválida bloqueia a nova conexão. Domínios personalizados fora de `WHATSAPP_SIGNUP_TENANT_DOMAIN` não são aceitos. Cada ambiente executa SDK na sua própria central; o painel que iniciou a tentativa continua responsável pela sessão, tenant e API de conclusão. Não compartilhar cookies administrativos nem transportar tokens persistentes entre hosts.

## Fluxo existente

Configurações → Pedidos e alertas → WhatsApp dos pedidos oferece conexão via Meta, status dos modelos, atualização e desconexão. Salve primeiro o celular do restaurante. O cadastro manual permanece em Configuração avançada.

Configuração do provider e segredos ficam no backend. Nenhum App Secret, token ou PIN deve ser enviado ao navegador. Consulte `delivery-api/docs/meta-tech-provider.md` para o checklist Meta. App ID de staging: `2686155311811975`; App Secret e Configuration ID foram encontrados cadastrados em staging em 26/10/2026.

Callback público de staging: `https://dev-terraco-canecao.flyfoods.com.br/api/meta/whatsapp/webhook`. Essa rota encaminha challenge e corpo original assinado para o backend interno, sem sessão de admin. Mutações de conexão e configuração exigem sessão e origem do admin.

O SDK recebe Configuration ID de configuração v4 e retorna código de autorização. Eventos só são aceitos de origens Facebook exatas; código e evento de conclusão podem chegar em qualquer ordem. CANCEL/ERROR não alteram a conexão; outros tipos de migração exigem suporte.

O botão único **Conectar WhatsApp** envia `featureType: whatsapp_business_app_onboarding` e `sessionInfoVersion: 3`, habilitando na Meta a escolha entre cadastrar um número e conectar o WhatsApp Business existente. O frontend aceita `FINISH` para cadastro padrão e `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING` para coexistência, inclusive sem `phone_number_id`; nesse caso, o backend resolve o número salvo do restaurante dentro da WABA autorizada e confirma coexistência na Graph.

O usuário precisa manter o WhatsApp Business atualizado e aberto durante a conexão; WhatsApp comum não é compatível. A Meta determina elegibilidade. O backend inicia sincronização de contatos e histórico exigida pelo onboarding e reconhece webhooks sem armazenar conversas. O admin identifica coexistência ativa e orienta como revogar a conexão pelo aplicativo. A autorização local pode ser removida pelo botão Desconectar.

Conexão não ativa avisos. O cliente acompanha aprovação de três modelos e configura cobrança na Meta antes de habilitar notificações, com consentimento dos destinatários.

Validação: `npx tsc --noEmit`, ESLint dos arquivos alterados, `node --test src/views/AdminSettings/whatsappEmbeddedSignup.test.mjs`, build e inspeção desktop/mobile. Fluxo visual foi exercitado com SDK e API simulados; conexão real depende da configuração externa.
