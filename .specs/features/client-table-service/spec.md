# Atendimento conforme relato do cliente — 20/11/2026

Fonte: áudio AUDIO-2026-11-19-21-45-48.m4a (120,8 s), transcrito localmente; complemento escrito: observação por pedido ao selecionar. Implementação e publicação staging autorizadas; Wiser QCA após 60 s, sem salvar evidências ou vídeos.

| ID | Critério de aceite | Fonte |
|---|---|---|
| CLI-01 | WHEN abre salão THEN pode escolher produtos antes de informar mesa/comanda; fotos existentes aparecem, busca e categorias preservadas. | áudio 0–21 s |
| CLI-02 | WHEN seleciona qualquer produto THEN editor permite quantidade, adicionais e observação; revisar, editar, duplicar e excluir antes de enviar. | complemento escrito |
| CLI-03 | WHEN conclui seleção THEN informa comanda e mesa (ou mesa compartilhada), preserva contato e nome opcional; visita atual revalidada, fechamento impede envio; retry não duplica. | áudio 16–30 s |
| CLI-04 | WHEN envia rodada mista THEN comida vai à Cozinha e bebida ao Bar, com mesa/comanda, contato, horário e itens/observações, sem valores/subtotal no cupom de produção. | áudio 30–70 s |
| CLI-05 | WHEN garçom pede conta após entrega THEN solicita fechamento e enfileira conferência no destino Recibo/caixa; nenhum pagamento/encerramento é registrado. Repetição não duplica impressão automática. Falha de impressão tem aviso recuperável. | áudio 70–106 s |
| CLI-06 | WHEN opera como garçom deste cliente THEN pagamentos e encerramento financeiro ficam com ADMIN (gerente); conta permanece pendente até lançamento administrativo. | áudio 106–120 s |
| CLI-07 | WHEN há gravação THEN histórico cobre autor, tenant, origem e diferenças, preservando sigilos e efeitos indiretos. | AGENTS.md |
| CLI-08 | WHEN publicado staging THEN QCA cobre fluxo completo, permissões, regressões, retry e celular/desktop; sem vídeo ou arquivos de evidência. | instrução escrita |

Fora do escopo: integração de maquininha, recebimento bancário, novo perfil gerente, fechamento automático no fim do dia, impressão física sem hardware disponível, main.

Decisões: ADMIN representa gerente. Usuário confirmou que a restrição de recebimento vale somente para este cliente; manter configuração por tenant e desligar waiterCheckoutEnabled no staging do Terraço. Foto mencionada no áudio não foi anexada; não alegar reprodução desse impresso específico.
