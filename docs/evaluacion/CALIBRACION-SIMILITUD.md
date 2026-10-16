# Calibración del umbral de recuperación

Este informe conserva el diagnóstico inicial con `max_seq_length=128`.
Después se midió el truncamiento, se amplió a 256 y se regeneraron los cinco
embeddings. Las mediciones actuales están en `recuperacion-mediciones.md` y
el antes/después con evaluación de generación se registra en `EVALUACION-C.md`.

## Alcance y método

Se midieron 22 consultas sin llamar a ningún LLM: las diez preguntas
respondibles del cuestionario, cinco ajenas, seis relacionadas sin respuesta
documentada y la pregunta adversarial original. Las etiquetas se asignaron
leyendo el documento, antes de medir. Las preguntas R1–R10 corresponden a
las preguntas 1–10 de `preguntas-evaluacion.md`; A1, T1 e I1 son sus preguntas
11, 12 y 13. Las demás son pruebas adicionales de rechazo.

Corpus: cinco fragmentos existentes de `ejemplo-rag.md`, con ventanas de 800
caracteres y overlap de 100. Modelo local CPU:
`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, 384 dimensiones,
sin normalización adicional. Se generaron los embeddings de las 22 preguntas
en un lote y se midió `1 - (embedding <=> pregunta)` con pgvector, top-k=4,
sin filtro. Solo se leyó la base en una transacción REPEATABLE READ READ ONLY.
No se reingestaron documentos ni se modificaron sus vectores.

Las [mediciones iniciales completas](./recuperacion-baseline-128.md) registran todas las
preguntas, los cuatro resultados y sus similitudes, además del texto de cada
fragmento. El [JSON inicial](./recuperacion-baseline-128.json) conserva la precisión
original, fecha, modelo y huella del corpus, incluidos sus embeddings.

## Decisión: corte de ruido inicial de 0,15

Configurar en el servidor `RAG_MIN_SIMILARITY`; el valor por defecto es `0.15`.
Se conservan scores **mayores o iguales** al umbral, sin redondear. Valores
vacíos, no finitos o fuera de [-1, 1] se rechazan antes de consultar la base.
La variable no usa `NEXT_PUBLIC_` y no se añadió a `.env.local`.

| Umbral | Respondibles que conservan contexto /10 | Ajenas admitidas /5 | Relacionadas sin respuesta admitidas /6 |
|---:|---:|---:|---:|
| Sin filtro (-1) | 10 | 5 | 6 |
| 0,15 | 10 | 0 | 6 |
| 0,20 | 10 | 0 | 6 |
| 0,25 | 10 | 0 | 6 |
| 0,30 | 8 | 0 | 4 |
| 0,40 | 6 | 0 | 2 |
| 0,50 | 2 | 0 | 0 |

El máximo entre preguntas ajenas fue 0,063419. El mínimo de los máximos de
preguntas respondibles fue 0,253654. Esta separación permite quitar ruido
ajeno en esta muestra, pero no justifica subir el corte a 0,25: en R3, el
fragmento que realmente dice "entre 300 y 1000 caracteres" es #1 y puntúa
solo 0,183349; en R9, los pasos de ingesta están en #1 con 0,234223.
Por eso se elige 0,15, que mantiene esas evidencias. 0,20 perdería la primera
y 0,25 perdería ambas aunque las preguntas conservaran otros fragmentos.
El criterio prioriza no descartar evidencia conocida y no optimiza una
exactitud de respuesta que no se ha medido.

## Fallos observados y límites

- **Seis falsos positivos de admisión temática:** T1–T6 pasan a 0,15, aunque el
  documento no contiene sus respuestas exactas. T5 (proveedor más preciso para
  RAG) alcanza 0,473491; T4 (latencia exacta) 0,416012; T2 (top-k óptimo exacto)
  0,387567. Para rechazarlos por puntuación se perderían preguntas respondibles.
  El documento da un top-k típico, ventajas cualitativas y tamaños orientativos,
  pero no óptimos medidos, porcentajes exactos, latencias o comparativas de proveedores.
- **Fallo de recuperación R4:** la explicación del overlap está en #1, que no
  aparece en el top-4 bruto. El primer resultado es #4 con 0,417660 y habla
  de otros errores. Conservar contexto no equivale a recuperar la evidencia.
  Subir o bajar este umbral no recupera una fila excluida por top-k.
- **Adversarial I1:** puntúa 0,352608 y pasa el filtro. El umbral no es una
  defensa contra prompt injection. Solo se midió recuperación; no se probó
  aquí el comportamiento de un LLM frente a esa instrucción.
- Las preguntas ajenas pueden compartir vocabulario con documentos nuevos;
  no se garantiza su rechazo fuera de estos cinco ejemplos.
- Son cinco chunks de un solo documento, sin conjunto independiente de prueba.
  La selección se hizo sobre la misma muestra reportada: puede sobreajustar.
  Cambios de modelo, corpus, chunking, top-k o redacción requieren recalibración.

**Este umbral no demuestra que una pregunta sea respondible ni garantiza
fidelidad factual.** Las reglas de abstención del prompt siguen siendo necesarias,
pero su eficacia requiere evaluación posterior del LLM. En particular, no se
debe declarar que T1–T6 se rechazan: se admiten y la abstención queda pendiente
de comprobar en generación.

## Implementación y comprobaciones

`searchSimilar()` conserva la consulta parametrizada ordenada por distancia
ascendente y limitada a top-k; después elimina scores no finitos o menores que
el umbral. Su firma y `ChatSource` no cambian. `answerQuestion()` recibe únicamente
los fragmentos filtrados antes de construir el prompt. Si no queda ninguno,
devuelve contexto insuficiente y `sources: []` sin seleccionar ni llamar al LLM.

Reproducir las mediciones (Python local y PostgreSQL; cero llamadas a LLM):

```powershell
pnpm exec tsx --env-file=.env.local scripts/calibrate-retrieval.ts
```

Regenerar solo el informe legible desde el JSON ya guardado:

```powershell
pnpm exec tsx scripts/calibrate-retrieval.ts --report-only
```

Pruebas de borde y coordinación, sin servicios externos:

```powershell
pnpm exec tsx scripts/test-retrieval-threshold.ts
pnpm exec node --conditions=react-server --import tsx scripts/test-pipeline.ts
```

Incluyen valores inmediatamente inferiores, iguales y superiores al corte,
configuración inválida, exclusión de fragmentos antes del prompt y ausencia
de llamada al LLM cuando todos quedan filtrados. Gemini tiene únicamente pruebas simuladas; no se modifica la interfaz.
