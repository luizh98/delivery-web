---
version: 1
slug: "delivery-web-src-views-tableorders-index-tsx"
primary_target: "delivery-web/src/views/TableOrders/index.tsx"
related_targets: ["delivery-web/src/views/Home/CustomerMenu.tsx","delivery-web/src/views/Home/MenuCatalog.tsx","delivery-web/src/components/TableServiceAlerts/index.tsx"]
---

# Design

Estender identidade existente e prévia aprovada, modo Operate. Sem novo mundo visual. Catálogo atual é autoridade para busca/categorias/produtos/carrossel/sacola. Cores do tenant, alvos de toque acessíveis, texto além de animação.

`MenuCatalog` recebe menu, token opcional e disponibilidade; contém estado e interações da busca até sacola. `CustomerMenu` compõe cabeçalho delivery ou salão + mesmo catálogo. Navegação de produto com token retorna ao `/menu`.

Consulta pública `GET /api/public/tables/{token}/orders?participationId=...` projeta somente sessão e itens/status/totais. Cliente consulta sessão esperada; sessão ausente/encerrada/alterada retorna consumo vazio. Chamados usam endpoint existente e origem pública explícita na auditoria. Eventos existentes + polling mantêm alertas atualizados.

Página consumo separada usa sessão atual obtida ao entrar, congela vínculo durante polling e não adota outra sessão silenciosamente. Alerta compartilhado consulta operações para ADMIN/WAITER; admin recebe banner e salão destaque nas mesas e motivos. Fecha conta só via equipe. Sem integração financeira nova.

## Contrato visual confirmado

THESIS: Cliente identifica mesa, escolhe produtos no catálogo existente e acompanha consumo sem conta de delivery.

OWN-WORLD: Extensão do sistema visual atual: Plus Jakarta Sans, superfícies claras, bordas sutis, cores por tenant e ícones Lucide. Não há mudança de identidade.

STORY: Cabeçalho do restaurante e mesa → catálogo compartilhado → sacola → consumo da visita → chamado à equipe.

FIRST VIEWPORT: Cardápio conserva banner e catálogo atuais; cabeçalho troca login por identificação da mesa. Consumo mostra voltar, título, mesa, estado e rodadas, com total e ações abaixo.

FORM: Busca/categorias/produtos/sacola vêm do componente extraído; consumo em coluna legível, rodadas agrupadas e total destacado. Chamados têm mesa/motivo explícitos e pulsação suave até assumir.

BEHAVIOR: Tela de consumo atualiza a cada 5 segundos; alertas usam SSE com fallback 10 segundos. Movimento reduzido remove pulsação. Conta encerrada limpa conteúdo e sessão antiga não acompanha próxima visita.

BUILD PATH: Código existente é autoridade do catálogo por instrução explícita posterior à prévia. Imagem anterior é referência de hierarquia do consumo, não contrato de reprodução pixel a pixel; sem novas imagens de produção.

## Revisão de acesso à Comanda — 05/11/2026

Usuário solicitou trocar Meus pedidos por Comanda no salão, acentos de cor primária na consulta e remoção do atualizar manual. Total e ações precedem pedidos; leituras automáticas sem sobreposição. No salão, resumo/total e ações pedir fechamento/reabrir/encerrar ficam acima das abas; mobile tem acesso direto Comanda. Permissões existentes e catálogo preservados. Requisitos em `.specs/features/comanda-access/spec.md` no workspace pai.
