import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const loaded = { exports: {} };
const jsx = (type, props) => ({ type, props });
runInNewContext(ts.transpileModule(readFileSync(new URL("./GuestCountField.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText, {
  exports: loaded.exports,
  require(name) {
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (name === "react") return { useId: () => "people" };
    return new Proxy({}, { get: (_, key) => String(key) });
  },
});

function render(value, disabled = false) {
  const changes = [];
  const typed = [];
  const registration = { name: "guestCount", onChange: (event) => typed.push(event.target.value) };
  const tree = loaded.exports.GuestCountField({ label: "Pessoas", value, registration, disabled, onChange: (value) => changes.push(value) });
  const controls = tree.props.children[1].props.children;
  return { minus: controls[0], input: controls[1], plus: controls[2], changes, typed };
}

test("people buttons increment and decrement one without submitting the form", () => {
  const view = render("4");
  view.plus.props.onClick();
  view.minus.props.onClick();
  assert.deepEqual(view.changes, ["5", "3"]);
  assert.equal(view.plus.props.type, "button");
  assert.equal(view.minus.props.type, "button");
});

test("people controls support empty input and enforce minimum and maximum", () => {
  const empty = render("");
  assert.equal(empty.minus.props.disabled, true);
  empty.plus.props.onClick();
  assert.deepEqual(empty.changes, ["1"]);
  assert.equal(render("1").minus.props.disabled, true);
  assert.equal(render("999").plus.props.disabled, true);
  const high = render("1000");
  high.minus.props.onClick();
  assert.deepEqual(high.changes, ["999"]);
});

test("people input stays editable, connected to RHF and disabled while busy", () => {
  const view = render("4");
  view.input.props.onChange({ target: { value: "27" } });
  assert.deepEqual(view.typed, ["27"]);
  assert.notEqual(view.input.props.readOnly, true);
  for (const control of [render("4", true).minus, render("4", true).input, render("4", true).plus]) assert.equal(control.props.disabled, true);
});
