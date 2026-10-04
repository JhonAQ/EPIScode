# Tareas de Exploración Tecnológica (Spikes) 🔬
> Documento de referencia para la reunión del sábado 10 de octubre con el equipo de 2do año.

Los **Spikes** son investigaciones de corta duración (2 a 4 días) orientadas a responder preguntas técnicas y construir pequeñas pruebas de concepto (PoCs) antes de integrarlas al código principal del proyecto.

---

## 📌 Spike 01: Automatización de Flujos & Webhooks con n8n / Zapier (IA & Notificaciones)

### Contexto
El sistema de la escuela necesitará enviar notificaciones automáticas (ej. avisos de eventos académicos, alertas o resúmenes) a canales de comunicación como Discord o Telegram.

### Misión para los estudiantes:
1. Levantar una instancia de **n8n** (ya sea local mediante Docker / Desktop o utilizando n8n Cloud / Zapier).
2. Crear un flujo de automatización activado por un **Webhook** que reciba un payload JSON con información de un evento:
   ```json
   {
     "titulo": "Seminario de Inteligencia Artificial EPIS",
     "fecha": "2026-10-15",
     "organizador": "Comité Académico",
     "detalles": "Charla magistral presencial en el auditorio central."
   }
   ```
3. Formatear el mensaje y enviarlo automáticamente a un canal de Discord o grupo de Telegram mediante bot/webhook.
4. *(Opcional / Reto Plus)*: Intercalar un nodo de OpenAI / Google Gemini en n8n para generar un resumen o hashtag automático antes del envío.

### Entregable:
- Demostración funcional en vivo (3 min) o captura en video.
- Archivo JSON exportado del flujo de n8n para archivarlo en el repositorio.

---

## 📌 Spike 02: Fundamentos de Componentes Modulares con Tailwind CSS v4

### Contexto
Mientras el equipo de diseño finaliza los mockups en Figma, el equipo frontend debe dominar la creación de componentes reutilizables con Tailwind CSS v4 y TypeScript.

### Misión para los estudiantes:
1. Crear una rama `spike/tailwind-components`.
2. Familiarizarse con la función utilitaria `cn()` ubicada en `src/lib/utils.ts` (`clsx` + `tailwind-merge`).
3. Diseñar 2 componentes aislados de prueba:
   - Una **Tarjeta de Información (Card)** con variantes (borde, sombra, badge de estado).
   - Un **Botón con Estados** (default, hover, disabled, loading).
4. Probar su adaptabilidad en pantallas móviles y escritorio.

### Entregable:
- Pull Request a la rama de investigación con los componentes y una vista previa en una ruta de prueba.

---

## 📌 Spike 03: Conexión y Autenticación con Supabase (Auth & DB)

### Contexto
Evaluar el uso de Supabase como backend / base de datos PostgreSQL Serverless para acelerar la persistencia de datos y login de usuarios.

### Misión para los estudiantes:
1. Crear un proyecto gratuito en [Supabase](https://supabase.com).
2. Crear una tabla de prueba `noticias_epis` con campos (`id`, `titulo`, `contenido`, `fecha_publicacion`).
3. Probar la consulta (`select`) e inserción (`insert`) de datos desde un script o componente Next.js usando `@supabase/supabase-js`.
4. Evaluar la facilidad de configurar autenticación (login con Google institucional).

### Entregable:
- Mini informe de 1 página: pasos para conectar, ventajas, desventajas y conclusiones sobre su uso en el proyecto.

---

## 📌 Spike 04: Asistente de Consultas Académicas con Gemini API

### Contexto
Explorar cómo integrar un modelo de lenguaje (LLM) accesible para responder preguntas sobre la escuela o cursos.

### Misión para los estudiantes:
1. Crear una cuenta en [Google AI Studio](https://aistudio.google.com/) y obtener una API key gratuita de Gemini.
2. Crear un endpoint o Server Action en Next.js que reciba un prompt (ej. "Resume los temas principales del curso de Algoritmos") y retorne la respuesta generada.
3. Evaluar latencia, límites de la capa gratuita y calidad de respuesta en español.

### Entregable:
- Demostración de llamada a la API y conclusión sobre posibles casos de uso en el portal EPIS.
