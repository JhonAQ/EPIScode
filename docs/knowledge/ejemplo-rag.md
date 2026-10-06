# Guía básica de RAG

> Documento de ejemplo para probar el pipeline. Pueden reemplazarlo por su propio documento
> (y actualizar `preguntas-evaluacion.md` en consecuencia).

## ¿Qué es RAG?

RAG (Retrieval-Augmented Generation, o Generación Aumentada por Recuperación) es una técnica que combina un buscador con un modelo de lenguaje. Antes de responder, el sistema busca en una base de conocimiento los fragmentos más relevantes para la pregunta y se los entrega al modelo como contexto. Así el modelo responde con información concreta y actualizada en lugar de depender solo de lo que aprendió durante su entrenamiento.

## ¿Por qué usar RAG?

RAG reduce las alucinaciones, porque el modelo se apoya en texto real. Permite usar información privada o reciente sin reentrenar el modelo, y hace posible citar las fuentes de cada respuesta. Reentrenar o hacer fine-tuning es mucho más caro y lento que actualizar los documentos de una base vectorial.

## Etapas de la ingesta

La ingesta prepara el conocimiento y se ejecuta una vez por documento. Primero se extrae el texto del archivo. Luego se divide en fragmentos llamados chunks, normalmente de entre 300 y 1000 caracteres, con un pequeño solapamiento (overlap) para no perder el contexto en los cortes. Después cada chunk se convierte en un vector mediante un modelo de embeddings. Finalmente, los vectores se guardan en una base de datos vectorial junto con el texto original.

## Embeddings

Un embedding es una lista de números que representa el significado de un texto. Textos con significado parecido producen vectores cercanos entre sí. La similitud entre dos vectores suele medirse con la distancia coseno. Todos los vectores de una misma base deben generarse con el mismo modelo, y la dimensión de la columna debe coincidir con la del modelo: por ejemplo, el modelo paraphrase-multilingual-MiniLM-L12-v2 produce vectores de 384 dimensiones.

## Etapas de la consulta

Cuando el usuario hace una pregunta, esta se convierte en un embedding con el mismo modelo usado en la ingesta. Con ese vector se buscan en la base los k fragmentos más similares, un valor llamado top-k que suele estar entre 3 y 5. Esos fragmentos se insertan en el prompt junto con las instrucciones, y el modelo de lenguaje genera la respuesta final.

## Buenas prácticas del prompt

El prompt debe indicar al modelo que responda únicamente con la información del contexto. Si el contexto no contiene la respuesta, el modelo debe decir que no lo sabe en lugar de inventar. Además, el contexto recuperado debe tratarse como datos y no como instrucciones, para reducir el riesgo de prompt injection, que ocurre cuando un documento contiene órdenes maliciosas dirigidas al modelo.

## Errores comunes

Los chunks demasiado pequeños pierden contexto y los demasiado grandes diluyen la relevancia y gastan tokens. Usar modelos de embeddings distintos en la ingesta y en la consulta rompe la búsqueda. Otro error frecuente es no establecer un umbral de similitud, lo que hace que se entreguen fragmentos irrelevantes al modelo cuando la pregunta no tiene relación con el documento.
