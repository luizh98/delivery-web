# Domínios dedicados de integração

## Pedido

Adotar `integration.flyfoods.com.br` em produção e `dev-integration.flyfoods.com.br` em staging, conforme correção explícita do usuário em 2026-10-28. Continuação da feature whatsapp-central-signup, pelo fluxo tlc-spec-driven.

## Entrega

1. Reutilizar DNS wildcard existente e criar rotas HTTPS explícitas nos respectivos serviços web, preservando portas 80/3000.
2. Configurar WHATSAPP_SIGNUP_ORIGIN por ambiente e domínio de tenants flyfoods.com.br. Preservar API, sessões e credenciais originais; PORT=80 explícito em produção conserva roteamento existente.
3. Promover implementação central já testada para main; publicar documentação/runtime em ambas branches. Publicação encerra no push, sem acompanhamento de deploy.

## Verificação pré-publicação

- Cherry-picks 042a97f, bd05573, e6802c7 e f9d757f resultaram em árvore idêntica à staging validada (git diff origin/staging HEAD vazio).
- 13 testes de relay, Embedded Signup e mensagens passaram na base main preparada; diff check passou.
- Build, TypeScript, lint, 104 testes completos e navegador em duas origens foram validados na implementação original, sem mudança funcional nesta adoção de domínios.
- Inspeção prévia dos serviços; DNS wildcard preservado; variáveis e rotas adicionadas sem erros.

## Limites

Adicionar ambos hosts HTTPS no JSSDK da Meta continua ação do titular. Cadastro solicitado; não houve autorização real de conta, vínculo de número ou teste OAuth completo. Nenhuma consulta de build/deploy após push.
