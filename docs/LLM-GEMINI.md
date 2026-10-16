# Cliente Gemini (parte C)

## Estado y modelo

`geminiClient.generate(request: LlmRequest): Promise<string>` está implementado
y probado solo con respuestas simuladas. **La integración real de Gemini está
sin verificar:** no se realizó ninguna solicitud, no se creó una clave ni se
comprobó acceso, cuota o respuesta real de la cuenta.

Groq continúa siendo el proveedor activo. No se modificó `.env.local` ni se
cambió el modelo de Gemini. El cliente usa `config.llm.gemini.model`, procedente
de `GEMINI_MODEL` o de su valor predeterminado existente `gemini-2.5-flash`.
También acepta el prefijo `models/` en el nombre configurado.

La documentación oficial consultada el 15 de octubre de 2026 mantiene
`gemini-2.5-flash` sin fecha de cierre anunciada, pero restringe la familia
2.5 a usuarios que la utilizaban previamente. Esto no garantiza acceso desde
una clave nueva ni desde esta cuenta. No se sustituyó el modelo ni se implementó
un fallback a otro modelo o proveedor.

Fuente: [vigencia y restricciones](https://ai.google.dev/gemini-api/docs/deprecations).

## Contrato REST y extracción

Se usa `POST https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent`.
El modelo configurado se codifica como componente de URL. La clave se envía
exclusivamente en el header `x-goog-api-key`, nunca en la URL.

- `request.system` se envía en `systemInstruction.parts[0].text`.
- El historial se transforma a `contents`, manteniendo el orden. Cada texto va
  en `parts`; `user` conserva su rol y `assistant` pasa a `model`.
- Se pide un candidato y hasta 1024 tokens. No se habilitan herramientas,
  streaming ni reintentos automáticos.
- Se concatena el texto de todas las partes del primer candidato, conservando
  su orden y excluyendo partes marcadas como `thought`. No se devuelven otros
  candidatos, metadatos, firmas de pensamiento ni contenido multimedia.

La extracción verifica `promptFeedback.blockReason`, bloqueos en
`safetyRatings` y motivos de finalización del candidato. Los bloqueos se
reportan como errores sin devolver texto parcial. `MAX_TOKENS` se informa
como respuesta incompleta; otras terminaciones distintas de `STOP` se rechazan.
Si no quedan partes de texto, se informa respuesta vacía. El límite de salida
también puede consumirse en razonamiento y requerir evaluación posterior.

Fuente: [GenerateContent, historial, feedback y candidatos](https://ai.google.dev/api/generate-content).

## Errores y aislamiento

Se manejan clave o modelo ausentes, timeout de 30 segundos (incluida la lectura
del cuerpo), errores de conexión, HTTP no exitoso y JSON inválido. Los errores
solo usan mensajes fijos y el código HTTP: no incorporan cuerpos de error,
`statusText`, mensajes del proveedor ni causas de errores de red.

El módulo usa `server-only`; la clave permanece en el entorno del servidor.
La petición no usa caché ni sigue redirecciones. Las claves no se imprimen,
se incluyen en código ni se envían como `NEXT_PUBLIC_*`.

`getLlm()` selecciona ambos clientes implementados y rechaza proveedores
desconocidos. No implica que ambos estén probados con servicios reales.

## Pruebas reproducibles sin clave ni llamadas reales

```powershell
pnpm exec node --conditions=react-server --import tsx scripts/test-gemini.ts
pnpm exec node --conditions=react-server --import tsx scripts/test-groq.ts
pnpm exec node --conditions=react-server --import tsx scripts/test-pipeline.ts
pnpm lint
pnpm build
git diff --check
```

La prueba Gemini no carga `.env.local`: usa un marcador ficticio y reemplaza
`fetch` durante toda la ejecución. Verifica modelo configurado, transformación
de roles, orden del historial, separación de instrucciones, texto multiparte,
exclusión de pensamientos, bloqueos con y sin texto, truncado, respuestas
vacías y errores. También comprueba que no se filtran datos sensibles en
los errores. No existe modo de prueba real en ese script.

Quedan pendientes la prueba real de Gemini y la evaluación de fidelidad y
abstención. No se modifica la interfaz.
