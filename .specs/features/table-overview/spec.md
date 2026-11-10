# Visão limpa das mesas

Data: 2026-11-10. Escopo médio; design e execução definidos abaixo.

## Requisitos

- R1: grade compacta no atendimento (`/hall`), preservando busca, seleção, chamados e rascunhos.
- R2: livre verde, ocupado vermelho e fechamento laranja em todos os tamanhos. Mobile privilegia cor e identificação; legenda e nomes acessíveis mantêm significado.
- R3: desktop (>=1024px) mostra status escrito, tempo desde `session.createdAt` e quantidade de pessoas. Comandas legadas não recebem dados inventados.
- R4: ADMIN/WAITER podem editar quantidade de pessoas na comanda aberta ou em fechamento. Campo inteiro de 1 a 999; ausência permanece não informada. Usuário confirmou inclusão editável em 10/11/2026.
- R5: alteração salva por sessão, isolada por tenant, com cobertura no Histórico de alterações.

## Decisões

Preservar identidade do admin e componentes existentes. Cards em fundo suave sem sombras, tipografia compacta e cores semânticas independentes da marca. Tempo acompanha polling existente de 10 segundos. Quantidade pertence à visita e pode ser preenchida após abrir a comanda pela primeira rodada; uma mesa livre não abre visita apenas para registrar pessoas.

Contrato: `PATCH /api/admin/table-operations/{tableId}/guests`, corpo `{sessionId: string, guestCount: integer}`. Sucesso 200 com `{guestCount}`; 400 entrada inválida; 401/403 autenticação/perfil/tenant; 409 sessão encerrada, substituída ou indisponível. GET existente retorna `session.guestCount` opcional. Persistência faz `$set` apenas nos campos `guestCount` e `updatedAt`, com filtro de tenant, mesa, sessão e status ativo. Usa coleção auditada e contexto autenticado. Evento existente avisa outras telas.

## Execução

1. Backend: campo, rota e testes de isolamento/auditoria → verificar testes Go → commit `feat(tables): save audited guest counts`.
2. Web: grade responsiva, tempo e edição → testes de regressão, lint, TypeScript, build e inspeção visual desktop/mobile → commit `feat(tables): simplify the table overview`.
3. Registrar evidências e limites neste documento e em STATE.md.

## Verificação — concluída

- R1–R4: 186 testes web; lint dos arquivos alterados; TypeScript e build de produção aprovados.
- R5: 427 testes Go aprovados com MongoDB local isolado (porta 27029, bases efêmeras removidas pelo harness). Teste novo exercita ADMIN/WAITER, recusa STANDARD, tenant divergente, outra mesa, sessão antiga/encerrada, limites e entrada fracionária, edição em fechamento e histórico com autor, tenant, origem `/hall`, documento e diferenças antes/depois. Segredo de participação não aparece nos registros.
- Auditoria: única nova gravação é `Store.collection("table_sessions").UpdateOne(r.Context(), ...)`, já interceptada. Autenticação anexa contexto de auditoria; origem `/hall` passou a ser preservada pelo mecanismo. Evento não persiste dado adicional. Nenhum novo método Mongo sem interceptação.
- Navegador: UI real via Next, backend sintético local, 320/390/768/1440px sem overflow. Busca, seleção por Enter, atualização por PATCH, contagem legada e apresentação responsiva aprovadas. Duas rodadas: primeira detectou divergência de relógio no SSR; corrigida com relógio inicializado após montagem e atualizado no polling. Segunda sem `pageerror`; houve aviso de atributo `caret-color: transparent` na entrada durante captura, sem erro funcional.
- Capturas e script de verificação locais: `../.scratch/table-overview-20261110/` a partir da raiz de delivery-web. Não houve teste em staging nem publicação.
- Alterações locais preexistentes de `Finalizar comanda` preservadas e excluídas do commit desta tarefa.
