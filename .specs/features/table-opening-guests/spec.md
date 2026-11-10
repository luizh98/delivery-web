# Total de pessoas na abertura

- R1: ao enviar primeira rodada de mesa sem sessão, pedir contato e total de pessoas no diálogo existente.
- R2: exigir inteiro de 1 a 999; enviar `guestCount` junto da rodada. Cancelar mantém rascunho e não grava.
- R3: rodadas de sessão existente não solicitam nem sobrescrevem quantidade; edição posterior existente é preservada. Reenvio incerto conserva payload completo.
- Plano: implementar diálogo/envio; validar componente, tipos, lint e build; commit e push staging após API compatível.
