# Cliente Groq (parte C)

`groqClient.generate()` implementa `LlmClient` sin streaming: antepone el mensaje
`system`, conserva el orden del historial y devuelve únicamente el texto de
`choices[0].message.content`. Usa el modelo de `config.llm.groq.model` y el
endpoint oficial `https://api.groq.com/openai/v1/chat/completions`.

La clave se obtiene únicamente desde `GROQ_API_KEY` en el servidor. Los módulos
usan `server-only` para impedir su importación desde componentes de cliente.
No se registran claves, cuerpos de error HTTP ni causas de errores de red.
Las solicitudes no usan caché ni siguen redirecciones.

El cliente distingue clave ausente, timeout de 30 segundos (también durante
la lectura de la respuesta), fallos de conexión, errores HTTP, JSON inválido
y respuestas sin texto. No reintenta automáticamente. Limita la generación a
1024 tokens; para modelos `openai/gpt-oss-*` usa razonamiento `low`.

`getLlm()` devuelve Groq si `LLM_PROVIDER=groq` o Gemini si se configura
`LLM_PROVIDER=gemini`, y rechaza valores desconocidos. No hay fallback silencioso.
Groq continúa activo. El [cliente Gemini](./LLM-GEMINI.md) está implementado y
probado con sustitutos; su integración real sigue sin verificar.

## Configuración esperada

- `LLM_PROVIDER=groq`
- `GROQ_MODEL=openai/gpt-oss-20b`
- `GROQ_API_KEY`: configurada en el entorno privado del servidor, nunca en código,
  logs ni variables `NEXT_PUBLIC_*`.

La configuración local se corrigió modificando únicamente `LLM_PROVIDER` y
`GROQ_MODEL` en `.env.local`, conservando los demás bytes del archivo. Se
verificó que el proceso no tenía esas variables heredadas y que el entorno
efectivo cargaba los dos valores anteriores. El archivo privado continúa
ignorado por Git. Al iniciar otros procesos, comprobar también las variables
heredadas: pueden tener precedencia sobre las del archivo.

## Pruebas

Pruebas simuladas, sin cargar claves reales ni realizar llamadas externas:

```powershell
pnpm exec node --conditions=react-server --import tsx scripts/test-groq.ts
```

La condición `react-server` habilita la importación de `server-only` en las
pruebas CLI; Next.js la gestiona automáticamente en el servidor.

La prueba real es voluntaria, realiza una única solicitud sin reintentos y
envía solo los primeros dos fragmentos de `ejemplo-rag.md`. Usa el prompt de
sistema construido y una pregunta breve. Puede consumir cuota:

```powershell
pnpm exec node --conditions=react-server --env-file=.env.local --import tsx scripts/test-groq.ts --live
```

No colocar la clave en el comando: se carga desde el entorno privado existente.

El script comprueba que las referencias citadas existen en los fragmentos
enviados. Esta comprobación no demuestra fidelidad: también debe contrastarse
cada afirmación con el fragmento citado. La respuesta observada define RAG y
describe la recuperación previa de contexto, ambas respaldadas por el
fragmento `ejemplo-rag.md#0`. Una sola prueba no demuestra el comportamiento
ante otras preguntas, contextos insuficientes o ataques de prompt injection.

Referencia del protocolo: https://console.groq.com/docs/api-reference#chat-create

## Pipeline de consulta

`answerQuestion(messages)` valida un historial no vacío con roles `user` o
`assistant`, textos no vacíos y un último mensaje de usuario. Copia el historial
sin reordenarlo ni añadir otra pregunta. Genera el embedding de la última
pregunta, recupera hasta cuatro fragmentos con `searchSimilar()`, construye el
prompt y llama al cliente seleccionado. Devuelve `{ answer, sources }` con
las fuentes que pasan el umbral, conservando el orden de recuperación.

La búsqueda aplica `RAG_MIN_SIMILARITY` (valor por defecto: `0.15`) antes de
construir el prompt. Si no devuelve fragmentos o todos quedan bajo el umbral,
responde con contexto insuficiente y `sources: []`, sin seleccionar ni llamar
al LLM. El umbral es un filtro de ruido y no una prueba de que exista respuesta:
ver [calibración y fallos conocidos](./evaluacion/CALIBRACION-SIMILITUD.md).
No reformula preguntas con el historial ni reintenta automáticamente los errores.
Los errores de cada etapa se propagan al llamador.

Prueba de coordinación con sustitutos de Python, PostgreSQL y HTTP:

```powershell
pnpm exec node --conditions=react-server --import tsx scripts/test-pipeline.ts
```

Prueba completa con embeddings locales, la base existente y exactamente una
solicitud a Groq (sin escrituras en la base):

```powershell
pnpm exec node --conditions=react-server --env-file=.env.local --import tsx scripts/test-pipeline.ts --live
```

No se implementan streaming, el endpoint del chat ni la interfaz.
## Evaluación ampliada

La [evaluación de C](evaluacion/EVALUACION-C.md) registra la batería real acotada, los fallos de respaldo observados y las correcciones del prompt. Los resultados por caso conservan todos los intentos y distinguen citas existentes de afirmaciones respaldadas. Gemini sigue teniendo solo pruebas simuladas.
