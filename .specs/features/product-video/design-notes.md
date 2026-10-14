# Vídeo do produto — registro visual

## Autoridade e escopo

Extensão da identidade existente, conforme `spec.md`. Contexto de produto lido em `delivery-web/PRODUCT.md` do checkout principal: mobile-first, pedido direto e identidade por tenant. `DESIGN.md` ausente; esta extensão não exige criar identidade, tokens globais ou documentação de sistema nova.

## Evidências conferidas no código

- `src/app/globals.css`: fonte Plus Jakarta Sans e aliases de tema para cores primária/secundária por tenant, superfícies, texto e bordas. Sem alteração nesta feature.
- `src/components/Button/*`: CTA reutiliza botão existente; cor primária continua `var(--color-primary)`, altura de 2,75 rem, cantos de 0,375 rem e estados incumbentes. Cadastro reutiliza `Field`, `Muted` e variantes `outline`/`dangerText` de `Button`.
- `src/views/Home/*`: cards e carrossel mantêm foto e composição incumbentes. Selo textual “Vídeo”, com ícone, indica disponibilidade; nenhum player é montado na lista.
- `src/views/ProductDetails/ProductMedia.tsx`: player silencioso, `playsInline`, poster e fallback para foto em erro. Autoplay respeita preferência de movimento reduzido. Foto e vídeo usam `cover` centralizado na visualização normal e ampliada, conforme ajustes solicitados em 14/10/2026, preenchendo o quadro sem faixas adicionadas pelo player.
- `src/views/ProductDetails/styles.ts`: quadro de mídia usa 65dvh, mínimo de 16 rem e máximo de 48 rem. Ampliação ocupa viewport; descrição possui rolagem própria e CTA permanece na faixa inferior, com safe area. Layout ampliado muda para duas colunas em `@md`.
- `src/views/ProductDetails/index.tsx`: ampliação usa `dialog.showModal()`, nome acessível, fechamento por Escape e retorno de foco ao acionador. CTA ampliado chama o mesmo fluxo de adicionar; opcionais obrigatórios levam foco ao grupo inválido.

## Compatibilidade e deriva preexistente

Comparação com `HEAD` confirma manutenção dos componentes e aliases do tema. Preto/branco na mídia são tratamento local de apresentação; CTA mantém identidade do tenant. Uso anterior de branco e cinza literais no overlay, vermelho literal em erro e cores literais dos selos já existia em `ProductDetails/styles.ts`. Variantes de perigo do botão também já usavam cores literais. Registrado como prática incumbente fora do escopo; nenhum reparo global realizado.

Revisão visual anterior informou `ship`, sem mudança material; detector informou `[]`. Este registro não transforma esses resultados em nova inspeção de navegador.

## Limites

### Foto e barra de compra — 14/10/2026

Foto passa a preencher quadro sem faixas, com recorte central. Barra de quantidade/compra usa `sticky` em todos os tamanhos e participa do fluxo, dispensando reserva fixa de 7 rem no PageShell. Margens compensam padding do conteúdo; observação fica a 1 rem da barra quando página chega ao final. Article usa `overflow: clip` para preservar recorte visual sem criar contêiner de rolagem que impediria sticky. Opcionais continuam antes da observação, mantendo compra acessível durante rolagem.

### Reprodução sem controles — 14/10/2026

Player do cliente mantém loop e reprodução silenciosa, sem controles nativos, PiP ou reprodução remota. Clique/toque alterna pausa; Enter/Espaço oferecem a mesma ação com foco visível e nome acessível atualizado. Detalhe e ampliação usam o mesmo componente. Autoplay continua respeitando movimento reduzido; foto de fallback e ações de compra permanecem.

Admin recomenda exportação vertical de 1080 × 1920 pixels (9:16), com prato centralizado e sem faixas pretas. Resolução é orientação, sem nova restrição de upload. O preenchimento pode recortar bordas; faixas gravadas dentro do arquivo continuam fazendo parte do vídeo.

Conferência estática de contrato, componentes, estilos e diff. Browser, testes, contraste calculado e dispositivos reais não executados neste passe de documentação. Verificação visual em execução pertence às evidências da revisão anterior e às verificações de publicação do responsável pela feature.
