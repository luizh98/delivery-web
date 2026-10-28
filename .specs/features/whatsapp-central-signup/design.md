# Desenho

Painel autenticado cria tentativa pelo endpoint existente e abre `/integrations/whatsapp` no domínio central. Fragmento contém somente origem de retorno e nonce aleatório, removidos assim que a central inicia. Handshake READY → INIT entrega configuração pública do SDK. Usuário confirma na central com clique explícito, preservando ativação necessária para popup Meta.

Central valida origem contra domínio de tenants configurado e referência do opener. Painel aceita resultado exclusivamente da janela aberta, origem central exata e nonce. Código OAuth e evento validado retornam por postMessage com targetOrigin exato; apenas painel original chama signup/complete com cookie HttpOnly, proteção same-origin e attemptId existente, vinculado no backend a admin/tenant e prazo de cinco minutos.

Página central tem layout independente de cardápio, tracking e autenticação de clientes. Não busca dados do restaurante central. Sem JWT ou segredos compartilhados entre hosts. Configuração runtime pelo endpoint no-store `/api/whatsapp-signup/config`: WHATSAPP_SIGNUP_ORIGIN e WHATSAPP_SIGNUP_TENANT_DOMAIN. Sem configuração mantém fluxo anterior. HTTPS obrigatório, HTTP somente localhost em testes.

Reuso: loadMetaSDK, parseMetaSignupMessage, Button, estilos e API de tentativa existentes. Não adicionar dependências nem endpoints Go.

Limite: dois cliques (painel e continuar na Meta); fechar painel original invalida continuação. Domínios personalizados fora do domínio configurado não são autorizados.
