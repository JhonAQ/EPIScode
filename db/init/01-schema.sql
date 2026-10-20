-- Esquema base de la actividad RAG.
-- Se ejecuta automáticamente la primera vez que se crea el contenedor.
-- Si lo modifican: `pnpm db:reset` para recrear la base desde cero.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chunks (
  id          BIGSERIAL PRIMARY KEY,
  source      TEXT        NOT NULL,              -- nombre del archivo de origen
  chunk_index INTEGER     NOT NULL,              -- posición del fragmento dentro del documento
  content     TEXT        NOT NULL,              -- texto del fragmento
  metadata    JSONB       NOT NULL DEFAULT '{}', -- libre: sección, página, etc.
  -- ¡La dimensión DEBE coincidir con el modelo de embeddings!
  -- paraphrase-multilingual-MiniLM-L12-v2 => 384
  embedding   vector(384) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, chunk_index)
);

-- Índice para búsqueda aproximada por distancia coseno (operador <=>).
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON chunks USING hnsw (embedding vector_cosine_ops);
