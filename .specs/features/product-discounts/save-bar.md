# Salvar produto durante edição

Pedido: ao editar produto, manter ação de salvar visível como na tela de Configurações.

Implementação: reutilizar `SaveBar` existente em `AdminSettings/styles.ts`, com botão de submit nativo, lembrete de salvar, estado de envio e bloqueio de cliques duplicados. Escopo: `AdminProducts/ProductManager.tsx`.

Verificar: edição exibe barra sticky na parte inferior em desktop/mobile; envio funciona; cancelamento e sucesso removem barra; criação mantém botão normal; TypeScript e lint do componente passam.

## Validação concluída

- Desktop 1440×1000 e mobile 390×844: barra visível no rodapé durante edição e rolagem.
- Envio para API isolada: botão mostra Salvando… e bloqueia clique repetido; salvar e cancelar encerram a edição e removem a barra.
- TypeScript, ESLint dos arquivos alterados e diff check passaram.
- Ajuste solicitado: preço com desconto e selo usam diretamente `var(--color-primary)`, sem mistura com preto. Cor computada conferida com a variável da tenant no próprio componente.
- Evidências: `.impeccable/review/product-save-desktop.png` e `product-save-mobile.png`.
- Revisão detectou erro residual ao trocar tipo de desconto: o zero inicial era validado antes da digitação. Troca agora redefine valor e limpa erro; validação no envio permanece. Cenário FIXED → PERCENTAGE → 20 repetido sem erro e envio válido confirmado.
- Revisão visual final: ship. Documentação: extensão do sistema existente, sem drift visual material.
- Deploy staging: commit `47cd720`, ação `cmuwmu2v9005u07l710rm6ojb`, sucesso em 06/10/2026; container running.
- Smoke após deploy: homepage e menu HTTP 200; JavaScript publicado contém componente de desconto e não contém as duas misturas antigas com preto.
