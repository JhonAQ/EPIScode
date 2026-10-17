# Interfaz del chat (parte D)

La página `/chat` conserva la paleta zinc, los bordes redondeados y los modos claro/oscuro del proyecto. Usa los componentes existentes y `POST /api/chat`; no importa configuración, PostgreSQL, Python ni clientes LLM en el navegador. No añade dependencias.

## Comportamiento

- Historial visible con mensajes del usuario y asistente, carga anunciada y scroll del historial al último mensaje.
- Enter envía; Shift+Enter añade una línea y la composición IME no envía anticipadamente. No se permite contenido vacío. El límite de 4000 unidades UTF-16 coincide con el endpoint actual (el TODO antiguo mencionaba 1000).
- El bloqueo síncrono de sesión y formulario evita solicitudes simultáneas incluso antes del siguiente render. Durante la carga se deshabilitan el campo, Enviar y Nueva conversación.
- Se envía todo el historial de esta conversación, añadiendo la pregunta actual una sola vez y proyectando únicamente `role` y `content`. Las fuentes permanecen asociadas a la respuesta visible, fuera del cuerpo enviado.
- La pregunta aparece de inmediato. Si la petición falla, se retira ese mensaje provisional del historial y el borrador sigue en el campo, editable y listo para reenviar. No se muestra texto arbitrario de errores remotos ni se reintenta automáticamente. El borrador se borra únicamente al recibir una respuesta válida.
- El contrato limita el historial a 20 mensajes: al completar diez intercambios se pide iniciar una nueva conversación. No se recorta el contexto silenciosamente. Nueva conversación limpia el historial y conserva el borrador.
- Las respuestas sin fuentes lo indican explícitamente. Las fuentes colapsables muestran archivo, índice original desde cero, hasta 350 caracteres de extracto y similitud coseno decimal. Cada fragmento indica si fue citado; las referencias del texto sin fuente correspondiente también se señalan. Ninguna etiqueta equivale a una verificación factual ni a un porcentaje de certeza.

El contenido del modelo, nombres de archivo y extractos se renderizan como texto escapado de React, conservando saltos de línea. No se interpreta HTML ni Markdown: por ejemplo, `**negrita**` permanece como texto. Las referencias se identifican por corchetes; esto identifica menciones, no demuestra que respalden las afirmaciones.

Hay etiqueta de textarea, descripción de teclado, focos visibles, controles nativos, registro de conversación anunciado y alerta de error. El contenido se ajusta al ancho y divide referencias largas para evitar desbordamiento horizontal. El historial vive en memoria por ventana; no hay persistencia al recargar, streaming ni reformulación de preguntas con el historial.

## Pruebas automatizadas

```powershell
pnpm exec tsx scripts/test-chat-ui.ts
pnpm exec node --conditions=react-server --import tsx scripts/test-chat-endpoint.ts
pnpm lint
pnpm build
git diff --check
```

La prueba de UI usa el mismo estado de sesión que `useChat` con `fetch` sustituido, sin claves o APIs reales. Verifica historial sin duplicación, exclusión de fuentes del cuerpo HTTP, mensaje optimista, bloqueo durante una petición pendiente, rollback y reenvío sin duplicados, limpieza de error tras éxito, límites de entrada/historial y fallos de red, HTTP, JSON y formato de respuesta. El render estático comprueba campos accesibles, bloqueo, distinción de fuentes/citas y escape de HTML malicioso tanto en la respuesta como en el extracto. No se agregaron bibliotecas de pruebas.

## Verificación visual observada

Se usó el navegador integrado contra el build de producción en `127.0.0.1:3047/chat`. Se hizo **una única consulta real con Groq**, desde el formulario, sin reintentos:

> ¿Qué significa RAG? Responde brevemente y cita los fragmentos.

Se comprobó que los espacios no habilitan Enviar, Shift+Enter añade una línea y Enter inicia la carga. Durante la consulta aparecieron el mensaje del usuario, «Consultando los documentos…» y los controles bloqueados. La respuesta observada fue:

> RAG significa **Retrieval‑Augmented Generation** (Generación Aumentada por Recuperación). Se trata de una técnica que combina un buscador con un modelo de lenguaje; el sistema busca primero los fragmentos más relevantes en una base de conocimiento y los entrega al modelo como contexto antes de generar la respuesta. [ejemplo-rag.md#0]

El campo quedó vacío y recuperó el foco tras el éxito. Se abrió el desplegable: cuatro fuentes de `ejemplo-rag.md`, índices 0, 3, 2 y 4, similitudes mostradas 0.412, 0.398, 0.337 y 0.323. Solo el índice 0 figuró como citado. La definición y mecanismo descritos están explícitos en ese fragmento; una sola consulta no demuestra fidelidad general. Los fallos parciales de C y la validación únicamente simulada de Gemini siguen documentados en [CIERRE-C.md](evaluacion/CIERRE-C.md).

Se inspeccionaron escritorio y viewport móvil de 390×844; el DOM midió 375 píxeles de ancho útil y de contenido, sin desbordamiento horizontal. El formulario y el historial tienen scroll vertical cuando es necesario. Esto no sustituye pruebas en dispositivos físicos ni una auditoría de accesibilidad con lector de pantalla.

Después se detuvo el servidor temporal y se intentó enviar un borrador de prueba para provocar una conexión fallida: no se llamó de nuevo a Groq. Apareció una alerta comprensible, el historial anterior permaneció, el campo conservó exactamente «Esta pregunta debe conservarse si falla la conexión.» y Enviar volvió a estar habilitado. El reenvío exitoso tras error se cubre con sustitutos, evitando una segunda consulta real. Se restauró el viewport del navegador.

Pasaron pruebas de sesión/render y endpoint, lint, tipos, build y comprobación de espacios. Se corrigió una ubicación inicial incorrecta de dos directivas `use client`. El build también reprodujo el fallo conocido de caché Turbopack/PostCSS; pasó tras regenerar únicamente `.next`, manteniendo el comando y Turbopack.

## Probar desde tu navegador

Con PostgreSQL, `.venv`, el modelo descargado y la configuración privada existentes:

```powershell
pnpm dev
```

Abre `http://localhost:3000/chat`, escribe una pregunta sobre el documento y pulsa Enviar o Enter. Revisa «Referencias citadas en el texto» y abre «Fuentes recuperadas» para contrastar archivo, índice y extracto. Para probar el error sin consumir cuota, detén el servidor después de abrir la página e intenta enviar; el texto debe permanecer en el campo. Vuelve a iniciar el servidor para continuar.

No se modificaron credenciales, esquema, pipeline ni proveedores. No se hicieron commit ni push.
