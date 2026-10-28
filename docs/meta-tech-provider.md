# Conexão WhatsApp no admin

## Domínio central para múltiplos tenants

Configuração runtime opcional no **web**, sem alteração de credenciais da API:

```
WHATSAPP_SIGNUP_ORIGIN=https://dev-terraco-canecao.flyfoods.com.br
WHATSAPP_SIGNUP_TENANT_DOMAIN=flyfoods.com.br
```

Na staging, os painéis abrem `/integrations/whatsapp` nesse domínio já autorizado para o JSSDK. Usuário clica **Continuar na Meta** na janela central; cadastro padrão e coexistência continuam disponíveis. O domínio permitido no painel Meta é o da central, não cada restaurante. Mantenha endereços já usados durante a transição.

Não abra a página central manualmente: ela exige janela de origem e nonce aleatório por tentativa. Código OAuth volta por postMessage validando origem exata, janela e nonce, sem URL/storage. O painel original conclui pela sessão admin e tentativa de uso único existentes, preservando tenant e proteção same-origin. Nenhum JWT ou token persistente é transferido à central.

Variáveis ausentes preservam conexão direta anterior. Configuração inválida bloqueia a nova conexão. Domínios personalizados fora de `WHATSAPP_SIGNUP_TENANT_DOMAIN` não são aceitos. Publicação em produção exige configuração própria e autorização do domínio central escolhido na Meta.

## Fluxo existente

Configurações → Pedidos e alertas → WhatsApp dos pedidos oferece conexão via Meta, status dos modelos, atualização e desconexão. Salve primeiro o celular do restaurante. O cadastro manual permanece em Configuração avançada.

Configuração do provider e segredos ficam no backend. Nenhum App Secret, token ou PIN deve ser enviado ao navegador. Consulte `delivery-api/docs/meta-tech-provider.md` para o checklist Meta. App ID de staging: `2686155311811975`; App Secret e Configuration ID foram encontrados cadastrados em staging em 26/10/2026.

Callback público de staging: `https://dev-terraco-canecao.flyfoods.com.br/api/meta/whatsapp/webhook`. Essa rota encaminha challenge e corpo original assinado para o backend interno, sem sessão de admin. Mutações de conexão e configuração exigem sessão e origem do admin.

O SDK recebe Configuration ID de configuração v4 e retorna código de autorização. Eventos só são aceitos de origens Facebook exatas; código e evento de conclusão podem chegar em qualquer ordem. CANCEL/ERROR não alteram a conexão; outros tipos de migração exigem suporte.

O botão único **Conectar WhatsApp** envia `featureType: whatsapp_business_app_onboarding` e `sessionInfoVersion: 3`, habilitando na Meta a escolha entre cadastrar um número e conectar o WhatsApp Business existente. O frontend aceita `FINISH` para cadastro padrão e `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING` para coexistência, inclusive sem `phone_number_id`; nesse caso, o backend resolve o número salvo do restaurante dentro da WABA autorizada e confirma coexistência na Graph.

O usuário precisa manter o WhatsApp Business atualizado e aberto durante a conexão; WhatsApp comum não é compatível. A Meta determina elegibilidade. O backend inicia sincronização de contatos e histórico exigida pelo onboarding e reconhece webhooks sem armazenar conversas. O admin identifica coexistência ativa e orienta como revogar a conexão pelo aplicativo. A autorização local pode ser removida pelo botão Desconectar.

Conexão não ativa avisos. O cliente acompanha aprovação de três modelos e configura cobrança na Meta antes de habilitar notificações, com consentimento dos destinatários.

Validação: `npx tsc --noEmit`, ESLint dos arquivos alterados, `node --test src/views/AdminSettings/whatsappEmbeddedSignup.test.mjs`, build e inspeção desktop/mobile. Fluxo visual foi exercitado com SDK e API simulados; conexão real depende da configuração externa.
