# Bloqueio de mesa/comanda

Configurações → Pedidos e alertas → **Bloquear mesa/comanda após o pedido do cliente**. Padrão desativado. Ativar vale para novas aberturas; desativar libera acesso imediatamente. Visitas anteriores à ativação seguem sem bloqueio. Equipe opera pelo painel normalmente.

Primeiro cliente que pede pelo QR Code torna-se responsável naquele navegador, sem login. A Comanda mostra código e **Compartilhar código**. Usa compartilhamento nativo quando disponível, cópia de texto/link como alternativa e permite selecionar código manualmente se APIs do navegador não estiverem disponíveis. Código não aparece na URL. Convidados entram pelo formulário no cardápio/sacola/Comanda e podem pedir e consultar consumo.

Identidade do dispositivo fica em cookie HttpOnly, host-only, sameSite=lax. Route Handler cria/encaminha token; SSR encaminha mesma identidade. Browser não escolhe cabeçalho de autorização da mesa. Respostas do proxy têm no-store; falha do backend também preserva cookie para retry. Bloqueio real está na API, inclusive quando página antiga ainda mostra botão de envio. Rascunho da sacola permanece ao recuperar acesso.

Código pertence à visita, não ao QR permanente. Fechar conta e abrir outra gera outro código e invalida convidados anteriores. Pedido de fechamento pendente/reabertura da mesma visita mantém vínculo. Limpar cookies/trocar de navegador exige código novamente; equipe mantém acesso para ajudar na operação, sem transferência automática de responsável.

## Verificação

`npm test`, `npx tsc --noEmit`, lint dos arquivos alterados e `npm run build`. Testes executam proxy/SSR, criação e preservação de identidade, erros, formulário, visita esperada, validação, compartilhamento/cópia/cancelamento/recuperação manual e configuração. Regressões existentes de sacola, delivery/retirada, consumo, salão, impressão e pagamentos permanecem na suíte. QCA e evidências em `.wiser-qca/table-order-access/` no workspace principal, fora do Git.
