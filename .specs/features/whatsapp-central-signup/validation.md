# Validação — 2026-10-28

- 104 testes Node passaram; TypeScript sem emissão, lint dos arquivos alterados, build Webpack, validação de landing pages, detector Impeccable e diff check passaram.
- Teste de navegador com painel e página central reais, backend e Meta simulados. Painel `http://localhost:3188`, central `http://central.localhost:3188`; tenants A/B via header de fixture. Guard same-origin da aplicação bloqueia mutações HTTP em `tenant-a.localhost`, comportamento existente preservado; só localhost literal é admitido para HTTP nesse proxy.
- SDK ausente no painel original, carregado somente na central. URL limpa após handshake; código OAuth fora de URL/storage. Desktop 1280x800 e mobile 390x844 sem overflow.
- Coexistência: callback do SDK antes do evento WABA-only; conclusão tenant-a com autenticação e attemptId originais.
- Cadastro padrão: evento antes do callback; conclusão tenant-b com seu próprio attemptId e autenticação.
- Cancelamento não acrescentou conclusão. Abertura direta sem opener exibiu orientação e não carregou SDK. Testes unitários rejeitaram origem falsa, janela diferente, nonce incorreto, replay e dados inválidos.
- Nenhum número real conectado, mensagem enviada, conta Meta alterada ou deploy de produção executado.

## Staging

Configurado somente `delivery-app-staging/delivery-web`:

```
WHATSAPP_SIGNUP_ORIGIN=https://dev-terraco-canecao.flyfoods.com.br
WHATSAPP_SIGNUP_TENANT_DOMAIN=flyfoods.com.br
```

Domínio existente já consta na lista Meta mostrada pelo usuário. Página central `/integrations/whatsapp`; manter SDK habilitado nesse host. Sem novo domínio/DNS e sem alteração em API.

Push funcional concluído em staging: `7af5573` (inclui a27ce27 e 129c39d). Após aguardar 60 segundos, testado diretamente sem consultar status de deploy.

- Configuração runtime retornou 200 com origem central e domínio permitidos.
- Página central retornou 200, com Referrer-Policy no-referrer e X-Frame-Options DENY. Abertura direta bloqueada, sem SDK e sem habilitar continuação.
- Harness temporário em `https://dev-terraco.flyfoods.com.br/` abriu central real em `https://dev-terraco-canecao.flyfoods.com.br/integrations/whatsapp`, usando configuração pública atual de staging. SDK verdadeiro da Meta carregou; botão Continuar na Meta habilitou. Encerrado pelo botão Cancelar, sem criar tentativa na API, vincular número ou autorizar conta.
- Primeiro acesso à página durante atualização retornou 404; repetição direta retornou 200. Nenhum status de build/deploy foi consultado.

Aprovação/autorização real na Meta requer ação do titular. Smoke autenticação/conclusão real não realizado; conclusão e isolamento dos tenants foram exercitados com API/Meta simuladas localmente.
