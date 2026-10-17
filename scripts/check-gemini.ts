async function main() {
  const key = process.env.GEMINI_API_KEY ?? "";
  if (!key.trim()) throw new Error("Falta GEMINI_API_KEY en .env.local");
  const model = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ contents: [{ parts: [{ text: "Responde hola" }] }] }), signal: AbortSignal.timeout(30000) });
  console.log("HTTP", response.status);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error("Gemini: HTTP " + response.status);
  const answer = data.candidates?.[0]?.content?.parts?.filter((part: { thought?: boolean }) => !part.thought).map((part: { text?: string }) => part.text ?? "").join("").trim();
  if (!answer) throw new Error("Gemini no devolvió texto");
  console.log("Generación OK:", model);
}
main().catch(error => {
  console.error(error instanceof Error && /^(Falta GEMINI_API_KEY|Gemini)/.test(error.message) ? error.message : "Error de conexión con Gemini");
  process.exitCode = 1;
});
