# Actividad exploratoria: Chatbot con RAG

Construyan un chatbot que responda preguntas usando **un documento como base de conocimiento**.
No hay una única solución correcta: la idea es explorar, medir y decidir con criterio.

## 1. Objetivos de aprendizaje

- Entender el flujo RAG completo: ingesta → embeddings → búsqueda vectorial → prompt → respuesta.
- Usar una base de datos vectorial (Postgres + pgvector).
- Integrar APIs externas de forma segura (keys, cuotas, errores).
- Evaluar un sistema de IA con preguntas de prueba, no "a ojo".
- Trabajar en equipo con ramas y PRs (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).

## 2. Qué les dejamos hecho y qué falta

| Ya está listo (infraestructura) | Lo implementan ustedes (busquen los `TODO`) |
|---|---|
| `docker-compose.yml` con Postgres + pgvector (y Adminer) | `chunker.ts`: dividir el texto |
| Esquema SQL (`db/init/01-schema.sql`) | `embeddings.ts`: llamar a Hugging Face |
| Lectura de variables de entorno (`config.ts`) y pool de Postgres (`db.ts`) | `store.ts`: guardar chunks y buscar por similitud |
| Tipos compartidos (`src/types/index.ts`) y la interfaz `LlmClient` | `llm/`: clientes de Gemini y Groq y el selector de proveedor |
| Página `/chat`, `.env.example`, documento y preguntas de ejemplo | `prompt.ts`, `pipeline.ts`, `ingest.ts` y `scripts/ingest.ts` |
| Scripts `pnpm db:*` e `ingest` (el comando; su lógica es de ustedes) | `api/chat/route.ts`: validación, errores, streaming |
| | Frontend completo (`src/features/chatbot/`) |
| | Evaluación y rate limiting |

Cada archivo con `TODO` trae en sus comentarios el contrato, pistas (incluyendo endpoints de las APIs) y preguntas para explorar.

Para ver todos los pendientes: `grep -rn "TODO" src scripts` (o la búsqueda de su editor).

## 3. Arquitectura

```
INGESTA  (pnpm ingest)
  docs/knowledge/*.md ─▶ chunkText ─▶ embedTexts (Hugging Face) ─▶ saveChunks ─▶ Postgres/pgvector

CONSULTA (POST /api/chat)
  pregunta ─▶ embedQuery ─▶ searchSimilar (top-k) ─▶ buildSystemPrompt ─▶ LLM (Gemini/Groq) ─▶ respuesta + fuentes
```

```
scripts/ingest.ts               # CLI de ingesta
db/init/01-schema.sql           # tabla `chunks` + índice HNSW
docs/knowledge/                 # documentos base y preguntas de evaluación
src/app/api/chat/route.ts       # endpoint (validación; streaming = reto)
src/app/chat/page.tsx           # página /chat
src/server/config.ts            # variables de entorno
src/server/db.ts                # pool de Postgres
src/server/rag/                 # chunker, embeddings, store, prompt, pipeline, ingest
src/server/rag/llm/             # clientes Gemini y Groq
src/features/chatbot/           # UI: ChatWindow, MessageList, MessageBubble, SourcesList, ChatInput, useChat
```

## 4. Cómo conseguir las API keys (todo gratis)

> Los planes gratuitos, cuotas y nombres de modelos **cambian seguido**. Si algo falla con un 404 o 429,
> revisen la documentación oficial antes de culpar al código.

Cada integrante crea **sus propias keys** con su cuenta. No compartan una sola key entre los cuatro (se agota la cuota y se filtra fácil).

| Servicio | Para qué | Dónde |
|---|---|---|
| **Hugging Face** | Embeddings | https://huggingface.co/settings/tokens → *Create new token* (tipo *Read*) → `HF_API_TOKEN` |
| **Google AI Studio** (Gemini) | LLM | https://aistudio.google.com/apikey → *Create API key* → `GEMINI_API_KEY` |
| **Groq** | LLM (alternativa, muy rápido) | https://console.groq.com/keys → *Create API Key* → `GROQ_API_KEY` |

Con **una** de las dos keys de LLM basta. Elijan con `LLM_PROVIDER=gemini` o `groq`. Les conviene tener las dos: si una se queda sin cuota, cambian de proveedor.

**Reglas de seguridad:**
- Las keys van solo en `.env.local` (ya está en `.gitignore`). **Jamás** las suban a Git.
- **Nunca** pongan prefijo `NEXT_PUBLIC_` a una key: se enviaría al navegador.
- Si una key se filtra, revóquenla en el panel del servicio y creen otra.
- Los documentos que ingesten viajan a un servicio externo (Hugging Face): no usen datos personales o confidenciales.

## 5. Puesta en marcha

Requisitos: Node 20+, pnpm, **Docker Desktop**.

```bash
git switch -c feat/rag-<tu-parte>     # NUNCA trabajen en main
pnpm install
cp .env.example .env.local            # y completen HF_API_TOKEN + una key de LLM

pnpm db:up                            # levanta Postgres+pgvector (y Adminer en http://localhost:8080)
pnpm ingest                           # ingesta docs/knowledge/ (fallará con un TODO hasta que A y B terminen)
pnpm dev                              # http://localhost:3000/chat (la página se verá vacía hasta que D la implemente)
```

Comandos útiles: `pnpm db:down` (detener), `pnpm db:reset` (**borra todos los datos** y recrea el esquema).
Para entrar a la base: Adminer (sistema *PostgreSQL*, servidor `db`, usuario/clave/BD los de `.env.local`) o
`docker exec -it episcode-rag-db psql -U episcode -d episcode_rag`.

## 6. Reparto sugerido (4 integrantes)

