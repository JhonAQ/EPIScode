# Arquitectura del backend (hexagonal / clean)

La regla: **las dependencias apuntan hacia adentro**. El dominio no conoce a nadie; la infraestructura conoce al dominio y a los puertos, nunca al revés.

```
            ┌────────────────────────────── interface / app (adaptadores de ENTRADA)
            │   route.ts, scripts/ingest.ts, interface/http/*
            ▼
   ┌─────────────────────────────┐
   │ application                 │   casos de uso: AnswerQuestion, IngestDocument
   │   ports/ (interfaces)       │   puertos: EmbeddingProvider, VectorStore, LlmClient
   │   ┌───────────────────────┐ │
   │   │ domain                │ │   entidades y reglas puras: chunk, conversation, chunker, prompt-builder
   │   └───────────────────────┘ │
   └─────────────────────────────┘
            ▲ implementan los puertos
            └────────────────────────────── infrastructure (adaptadores de SALIDA)
                Postgres/pgvector, Hugging Face, Gemini, Groq, in-memory
```

`composition/container.ts` es el *composition root*: único lugar donde se hace `new` de los adaptadores concretos.

## Estructura (`src/server/`)

| Carpeta | Contiene | Puede importar |
|---|---|---|
| `domain/` | Entidades (`TextChunk`, `RetrievedChunk`, `ChatMessage`), errores, servicios puros (`chunkText`, `buildSystemPrompt`) | nada externo |
| `application/ports/` | Interfaces que el negocio necesita del mundo exterior | `domain` |
| `application/use-cases/` | Orquestación de un flujo (`AnswerQuestion`, `IngestDocument`) | `domain`, `ports` |
| `infrastructure/` | Implementaciones de los puertos, config de entorno, pool de Postgres | `domain`, `ports`, librerías |
| `interface/http/` | Validación y mapeo de la forma del request HTTP | `domain` |
| `composition/` | Ensamblado de dependencias | todo |

`src/types/` es el contrato HTTP compartido con el frontend (`ChatMessage`, `ChatSource`, `ApiResponse`...); no lo importa el dominio.

## Cómo se agrega algo

- **Otro proveedor de LLM:** clase nueva en `infrastructure/llm/` que implemente `LlmClient` + un `case` en `create-llm-client.ts`.
- **Otra base vectorial:** clase que implemente `VectorStore` y cambiarla en `container.ts`.
- **Una regla de negocio nueva** (p. ej. límites de la conversación): en `domain/`, con su test.
- **Un flujo nuevo:** un caso de uso en `application/use-cases/` que reciba puertos por constructor.

## Pruebas

`pnpm test` (runner nativo de Node vía `tsx`). Los casos de uso se prueban sin red ni base de datos usando
`FakeEmbeddingProvider`, `InMemoryVectorStore` y un LLM falso (ver `application/use-cases/rag.test.ts`).
Los adaptadores en memoria también sirven de **referencia** para implementar los reales.

## Ejemplo de flujo ya implementado

`POST /api/chat` → `parseChatRequest` (forma) → `AnswerQuestion.execute` (valida conversación, embebe la pregunta,
busca, filtra por `minScore`, arma el prompt, llama al LLM) → `ApiResponse<ChatResponse>`.
Hoy lanza `TODO` en los adaptadores reales de Postgres, Hugging Face, Gemini y Groq: esas piezas son la actividad.
