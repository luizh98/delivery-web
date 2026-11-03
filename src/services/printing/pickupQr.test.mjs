import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import QRCode from "qrcode";
import sharp from "sharp";
import { BinaryBitmap, HybridBinarizer, QRCodeReader, RGBLuminanceSource } from "@zxing/library";

const module = { exports: {} };
runInNewContext(ts.transpileModule(readFileSync(new URL("./pickupQr.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports });
const { splitPickupQr, pickupPrintData } = module.exports;
const code = "flyfoods:pickup:v1:123:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const receipt = `PEDIDO #123\nMOTOBOY: LEIA PARA RETIRAR O PEDIDO\n[[FLYFOODS_QR:${code}]]\n`;

test("only a valid final QR trailer produces printer commands; receipt text cannot inject them", () => {
  assert.equal(splitPickupQr(receipt).qrCode, code);
  const printed = pickupPrintData(receipt);
  assert.ok(printed.includes(code));
  assert.ok(!printed.includes("[[FLYFOODS_QR:"));
  assert.ok(printed.endsWith("\n\n\x1ba\x00"));
  for (const invalid of [receipt + "OBSERVACAO", receipt.replace("v1:", "v2:"), receipt.replace(":123:", ":123\x1b:")]) {
    assert.equal(splitPickupQr(invalid).qrCode, null);
    assert.ok(!pickupPrintData(invalid).includes("\x1b"));
  }
  assert.equal(pickupPrintData("Obs: \x1b\x1d\x00rápido"), "Obs: rápido");
});

test("printed QR image decodes to exact pickup payload with shipped ZXing decoder", async () => {
  const dataUrl = await QRCode.toDataURL(splitPickupQr(receipt).qrCode, { width: 240, margin: 4, errorCorrectionLevel: "M" });
  const { data, info } = await sharp(Buffer.from(dataUrl.split(",")[1], "base64")).greyscale().raw().toBuffer({ resolveWithObject: true });
  const image = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(new Uint8ClampedArray(data), info.width, info.height)));
  assert.equal(new QRCodeReader().decode(image).getText(), code);
});
