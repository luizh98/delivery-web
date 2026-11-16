import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

test("bill print locks rapid clicks and retries uncertain requests with same key", async () => {
 const writes=[];const messages=[];let attempt=0;let uuid=0;let release;
 const loaded={exports:{}};const jsx=(type,props)=>({type,props});
 const source=ts.transpileModule(readFileSync(new URL("./BillPrintButton.tsx",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 runInNewContext(source,{module:loaded,exports:loaded.exports,crypto:{randomUUID:()=>String(++uuid)},require(name){
 if(name==="react/jsx-runtime")return {jsx,jsxs:jsx};
 if(name==="react")return {useState:v=>[v,()=>{}],useRef:current=>({current})};
 if(name==="@/components/ToastProvider")return {useToast:()=>({showToast:m=>messages.push(m)})};
 if(name==="./draft")return {staffApiMessage:(_,fallback)=>fallback};
 if(name==="@/services/api/client")return {ApiError:class extends Error{},clientApi:async(url,options)=>{writes.push(JSON.parse(options.body));if(++attempt===1){await new Promise(r=>release=r);throw new Error("connection lost");}return {};}};
 return new Proxy({},{get:(_,key)=>String(key)});
 }});
 const button=loaded.exports.BillPrintButton({tableId:"command",sessionId:"visit",disabled:false});
 button.props.onClick();button.props.onClick();assert.equal(writes.length,1);
 release();await new Promise(r=>setImmediate(r));button.props.onClick();await new Promise(r=>setImmediate(r));
 assert.equal(writes.length,2);assert.equal(writes[0].submissionId,writes[1].submissionId);assert.equal(writes[1].sessionId,"visit");
 button.props.onClick();await new Promise(r=>setImmediate(r));assert.notEqual(writes[2].submissionId,writes[1].submissionId);
 assert.ok(messages.includes("Conferência enviada à impressora configurada."));
});
