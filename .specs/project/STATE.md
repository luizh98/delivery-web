# State

**Last Updated:** 2026-08-25
**Current Work:** Total de desconto no carrinho e finalização - concluída

---

## Recent Decisions (Last 60 days)

### AD-001: Endereço em página dedicada (2026-08-06)

**Decision:** Substituir modal de endereço por `/cart/address`.
**Reason:** Teclado virtual continuava cortando formulário dentro do modal.
**Trade-off:** Navegação adicional entre checkout e endereço.
**Impact:** Novo e editar endereço usam página com scroll natural e retornam à etapa 2.

---

### AD-002: Alerta sonoro configurado por navegador (2026-08-25)

**Decision:** Manter o notifier no layout protegido e mover seu controle para um
checkbox nas configurações, persistido em `localStorage`.
**Reason:** Autoplay exige gesto no navegador e a preferência pertence ao dispositivo,
enquanto pedidos auto-confirmados precisam ser detectados por ID, não por status.
**Impact:** Cada ID novo entra na fila de áudio; `RECEIVED` continua gerando lembrete
a cada polling de cinco segundos.

---

## Active Blockers

Nenhum.

---

## Lessons Learned

### L-001: Autoplay precisa de gesto após carregar o admin

**Context:** Alerta de novo pedido era iniciado por polling depois do login.
**Problem:** Chrome retornava `NotAllowedError` porque o clique no login aconteceu no documento anterior à navegação.
**Solution:** Expor `Ativar som` dentro do admin para reproduzir o áudio sob gesto explícito e manter o notifier no layout protegido.
**Prevents:** Alertas silenciosamente bloqueados por política de autoplay após login ou recarga.

---

### L-002: Ativação não deve depender do elemento MP3

**Context:** Alguns navegadores recusaram o `play()` mesmo após o clique explícito.
**Problem:** O elemento de áudio era criado antes do gesto e a exceção era descartada.
**Solution:** Criar e liberar um `AudioContext` no próprio clique, gerar o sinal localmente e exibir o nome da exceção quando houver falha.
**Prevents:** Falhas por download, codec, elemento de mídia obsoleto e diagnóstico genérico.

---

## Quick Tasks Completed

| # | Description | Date | Commit | Status |
| --- | --- | --- | --- | --- |
| 006 | Manter somente Meus pedidos no cardápio | 2026-08-06 | `fix(menu): keep only orders history shortcut` | ✅ Done |
| 007 | Corrigir primeiro toque no botão Continuar do carrinho mobile | 2026-08-06 | `fix(cart): handle continue on first mobile tap` | ✅ Done |
| 010 | Padronizar cabeçalho e retorno do status do pedido | 2026-08-06 | `feat(tracking): standardize order status header` | ✅ Done |
| 009 | Manter foco na busca de endereço sem rolar o modal | 2026-08-06 | `fix(cart): keep address search focused` | ✅ Done |
| 011 | Manter busca de endereço visível acima do teclado | 2026-08-06 | `fix(cart): keep address search visible above keyboard` | ✅ Done |
| 012 | Exibir campos de endereço somente após seleção | 2026-08-06 | `fix(cart): reveal address fields after selection` | ✅ Done |
| 013 | Adicionar scroll interno ao modal de endereço | 2026-08-06 | `fix(cart): add inner scroll to address modal` | ✅ Done |
| 015 | Padronizar cor dos botões primários com a categoria da home | 2026-08-06 | `style(button): match home category color` | ✅ Done |
| 001 | Localizar enums e imprimir pedido no admin | 2026-08-06 | `901cebd` | ✅ Done |
| 016 | Tornar alerta de novo pedido global e ativável no admin | 2026-08-24 | `fix(admin): play new order sound across admin` | ✅ Done |
| 017 | Repetir alerta enquanto houver pedido recebido | 2026-08-24 | `fix(admin): repeat sound for received orders` | ✅ Done |
| 018 | Corrigir ativação do som no navegador | 2026-08-24 | — | ✅ Done |
| 019 | Exibir total de desconto no carrinho e na finalização | 2026-08-25 | `feat(cart): show total discount in checkout` | ✅ Done |

---

## Deferred Ideas

Nenhuma.

---

## Todos

Nenhum.

---

## Preferences

**Model Guidance Shown:** never
