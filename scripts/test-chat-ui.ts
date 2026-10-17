import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createChatSession } from "../src/features/chatbot/chat-session";
import { MessageBubble } from "../src/features/chatbot/components/MessageBubble";
import { ChatInput } from "../src/features/chatbot/components/ChatInput";

async function main() {
  const source = { source: "guía.md", chunkIndex: 2, content: "<img src=x onerror=alert(1)> Evidencia", score: 0.73 };
  let calls = 0;
  let resolve!: (value: Response) => void;
  const requests: { messages: { role: string; content: string }[] }[] = [];
  const session = createChatSession(async (_url, options) => {
    calls++;
    requests.push(JSON.parse(options?.body as string));
    return new Promise<Response>((done) => { resolve = done; });
  });
  let updates = 0;
  const unsubscribe = session.subscribe(() => { updates++; });
  await assert.rejects(session.send(" \n "));
  await assert.rejects(session.send("x".repeat(4001)));
  assert.equal(calls, 0);
  const first = session.send("¿Qué es RAG?");
  assert.equal(session.getSnapshot().loading, true);
  assert.equal(session.getSnapshot().messages.length, 1);
  await assert.rejects(session.send("Duplicada"));
  session.reset();
  assert.equal(session.getSnapshot().messages.length, 1);
  assert.equal(calls, 1);
  resolve(Response.json({ success: true, data: { answer: "Respuesta [gu%C3%ADa.md#2]", sources: [source] } }));
  await first;
  assert.equal(session.getSnapshot().messages.length, 2);
  assert.equal(session.getSnapshot().loading, false);
  const second = session.send("Segunda pregunta");
  assert.deepEqual(requests[1].messages, [
    { role: "user", content: "¿Qué es RAG?" }, { role: "assistant", content: "Respuesta [gu%C3%ADa.md#2]" },
    { role: "user", content: "Segunda pregunta" },
  ]);
  resolve(new Response("detalle interno que no debe mostrarse", { status: 500 }));
  await assert.rejects(second);
  assert.equal(session.getSnapshot().messages.length, 2, "Retirar la pregunta fallida evita duplicarla al reintentar");
  assert.match(session.getSnapshot().error ?? "", /volver a enviar/);
  assert.ok(!session.getSnapshot().error?.includes("detalle interno"));
  const retry = session.send("Segunda pregunta");
  assert.equal(requests[2].messages.length, 3);
  resolve(Response.json({ success: true, data: { answer: "Sin contexto", sources: [] } }));
  await retry;
  assert.equal(session.getSnapshot().error, null);
  assert.equal(session.getSnapshot().messages.length, 4);
  assert.ok(updates > 0);
  unsubscribe();
  session.reset();
  assert.equal(session.getSnapshot().messages.length, 0);

  for (const fetcher of [
    async () => { throw new Error("red caída"); },
    async () => new Response("JSON inválido"),
    async () => new Response("rechazado", { status: 400 }),
    async () => Response.json({ success: false, error: "detalle privado" }),
    async () => Response.json({ success: true, data: { answer: "hola", sources: [{}] } }),
  ]) {
    const failing = createChatSession(fetcher);
    await assert.rejects(failing.send("Borrador"));
    assert.equal(failing.getSnapshot().loading, false);
    assert.equal(failing.getSnapshot().messages.length, 0);
    assert.ok(failing.getSnapshot().error);
  }
  let limitCalls = 0;
  const limited = createChatSession(async () => { limitCalls++; return Response.json({ success: true, data: { answer: "ok", sources: [] } }); });
  for (let i = 0; i < 10; i++) await limited.send("Pregunta");
  await assert.rejects(limited.send("Pregunta 11"));
  assert.equal(limitCalls, 10);
  assert.equal(limited.getSnapshot().messages.length, 20);

  const markup = renderToStaticMarkup(createElement(MessageBubble, { message: {
    role: "assistant", content: "<script>alert(1)</script> [gu%C3%ADa.md#2] [otra.md#0]", sources: [source, { ...source, chunkIndex: 3 }],
  } }));
  assert.ok(markup.includes("&lt;script&gt;") && !markup.includes("<script>"));
  assert.ok(markup.includes("&lt;img") && !markup.includes("<img"));
  for (const text of ["Fuentes recuperadas (2)", "Citada en el texto", "Recuperada; no citada", "sin fuente recuperada correspondiente", "Similitud coseno: 0.730", "no certeza", "Fragmento 2"]) assert.ok(markup.includes(text), text);
  assert.ok(!markup.includes("73%"));
  const input = renderToStaticMarkup(createElement(ChatInput, { disabled: true, onSend: async () => {} }));
  assert.match(input, /disabled/);
  assert.match(input, /maxLength="4000"/i);
  assert.match(input, /Tu pregunta/);
  console.log("OK: historial sin duplicación, bloqueo, carga, errores, reintento, límites, fuentes/citas, texto HTML escapado y formulario accesible. Sin llamadas reales.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
