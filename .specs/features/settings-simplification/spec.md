# Simplificação das configurações

## Objetivo
Reduzir esforço para localizar e editar configurações, preservando todos os campos, regras de validação, uploads e contratos de salvamento.

## Requisitos
- UX-01: reunir nome, contato e endereço em Restaurante.
- UX-02: reunir descrição, imagens, cores e prévia em Cardápio e aparência.
- UX-03: reunir cobrança, promoções e organização das rotas em Entregas; pedido mínimo pertence a Pedidos e alertas.
- UX-04: reunir horários semanais e datas especiais em Horários e feriados, sem acordeões aninhados.
- UX-05: manter Marketing separado, acordeões nativos e controles acessíveis em desktop/mobile.
- UX-06: manter salvamento visível, indicar alterações pendentes e explicitar aplicação imediata do som neste navegador.
- UX-07: abrir seção com erros ao salvar e focar campo inválido; preservar rascunho ao fechar seções.

## Execução
1. Reorganizar SettingsForm.tsx, OperatingHoursEditor.tsx e styles.ts, reaproveitando componentes e lógica existentes.
2. Verificar inventário de campos e variantes com settings.test.mjs; executar testes existentes, TypeScript e lint dos arquivos alterados.
3. Inspecionar renderização real dos componentes em desktop/mobile. Prévia isolada não verifica sessão autenticada ou persistência no backend.

## Fora de escopo
Novas dependências, alterações no backend, novas configurações e substituição da identidade visual.

## Verificação
- UX-01 a UX-05: inventário de campos, variantes de rotas/faixas e datas especiais preservados por testes de renderização; seis seções independentes.
- UX-06: navegador confirmou indicador de alterações, estado de salvamento e aplicação imediata do som sem marcar formulário como alterado.
- UX-07: valor inválido em seção fechada revelou seção e focou `name`; correção enviou somente `{ name }` pelo contrato multipart existente.
- Navegador: adicionar/remover faixa e feriado funcionou; todos os blocos abertos em 1280, 768 e 390 px sem rolagem horizontal ou controles cortados.
- Inspeção visual concluída em desktop/mobile com componentes reais, tema existente e API simulada. Persistência no backend e sessão autenticada não foram exercitadas.
- Suite completa: 26 testes passaram antes da última asserção de agrupamento. Verificação final: 5 testes de configurações/horários, TypeScript (`--noEmit --incremental false`) e ESLint dos quatro arquivos alterados passaram.
