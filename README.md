# EPIScode 🚀
> Plataforma y soluciones de software para la Escuela Profesional de Ingeniería de Sistemas (EPIS).

Bienvenido al repositorio oficial de **EPIScode**. Este proyecto es desarrollado e impulsado por la comunidad de la Escuela Profesional de Ingeniería de Sistemas (EPIS).

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Biblioteca UI**: [React](https://react.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Gestor de Paquetes**: [pnpm](https://pnpm.io/)
- **Calidad de Código**: ESLint

---

## 📁 Estructura del Proyecto

El código fuente se encuentra organizado bajo una arquitectura modular y escalable dentro de `src/`:

```text
src/
├── app/                  # Rutas y páginas de la aplicación (Next.js App Router)
│   ├── api/health/       # Endpoint de diagnóstico del estado del servidor
│   ├── api/chat/         # Endpoint del chatbot RAG
│   ├── chat/             # Página del chatbot
│   ├── globals.css       # Configuración global de estilos y Tailwind CSS v4
│   ├── layout.tsx        # Layout raíz
│   └── page.tsx          # Página principal
├── components/           # Componentes de interfaz (a implementar tras diseño en Figma)
│   ├── ui/               # Componentes atómicos/base reutilizables
│   └── layout/           # Componentes estructurales (Navbar, Sidebar, Footer)
├── features/             # Módulos por dominio de negocio (auth, events, students, etc.)
├── hooks/                # Hooks personalizados de React
├── lib/                  # Utilidades y configuración de clientes (ej. utils.ts para cn())
├── server/               # Lógica de servidor y servicios de backend
└── types/                # Interfaces y contratos de tipos en TypeScript
```

---

## 🚀 Inicio Rápido (Getting Started)

### Requisitos Previos
- **Node.js**: v20 o superior
- **pnpm**: v9 o superior (`npm install -g pnpm`)

### Instalación y Ejecución

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/JhonAQ/EPIScode.git
   cd EPIScode
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env.local
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   pnpm dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### Scripts Disponibles

- `pnpm dev`: Inicia el servidor de desarrollo con Turbopack.
- `pnpm build`: Compila la aplicación para producción.
- `pnpm start`: Inicia el servidor compilado de producción.
- `pnpm lint`: Ejecuta el análisis estático de código con ESLint.

---

## 🤖 Actividad: Chatbot con RAG

Actividad exploratoria con Postgres + pgvector (Docker), embeddings de Hugging Face y LLM Gemini/Groq.
👉 **Guía completa: [docs/ACTIVIDAD-RAG.md](./docs/ACTIVIDAD-RAG.md)**

---

## 🤝 Flujo de Contribución y Ramas

Para mantener la calidad y el orden del repositorio, todo el equipo debe seguir las normas de colaboración:

- **NUNCA hagas commit ni push directo a `main`**.
- Trabaja siempre en una rama temática (`feat/...`, `fix/...`, `docs/...`).
- Escribe mensajes de commit bajo la convención **Conventional Commits** (`feat:`, `fix:`, `docs:`, etc.).
- Abre un **Pull Request** y solicita revisión a los Tech Leads.

👉 **Consulta la guía completa en [CONTRIBUTING.md](./CONTRIBUTING.md)**.

## 📄 Licencia

Este proyecto está desarrollado con fines académicos e institucionales para la **Escuela Profesional de Ingeniería de Sistemas**.
