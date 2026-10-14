# Vídeo do produto

## Requisitos
- R1: cadastrar um vídeo MP4/H.264 de até 15 segundos e 20 MB; imagem obrigatória.
- R2: validar arquivo e duração no servidor, sem confiar em metadados enviados pelo cliente.
- R3: clique no card/imagem abre detalhes com vídeo grande, sem som inicialmente, controles e reprodução em linha. Sem vídeo ou com falha, mostrar foto.
- R4: manter descrição e ação de adicionar acessíveis; preservar quantidade, opcionais e fluxo de carrinho.
- R5: permitir substituir/remover vídeo. Bloquear remoção de imagem enquanto houver vídeo.
- R6: publicar somente em staging e conferir deploy.

## Direção
Estender identidade atual. Mobile-first, mídia de até 65dvh no detalhe; ampliação ocupa espaço disponível, descrição rolável e ação fixa. Vídeos carregados somente no detalhe, nunca na lista. Retrato recomendado, proporção preservada sem cortar o produto. Usuário confirmou reprodução inicial sem som com controles.

## Execução
1. API: modelos, resposta, multipart, armazenamento, ffprobe no Docker e testes de validação.
2. Cadastro: tipo Product, upload, prévia, mensagens e remoção segura.
3. Detalhes: mídia, ampliação acessível, descrição e ação persistente.
4. Verificação: testes, lint, build, inspeção desktop/mobile e revisão Impeccable.
5. Publicação: commits atômicos, push staging, saúde e versão ativa.

## Verificação
- API: go test ./... e go vet ./... passaram. Testes com arquivos reais aceitaram 1s/15s e rejeitaram 16s, truncamento, formato inválido, codecs e duração inválidos. Regras de imagem/remoção, preservação e resposta pública/admin cobertas.
- Web: build com TypeScript passou; 64 testes existentes passaram; ESLint nos arquivos alterados passou. Lint global tem 3 erros preexistentes em AdminDashboard/Printer e um warning legado.
- Browser local com fixtures isoladas: 390x844/1440x900, autoplay mudo, controls/playsInline, dialog/escape/retorno de foco, pausa de mídia anterior, carrinho simples e opcionais, foto sem vídeo, fallback404 antes da hidratação e movimento reduzido passaram.
- Cadastro: rejeição de 16s, prévia3s, bloqueio de remover imagem com vídeo e multipart de salvar com vídeo passaram, usando backend mock local.
- Detector Impeccable: []; finish reviewer: ship. Documenter registrou preservação em design-notes.md.
- Publicação e armazenamento de staging: em conferência.
- Referência técnica para ffprobe: https://ffmpeg.org/ffprobe.html.
