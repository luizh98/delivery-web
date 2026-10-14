# API do relatório de upsells
Type: task
Status: resolved
Requirements: R1, R2, R3, R4

Implementar handler e agregação histórica em delivery-api/internal/app/upsell_report.go; registrar server.go; testar upsell_report_test.go. Reutilizar validação e autorização existentes. Concluir após testes Go e vet, com commit independente.

## Answer
Commit API 3a77d53. 254 testes Go aprovados, seis integrações opt-in sem Mongo local; go vet aprovado. Testes novos cobrem finanças, quantidade, snapshots, fuso, campanha, dias vazios, cancelados/pendentes, legado/gratuito, método, token ausente, tenant diferente, role STANDARD e datas inválidas. Duas falhas da suíte geral sob restrição de localhost passaram fora do sandbox.
