# Validação — 2026-11-11

- 208 testes web passaram. Novos testes exercitam botões reais: +1/-1, type=button sem submissão, campo vazio→1, limites 1/999, recuperação de 1000→999, digitação conectada ao RHF e bloqueio dos três controles quando ocupado.
- Regressões do diálogo de abertura e envio existente passaram com useWatch. TypeScript, ESLint nos cinco arquivos alterados (sem erros/avisos), git diff --check e build de produção passaram.
- Detector mecânico Impeccable executado nos componentes/estilos alterados: sem achados. Mantidos tema, Button/Input e estilos compartilhados de Field; label explícito evita envolver botões num label de formulário.
- Navegador Chromium, prévia local sem API, usando GuestCountField, Button/Input, estilos e RHF reais. Confirmados clique +/−, digitação 42, clique/Space, resultado salvo 43, vazio inválido com aria-invalid/alerta, erro removido ao aumentar, limite máximo e ArrowDown nativo.
- Inspeção em 1280, 390 e 320px: todos os quatro botões medidos em 48×48px; documento sem overflow horizontal. Dois passes limitados: implementação inicial e confirmação após migrar watch para useWatch (remove avisos de incompatibilidade com compilador React).
- Screenshots preservados em C:/projetos-pessoais/delivery-app/.wiser-qca/table-guest-controls/evidences/preview-{1280,390,320}.png. Prévia usa tema/font fallback local; não representa página completa autenticada. Sem teste em aparelho físico nem gravação real na staging.
- Auditoria: nenhuma mudança backend ou escrita adicional. +/− modifica apenas formulário; salvar/abrir continua nos endpoints/contextos auditados existentes. Não foi necessário criar método de auditoria.
- Servidor e aba temporários encerrados. Alterações anteriores no checkout compartilhado preservadas. Publicação somente web staging; sem acompanhamento pós-push.
