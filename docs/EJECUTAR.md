# Ejecutar el chatbot con embeddings locales

El flujo sigue la actividad: texto → chunks → embeddings → Postgres/pgvector
→ recuperación → prompt → Gemini/Groq → respuesta con fuentes.

## Configuración
- EMBEDDING_PROVIDER=local (ya configurado).
- LOCAL_EMBEDDING_MODEL=Xenova/paraphrase-multilingual-MiniLM-L12-v2.
- EMBEDDING_DIMENSIONS=384, igual que la columna vector del SQL.
- HF_API_TOKEN no se necesita para el modelo público local.
- La primera ingesta descarga el modelo ONNX; queda en .cache/transformers.
  Después, ingesta y consultas calculan embeddings en CPU sin enviar textos
  a la API de Hugging Face ni consumir sus créditos.
- El LLM sigue siendo externo: completar GEMINI_API_KEY o GROQ_API_KEY
  y seleccionar LLM_PROVIDER=gemini o groq. Las fuentes recuperadas se envían
  a ese proveedor para generar la respuesta. Sus cuotas siguen aplicando.

## Comandos desde EPIScode
Requisitos: Node.js 22.13 o superior, pnpm 11.24.0 y Docker Desktop.
Abrir Docker Desktop y ejecutar:

    pnpm install
    Copy-Item .env.example .env.local

El comando de copia se ejecuta solo la primera vez: no sobrescribir un
`.env.local` existente. Completar `GEMINI_API_KEY` o `GROQ_API_KEY`, seleccionar
`LLM_PROVIDER` y después ejecutar:

    pnpm db:up
    pnpm ingest
    pnpm dev

Abrir http://localhost:3000/chat. Si el servidor ya estaba ejecutándose,
reiniciarlo tras cambiar las variables de entorno.

Los comandos de Docker leen `.env.local`; `DATABASE_URL` debe coincidir con
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `POSTGRES_PORT`.
Las credenciales de un volumen ya creado no cambian al editar estas variables.

`pnpm ingest` sincroniza toda la carpeta `docs/knowledge`: excluye las preguntas
de evaluación y elimina de la base los documentos borrados o renombrados.
Prepara los embeddings antes de guardar y aplica todos los cambios en una sola
transacción. Si falla, conserva el corpus anterior. Una carpeta sin documentos
produce un error; `pnpm ingest --allow-empty` permite vaciar el corpus expresamente.

No se necesita Python ni GPU. Reingerir todos los documentos al cambiar
el proveedor/modelo de embeddings: no mezclar vectores de modelos distintos,
aunque tengan igual dimensión. No hace falta borrar el volumen para esta
adaptación: se mantiene vector(384) y la ingesta reemplaza cada documento.

La API remota sigue disponible con EMBEDDING_PROVIDER=huggingface y HF_API_TOKEN;
esa opción puede requerir créditos y disponibilidad del modelo en HF Inference.

## Verificación
    pnpm lint
    pnpm exec tsc --noEmit --incremental false
    pnpm exec tsx --test tests/rag.test.ts
    pnpm exec tsx --env-file=.env.local scripts/check-local-rag.ts
    pnpm build

La compilación usa Webpack por el fallo de Turbopack al iniciar el proceso
de CSS observado en este entorno. `pnpm dev` conserva su configuración original.

## Evaluación de la actividad

Con Docker activo, el corpus ingerido y una clave válida:

    pnpm exec tsx --env-file=.env.local scripts/evaluate-rag.ts

El comando realiza llamadas al proveedor LLM configurado y muestra las respuestas
y fuentes en JSON. La puntuación se revisa manualmente contra las respuestas
esperadas. Para repetir un caso tras un error de cuota:

    pnpm exec tsx --env-file=.env.local scripts/evaluate-rag.ts --question=13

La opción `--injection-only` añade la instrucción maliciosa únicamente a una
copia en memoria del fragmento recuperado sobre overlap. No modifica el documento
ni la base de datos; comprueba la generación ante contexto contaminado, no toda
la ingesta de un documento malicioso. `--injection` ejecuta esa prueba después
de las 13 preguntas. Las cuotas del proveedor siguen aplicando.

Si el proveedor devuelve HTTP 429, el chat informa que se alcanzó una cuota o
límite de solicitudes y responde con HTTP 503. No repite automáticamente la
llamada: revisar la cuota en la cuenta del proveedor antes de reintentar.
Esto no indica una caída de PostgreSQL ni del servidor de Next.js.

Evaluar las preguntas de knowledge/preguntas-evaluacion.md y registrar las
respuestas en RESULTADOS-RAG.md. Streaming y rate limiting son retos extra.
