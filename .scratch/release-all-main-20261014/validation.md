# Publicação de todo trabalho em main — 2026-10-14

Autorização: usuário solicitou subir tudo para main, incluindo alterações não commitadas da task.

## Integração

- Partida dos origin/main atuais: API aa8a73d; web 8bb8603.
- Staging promovida por merge, incluindo relatório de upsells e filtro compartilhado.
- Alterações não commitadas de delivery-web capturadas em 8f61b2a: estilos de preço/formulário, consentimento/privacidade, PRODUCT.md e configurações/evidências Impeccable. Históricos locais de telefone, status automático, impressão, configuração de entregas e paginação integrados.
- Evidências ainda não commitadas da task upsells (a7cd8a4) e acompanhamento (498cc36) incluídas. Checkouts originais preservados, sem reset/clean; agora limpos.
- API preserva também histórico staging local 3f9fc56. Mudanças dessa linha já eram equivalentes às da main; nenhuma funcionalidade de motoboy/eventos removida.
- Conflitos de cópias antigas resolvidos mantendo reconexão/SSE, WhatsApp, retirada por motoboy e respectivos testes de produção, além do filtro compartilhado/paginação novos. Documentos de estado combinados. Screenshots diferentes preservados com nomes distintos.
- merge-base --is-ancestor confirmou que main, staging e todos os heads locais selecionados estão contidos na integração final.

## Verificação antes do push

- 254 testes Go e go vet aprovados. Integrações opt-in de Mongo local não executadas; nenhuma migração necessária.
- 64 testes web, TypeScript, build Webpack e lint dos arquivos envolvidos aprovados. Dois erros anteriores de lint em effects do dashboard permanecem fora da integração.
- Browser local com fixtures: filtros/presets/calendário, cancelamento/Escape, ranking/paginação, estados/recuperação e navegação em Análises/Pedidos/Cozinha/Entregas aprovados; desktop/mobile sem overflow e sem erros de runtime.
- Nenhum segredo de ambiente adicionado. Arquivos ignorados/dependências mantidos fora dos commits.

## Publicação

Push main e confirmação do Easypanel pendentes. Nenhum dado/pedido/configuração de restaurante será alterado como parte da publicação. Smoke em produção será somente leitura com conta já existente.
