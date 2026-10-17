# Endpoint de chat (parte D)

`POST /api/chat` recibe `ChatRequest` y devuelve `ApiResponse<ChatResponse>` conforme a `src/types/index.ts`. La ruta declara `runtime = "nodejs"` para PostgreSQL y el proceso Python local. Importa `answerQuestion` del servidor; `createChatPost` contiene la validación y permite sustituir el pipeline en las pruebas sin servicios externos. Los módulos del servidor no se importan desde la interfaz.

## Contrato

```json
{"messages":[{"role":"user","content":"¿Qué significa RAG?"}]}
```

Se admiten entre 1 y 20 mensajes, con roles `user` o `assistant`, texto no vacío tras comprobar espacios y hasta 4000 unidades UTF-16 por mensaje (`String.length`). El último mensaje debe ser de usuario. Se conserva el orden, el texto y la pregunta actual sin duplicarla; se descartan propiedades adicionales. Los límites acotan el historial enviado al pipeline, no son un límite de bytes del transporte ni rate limiting.

| Estado | Resultado |
|---|---|
| 200 | `{"success":true,"data":{"answer":"...","sources":[...]}}` |
| 400 | JSON inválido, estructura incorrecta, historial vacío/excesivo, rol inválido, texto vacío/excesivo o último mensaje no usuario |
| 500 | Fallo interno del pipeline; `{"success":false,"error":"No se pudo procesar la consulta. Inténtalo más tarde."}` |

Cada fuente conserva `source`, `chunkIndex`, `content` y `score`. Una respuesta de contexto insuficiente es un éxito 200 con el resultado del pipeline, que puede contener `sources: []`. Las respuestas incluyen `Cache-Control: no-store`. Next.js gestiona los métodos no implementados. No se devuelve el error interno ni se registra su objeto, causa, SQL, configuración o texto del usuario: solo un evento fijo en stderr. Los errores de configuración o servicios se tratan como fallos internos, sin inferir códigos HTTP mediante coincidencias en sus mensajes.

## Pruebas con sustitutos

```powershell
pnpm exec node --conditions=react-server --import tsx scripts/test-chat-endpoint.ts
```

No carga `.env.local`, no inicia Python ni conecta a PostgreSQL o APIs. Prueba JSON malformado, estructura incorrecta, roles `system`, `tool` y variantes inválidas, contenido no textual o vacío, límites 20/21 y 4000/4001, último mensaje assistant, historial válido con conservación del orden, fuentes, contexto vacío y tres fallos simulados. Verifica que las solicitudes inválidas no llaman al pipeline y que ni la respuesta 500 ni los registros incluyen los detalles sensibles simulados. También comprueba la exportación Node.js de la ruta real. Pasó.

## Única solicitud HTTP real observada

Se construyó y arrancó temporalmente el servidor de producción en `127.0.0.1:3047`, sin modificar `.env.local`. El servidor empleó la configuración existente de Groq `openai/gpt-oss-20b`, embeddings locales CPU y PostgreSQL. La clave se carga únicamente dentro del servidor; el script HTTP no necesita claves. Se envió un solo POST, sin sondeos HTTP ni reintentos, y después se detuvo el servidor de prueba.

Reproducción voluntaria (consume una solicitud real):

```powershell
pnpm build
pnpm exec next start --hostname 127.0.0.1 --port 3047
# En otra terminal, una vez que el servidor indique Ready:
pnpm exec node --conditions=react-server --import tsx scripts/test-chat-endpoint.ts --live
```

Pregunta: «¿Qué significa RAG? Responde en una o dos frases y cita los fragmentos.»

Estado observado: **200**, `success: true`.

Respuesta:

> RAG (Retrieval‑Augmented Generation, o Generación Aumentada por Recuperación) es una técnica que combina un buscador con un modelo de lenguaje, donde antes de responder el sistema busca en una base de conocimiento los fragmentos más relevantes y los entrega al modelo como contexto. [ejemplo-rag.md#0]

| Fuente | Índice | Similitud |
|---|---:|---:|
| ejemplo-rag.md | 0 | 0.373231 |
| ejemplo-rag.md | 3 | 0.370433 |
| ejemplo-rag.md | 2 | 0.343969 |
| ejemplo-rag.md | 4 | 0.331284 |

La referencia citada existe. La revisión manual de este caso confirma que la definición y el mecanismo descritos están explícitos en el fragmento 0; comprobar únicamente la existencia de la cita no habría demostrado ese respaldo. Es una prueba puntual del recorrido HTTP completo, no una nueva evaluación general de fidelidad. Los dos fallos parciales de C siguen documentados en [su cierre](evaluacion/CIERRE-C.md). Gemini continúa probado solo con simulaciones; esta prueba usó Groq.

## Comprobaciones y alcance

Pasaron las pruebas con sustitutos, `pnpm lint`, `pnpm build` y `git diff --check`. El build inicial reprodujo el fallo previo de Turbopack/PostCSS (`Failed to write app endpoint /page`, proceso terminado antes de conectar), tanto dentro como fuera del sandbox. Tras regenerar únicamente `.next`, el mismo `pnpm build` pasó con Turbopack y TypeScript. No se cambió el comando ni se adoptó webpack.

No se cambió la interfaz, los tipos, el esquema ni el pipeline RAG. Streaming, autenticación y rate limiting no forman parte de esta implementación del endpoint. No se hicieron commit ni push.
