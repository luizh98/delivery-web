import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = ts.transpileModule(readFileSync(new URL("./index.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

for (const media of [
  { imageUrl: "https://example.com/photo.jpg" },
  { imageUrl: "https://example.com/photo.jpg", videoUrl: "https://example.com/video.mp4" },
  { imageUrl: "" },
]) {
  test(`shares direct tenant product link with media ${JSON.stringify(media)}`, () => {
    const opened = [];
    const compiled = { exports: {} };
    runInNewContext(source, {
      exports: compiled.exports,
      URL,
      window: {
        location: { origin: "https://dev-restaurante.flyfoods.com.br", search: "?table=private&campaign=upsell" },
        open: (...args) => opened.push(args),
      },
      sessionStorage: { getItem: () => null },
      require: (name) => {
        if (name === "react") return {
          useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
          useRef: (value) => ({ current: value }), useEffect: () => {},
        };
        if (name === "next/navigation") return { useRouter: () => ({}) };
        if (name === "@/components/CartProvider") return { useCart: () => ({ items: [], addItem: () => {} }) };
        if (name === "@/components/TrackingProvider") return { useTracking: () => ({}) };
        if (name === "@/utils/productFlags") return { activeProductFlags: () => [] };
        if (name === "react/jsx-runtime") return require(name);
        return new Proxy({}, { get: (_, key) => key });
      },
    });
    const product = { id: "item/ç &1", name: "Açaí & pão #1 🥖", optionGroups: [], ...media };
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) node.forEach(visit);
      else if (node?.props) { nodes.push(node); visit(node.props.children); }
    }
    visit(compiled.exports.ProductDetails({ product }));
    const share = nodes.find((node) => node.props["aria-label"] === "Compartilhar produto no WhatsApp");
    assert.ok(share, "sharing is available with or without media");
    assert.equal(nodes.some((node) => /Ampliar/.test(node.props["aria-label"] ?? "")), false);
    assert.equal(nodes.filter((node) => node.type === "ProductMedia").length, 1);
    share.props.onClick();
    assert.equal(opened.length, 1);
    const [href, target, features] = opened[0];
    const link = new URL(href);
    assert.equal(link.origin, "https://wa.me");
    assert.equal(link.searchParams.get("text"), `${product.name}\nhttps://dev-restaurante.flyfoods.com.br/products/item%2F%C3%A7%20%261`);
    assert.equal(target, "_blank");
    assert.equal(features, "noopener,noreferrer");
  });
}
