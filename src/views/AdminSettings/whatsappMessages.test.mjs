import assert from "node:assert/strict";
import test from "node:test";
import { messageValidation, previewWhatsAppMessage, messageReviewStatus, messageSubmissionNotice } from "./whatsappMessageEditor.ts";

const parameters = [
  { key: "nome_cliente", label: "Nome", delivery: "Ana", pickup: "Ana", table: "Ana" },
  { key: "numero_pedido", label: "Pedido", delivery: "270003", pickup: "270003", table: "270003" },
  { key: "informacao_endereco", label: "Endereço", delivery: "📍 Endereço de entrega: Rua A, 305", pickup: "🏠 Retire seu pedido em: Avenida B, 100", table: "🍽️ Pedido para a mesa 12" },
];

test("preview resolves repeated and reordered parameters without interpreting their values as tokens", () => {
  const body = "Pedido {{numero_pedido}}, oi {{nome_cliente}}!\n{{informacao_endereco}}\nObrigado, {{nome_cliente}}!";
  assert.equal(messageValidation(body, parameters), "");
  assert.equal(previewWhatsAppMessage(body, parameters, "pickup"), "Pedido 270003, oi Ana!\n🏠 Retire seu pedido em: Avenida B, 100\nObrigado, Ana!");
  assert.match(previewWhatsAppMessage(body, parameters, "delivery"), /Rua A/);
  assert.match(previewWhatsAppMessage(body, parameters, "table"), /mesa 12/);
  assert.equal(previewWhatsAppMessage("Olá {{nome_cliente}}!", [{ ...parameters[0], delivery: "{{numero_pedido}}" }], "delivery"), "Olá {{numero_pedido}}!");
});

test("validation matches server constraints and permits a message without parameters", () => {
  assert.equal(messageValidation("Pedido confirmado!", parameters), "");
  for (const body of ["", "{{nome_cliente}} oi", "Oi {{nome_cliente}}", "Oi {{nome_cliente}} {{numero_pedido}}!", "Oi {{inexistente}}!", "Oi {{nome_cliente} !", "a".repeat(1025), "Oi\tcliente", "Oi\n\n\ncliente"]) assert.notEqual(messageValidation(body, parameters), "", body);
  assert.equal(messageValidation("💛".repeat(1024), parameters), "", "count Unicode code points, not UTF-16 units");
});

test("review states distinguish uncertainty, rejection and approval", () => {
  assert.match(messageReviewStatus("SUBMISSION_UNCERTAIN"), /pendente/);
  assert.match(messageReviewStatus("REJECTED"), /Não aprovada/);
  assert.equal(messageReviewStatus("APPROVED"), "Aprovada");
});

test("submission notice reflects reused approval instead of claiming a new review", () => {
  const active = { name: "approved", body: "Pedido confirmado!", keys: [], status: "APPROVED" };
  const approved = messageSubmissionNotice({ draft: active.body, active });
  assert.match(approved, /já está aprovada e em uso/);
  assert.doesNotMatch(approved, /enviada para análise/);
  const candidate = { ...active, name: "next", status: "PENDING" };
  assert.match(messageSubmissionNotice({ draft: active.body, active, candidate }), /enviada para análise.*aprovada continua em uso/);
  assert.equal(messageSubmissionNotice({ draft: active.body, candidate }), "Mensagem enviada para análise pela Meta.");
  assert.match(messageSubmissionNotice({ draft: active.body, active, candidate: { ...candidate, status: "REJECTED" } }), /Não aprovada/);
});