| | Rol | Archivos principales | Entregable |
|---|---|---|---|
| **A** | Ingesta y chunking | `chunker.ts`, `scripts/ingest.ts`, `ingest.ts` (con B) | Documento troceado con criterio, y justificación del tamaño/overlap |
| **B** | Embeddings y almacenamiento | `embeddings.ts`, `store.ts` (`saveChunks`) | `pnpm ingest` guarda todo; re-ingestar no duplica; manejo de rate limit/reintentos |
| **C** | LLM, retrieval y prompt | `llm/`, `store.ts` (`searchSimilar`), `prompt.ts`, `pipeline.ts` (con B) | Búsqueda top-k con umbral, prompt que no alucina y responde "no sé", clientes Gemini/Groq |
| **D** | Frontend, endpoint y evaluación | `src/features/chatbot/`, `api/chat/route.ts` | Chat usable con fuentes, validación y errores del endpoint, streaming, y tabla de evaluación |

**Orden recomendado:** A y B avanzan primero (sin ingesta no hay nada que buscar). C puede empezar con los clientes LLM y el prompt (probándolos con un contexto escrito a mano) y luego `searchSimilar` con datos insertados a mano. D puede trabajar el frontend desde el día uno con respuestas falsas (*mock*) en el hook, y conectar al endpoint real después.

Hay dependencias entre roles: acuerden **antes** de empezar las firmas de las funciones (ya están definidas; si las cambian, avisen).

## 7. Hitos sugeridos

1. **Hito 1 — Ingesta:** `pnpm ingest` termina sin error y se ven filas en la tabla `chunks` (Adminer).
2. **Hito 2 — Búsqueda:** dada una pregunta, `searchSimilar` devuelve fragmentos razonables (probar con 3–4 preguntas a mano).
3. **Hito 3 — Chat de punta a punta:** se pregunta en `/chat` y se obtiene respuesta con fuentes.
4. **Hito 4 — Evaluación y mejoras:** correr las preguntas de [`preguntas-evaluacion.md`](./knowledge/preguntas-evaluacion.md), documentar fallos y mejorar.

## 8. Evaluación (lo más importante)

No basta con que "parezca que funciona". Para cada cambio relevante (tamaño de chunk, overlap, top-k, umbral, prompt, modelo):

1. Corran las preguntas de `docs/knowledge/preguntas-evaluacion.md`.
2. Anoten: ¿respuesta correcta? ¿las fuentes recuperadas eran las adecuadas? ¿dijo "no sé" cuando debía?
3. Compárenlo contra la configuración anterior en una tabla.

Si un documento propio reemplaza al de ejemplo, **escriban sus propias preguntas** (mínimo 10, incluyendo algunas sin respuesta en el documento y una de prompt injection).

Diagnóstico rápido cuando una respuesta es mala:
- ¿Las fuentes mostradas contienen la respuesta? **No** → problema de *retrieval* (chunking, top-k, embeddings).
- ¿Sí la contienen, pero el bot responde mal? → problema de *generación* (prompt, modelo).

## 9. Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| Error de dimensión al guardar (o al validar) | `EMBEDDING_DIMENSIONS` ≠ `vector(N)` del SQL. Si cambian de modelo, cambien ambos y hagan `pnpm db:reset`. |
| `401/403` de Hugging Face | Token mal copiado o sin permiso *Read*. |
| `503` de Hugging Face la primera vez | El modelo está "despertando". Reintenten (y automaticen el reintento: tarea de B). |
| `429` | Cuota o límite por minuto. Procesen en lotes con pausas, o cambien de proveedor LLM. |
| `404` de Gemini/Groq | Nombre de modelo obsoleto. Revisen la lista de modelos vigentes y actualicen `GEMINI_MODEL` / `GROQ_MODEL`. |
| `ECONNREFUSED` a la base | Docker no está corriendo o `pnpm db:up` no se ejecutó. |
| Cambié el SQL y no pasa nada | `db/init/*.sql` solo corre al crear el volumen: usen `pnpm db:reset`. |
| El bot responde cosas ajenas al documento | Falta umbral de similitud o el prompt no restringe al contexto. |
| Cambié `.env.local` y no se nota | Reinicien `pnpm dev`. |

## 10. Retos extra (si terminan antes)

- Streaming de la respuesta (SSE / `ReadableStream`) en backend y frontend.
- Reformular la pregunta usando el historial antes de buscar (preguntas de seguimiento tipo "¿y eso por qué?").
- Soporte para PDF en la ingesta.
- *Hybrid search*: combinar búsqueda vectorial con búsqueda de texto de Postgres (`tsvector`).
- *Reranking* de los resultados.
- Rate limiting por IP en `/api/chat`.
- Comparar respuestas **con y sin** RAG para la misma pregunta, y entre Gemini y Groq.
- Probar otro modelo de embeddings (¿mejora la métrica de evaluación?).

## 11. Flujo de trabajo en equipo

- Una rama por integrante/tarea: `feat/rag-chunker`, `feat/rag-retrieval`, `feat/rag-chat-ui`…
- Commits con Conventional Commits (`feat(rag): add paragraph-based chunker`).
- PR a `main` con revisión de al menos otro integrante. `main` debe pasar `pnpm lint` y `pnpm build`.
- Las decisiones (por qué elegimos tal tamaño de chunk, etc.) quedan escritas en la descripción del PR o en un `docs/RESULTADOS-RAG.md`.

## 12. Recursos

- pgvector: https://github.com/pgvector/pgvector
- Hugging Face Inference Providers (feature extraction): https://huggingface.co/docs/inference-providers
- Gemini API: https://ai.google.dev/gemini-api/docs
- Groq: https://console.groq.com/docs
- Next.js (esta versión tiene cambios): leer `node_modules/next/dist/docs/` antes de escribir rutas o componentes.
