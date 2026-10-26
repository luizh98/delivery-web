# Coexistência WhatsApp — web — 2026-10-26

Especificação canônica: repositório delivery-api, `.specs/features/whatsapp-coexistence/spec.md`. Registro tlc-spec-driven solicitado após implementação local; não representa planejamento anterior ao código.

## Contrato e critérios

- COEX-01: aceitar evento oficial de coexistência, inclusive com apenas waba_id; manter evento distinto de FINISH e validar origem Facebook exata e IDs numéricos. Cancelamento, erro e outros tipos de migração não concluem conexão. Verificação: whatsappEmbeddedSignup.test.mjs.
- COEX-07: manter botão principal para cadastro padrão e adicionar Conectar mantendo aplicativo com featureType=whatsapp_business_app_onboarding e sessionInfoVersion=3, reutilizando Configuration ID v4. Bloquear ação durante conexão ou sem SDK/configuração/celular salvo. Mostrar estado de coexistência e instrução para desconectar pelo WhatsApp Business. Verificação: TypeScript, lint e build.
- Nenhum segredo Meta no browser; não ativar avisos automaticamente nem alterar contrato do consentimento/pagamento. Conversas continuam no aplicativo e não são armazenadas pelo FlyFoods.

## Entrega

Um commit web compilável com parser, integração do SDK, UI, tipo de resposta, teste e guia. Validação final: 81 testes, TypeScript e ESLint aprovados na base staging atualizada; build aprovado anteriormente com os mesmos arquivos de código. Publicação autorizada; encerrar após push, conforme AGENTS.md. API: 63 testes WhatsApp/Meta e build aprovados; suíte completa tem uma falha preexistente de impressão, reproduzida na base limpa remota.

Homologação real depende da API publicada, assinaturas de webhook e número elegível no WhatsApp Business. WhatsApp comum não suporta esse fluxo. Elegibilidade e entrega real ainda não verificadas.
