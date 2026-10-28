# Conexão WhatsApp centralizada — staging

## Objetivo

Permitir conexão Meta a partir de vários subdomínios sem cadastrar cada tenant no JSSDK. Domínio central inicial: https://dev-terraco-canecao.flyfoods.com.br, já autorizado pelo usuário na Meta.

## Requisitos P1

- WCS-01: WHEN admin inicia conexão THEN SDK SHALL executar somente em página do domínio central configurado no servidor.
- WCS-02: WHEN janela central devolve resultado THEN painel SHALL validar origem exata, referência da janela e nonce aleatório por tentativa. Conclusão SHALL usar sessão autenticada original e tentativa de uso único existente na API.
- WCS-03: WHEN tentativa expira, janela fecha ou usuário cancela THEN SHALL encerrar fluxo, remover listeners e preservar conexão anterior. Mensagens inválidas/repetidas SHALL ser ignoradas.
- WCS-04: WHEN Meta envia FINISH ou FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING THEN SHALL manter ambos fluxos existentes e permitir qualquer ordem entre código e evento.
- WCS-05: WHEN ambiente não configura domínio central THEN SHALL preservar fluxo direto existente. Produção SHALL permanecer inalterada nesta entrega.
- WCS-06: WHEN central é aberta diretamente, de origem não permitida ou sem opener THEN SHALL negar operação. JWT, tokens persistentes e segredos SHALL permanecer no painel/API; código transitório não SHALL entrar em URL ou storage.

## Verificação

Testes Node para validações e ciclo de vida; TypeScript/lint/build; navegador com Meta simulada em duas origens; smoke staging sem concluir autorização real. Teste real depende de ação do titular na Meta.

## Fora de escopo

Wildcard Meta, domínio novo, mudanças de produção, inbox/histórico, nova autenticação e substituição do Embedded Signup.
