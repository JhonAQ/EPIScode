# Embeddings locales (parte B)

`embedTexts()` y `embedQuery()` usan el mismo modelo
`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` en CPU, con
384 dimensiones. No requieren `HF_API_TOKEN` ni llaman a Inference API.
La configuración fija vive en `src/server/config.ts`, bajo `embeddings`;
las antiguas variables `HF_EMBEDDING_MODEL` y `EMBEDDING_DIMENSIONS` no se usan.

## Preparación reproducible

Se verificó Python 3.14.5 en Windows x64. Las dependencias directas están
fijadas en `requirements-embeddings.txt`; sus dependencias transitivas las
resuelve pip (no es un lock completo).

Desde la raíz del repositorio, en PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip --isolated install -r requirements-embeddings.txt
```

Solo en la preparación inicial se necesita Internet para descargar el modelo
público, sin autenticación, a la caché ignorada de `.venv`:

```powershell
.\.venv\Scripts\python.exe -c "import os; os.environ['HF_HOME']=os.path.abspath('.venv/huggingface'); os.environ['HF_HUB_DISABLE_IMPLICIT_TOKEN']='1'; os.environ['HF_HUB_DISABLE_TELEMETRY']='1'; from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', device='cpu', token=False)"
```

En Linux/macOS, el ejecutable equivalente es `.venv/bin/python`.
La caché ya descargada en este equipo se reutiliza sin preparación adicional.

## Ejecución y comprobación

```powershell
pnpm exec tsx scripts/test-embeddings.ts
node scripts/test-ingest-dry-run.cjs
pnpm lint
pnpm build
git diff --check
```

TypeScript inicia Python con `execFile`, sin shell, y manda una lista JSON de
textos por stdin. Python devuelve una matriz JSON por stdout; los diagnósticos
van a stderr. Se verifica un vector de 384 números finitos por texto en ambos
lados, conservando el orden. `embedTexts([])` devuelve `[]` sin iniciar Python.
El script fuerza modo offline, `local_files_only=True` y `token=False`.
Si falta la caché, falla sin intentar descargarla. Python recibe un entorno
mínimo, sin los tokens o credenciales del servidor.

La prueba de `--dry-run` ejecuta el CLI sin cargar `.env.local`, bloquea
procesos externos (excepto el compilador esbuild de tsx) y conexiones TCP.
Permite los named pipes locales de tsx. Comprueba que la vista previa termina
correctamente y que no intenta iniciar Python ni conectarse a PostgreSQL.

## Diagnóstico de build (2026-10-15)

`pnpm build` fallaba con Turbopack al procesar `src/app/globals.css`:

```text
Failed to write app endpoint /page
creating new process
node process exited before we could connect to it with exit code: 0
```

Se aisló el fallo a la caché persistente `.next/cache/turbopack`, sin cambiar
el código fuente ni `"build": "next build"`:

1. Una copia temporal de HEAD compiló con Turbopack.
2. El árbol actual compiló con una carpeta `.next` nueva.
3. Al restaurar los artefactos anteriores reapareció el mismo error.
4. Al aislar únicamente `.next/cache/turbopack`, el árbol actual compiló.

La corrección local fue regenerar esa caché y eliminar los artefactos temporales
del diagnóstico. No se requieren cambios en PostCSS, dependencias o bundler.
No se identificó qué evento original dejó la caché en ese estado; si se repite,
conviene conservarla y reportar la reproducción a Next.js. El fallo previo de
descarga de Google Fonts era independiente y requería acceso de red del build.

## Límites actuales

- Ejecutar Node desde la raíz del repositorio y disponer de Python, `.venv`,
  `scripts/embed_local.py` y la caché completa. Requiere runtime Node.js con
  permiso para iniciar procesos; Edge y un despliegue con solo `.next` no bastan.
- Cada llamada no vacía carga el modelo una vez, con el lote completo y
  minibatches de 32. Llamadas independientes vuelven a cargarlo; no hay un
  trabajador persistente ni límite global de concurrencia.
- Hay un timeout de 120 segundos y un límite de salida de 64 MiB por llamada.
  Lotes grandes requieren memoria y deben dividirse en lotes razonables.
- Se conserva la salida original del modelo, sin normalización L2 adicional.
  Los textos largos se truncan según el límite del modelo.
- La búsqueda vectorial, el pipeline de consulta, el LLM y la interfaz siguen
  pendientes; no forman parte de esta implementación de almacenamiento.

## Almacenamiento por documento

`saveChunks(source, chunks, embeddings)` valida la cantidad de vectores,
los índices únicos dentro del rango INTEGER y los 384 números finitos por
vector antes de conectar. Guarda `source`, `chunk_index`, `content`,
`metadata` (objeto vacío por defecto) y `embedding` mediante parámetros SQL.

Cada documento usa un único cliente y una transacción: `BEGIN`, bloqueo
advisory por fuente, upsert por `UNIQUE(source, chunk_index)`, eliminación
de índices ausentes y `COMMIT`. Si falla una consulta, se ejecuta `ROLLBACK`
y se libera el cliente; si falla el rollback, la conexión se descarta.
El bloqueo serializa las ingestas de una misma fuente que usen esta función.

Cuando el documento se acorta, se eliminan solo sus índices que ya no aparecen
en la nueva lista, dentro de la misma transacción. Se conservan los IDs de los
índices que siguen presentes. Una lista vacía elimina todos los fragmentos
de esa fuente; `ingestDocument` también aplica este comportamiento a documentos
vacíos, sin iniciar Python. Otras fuentes no se eliminan.

Para verificar contra la base configurada y ya inicializada:

```powershell
pnpm exec tsx --env-file=.env.local scripts/test-store.ts
```

Esta prueba ingiere `ejemplo-rag.md` dos veces con embeddings locales reales,
comprueba cinco registros de 384 dimensiones y los mismos IDs tras repetir.
También usa una fuente temporal única para verificar metadata, validación,
rollback ante un error SQL real, eliminación de sobrantes y documento vacío;
la fuente temporal se elimina al finalizar. No cambia el esquema ni reinicia
la base. La prueba necesita acceso a PostgreSQL; `--dry-run` sigue siendo
independiente de Python, credenciales y PostgreSQL.
