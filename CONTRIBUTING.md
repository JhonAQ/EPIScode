# Guía de Contribución - EPIScode 🚀

¡Bienvenidos al equipo de desarrollo de **EPIScode**! Este proyecto es desarrollado por estudiantes de la Escuela Profesional de Ingeniería de Sistemas (EPIS).

Esta guía define las reglas de colaboración, nomenclatura de ramas, formato de commits y el flujo de Pull Requests (PRs) para mantener el repositorio ordenado, escalable y profesional.

---

## 📌 Tabla de Contenidos
1. [Flujo de Ramas (Git Flow Simplificado)](#-flujo-de-ramas-git-flow-simplificado)
2. [Nomenclatura de Commits (Conventional Commits)](#-nomenclatura-de-commits-conventional-commits)
3. [Flujo de Pull Requests (Paso a Paso)](#-flujo-de-pull-requests-paso-a-paso)
4. [Criterios de Aceptación para Code Review](#-criterios-de-aceptación-para-code-review)
5. [Reglas de Seguridad y Buenas Prácticas](#-reglas-de-seguridad-y-buenas-prácticas)

---

## 🌿 Flujo de Ramas (Git Flow Simplificado)

1. La rama `main` es sagrada y protegida:
   - **NUNCA** se hace commit ni push directo a `main`.
   - `main` siempre debe compilar (`pnpm build`) y pasar linters (`pnpm lint`).
2. Todo trabajo debe realizarse en una rama específica creada a partir de la versión más reciente de `main`.
3. **Formato de nombres de rama**:
   ```bash
   <tipo>/<descripcion-corta-en-kebab-case>
   ```

### Prefijos de Ramas Permitidos:

| Prefijo   | Uso                                                      | Ejemplo                      |
| --------- | -------------------------------------------------------- | ---------------------------- |
| `feat/`   | Nueva funcionalidad o módulo                            | `feat/auth-login`            |
| `fix/`    | Corrección de un bug o error                             | `fix/header-z-index`         |
| `docs/`   | Cambios o adiciones solo en documentación                | `docs/update-readme`         |
| `refactor/`| Reestructuración de código sin alterar comportamiento   | `refactor/api-routes`        |
| `chore/`  | Mantenimiento, dependencias o configuración del repo     | `chore/update-pnpm-lock`     |

---

## 📝 Nomenclatura de Commits (Conventional Commits)

Seguimos estrictamente el estándar de **[Conventional Commits](https://www.conventionalcommits.org/)**.

### Formato General:
```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos de Commit:

| Tipo       | Propósito                                                    |
| ---------- | ------------------------------------------------------------ |
| `feat`     | Nueva característica o funcionalidad                        |
| `fix`      | Corrección de errores                                        |
| `docs`     | Solo cambios en documentación (`README`, comentarios, etc.)  |
| `style`    | Formato, espaciado, comas (sin cambios en lógica)            |
| `refactor` | Refactorización de código (ni nueva feature ni fix de bug)   |
| `perf`     | Mejora en el rendimiento                                    |
| `test`     | Añadir o actualizar pruebas unitarias o de integración       |
| `build`    | Cambios que afectan el sistema de build o dependencias       |
| `ci`       | Cambios en archivos de CI/CD (GitHub Actions, etc.)          |
| `chore`    | Tareas de mantenimiento general o configuración menor        |
| `revert`   | Revertir un commit previo                                    |

### Ejemplos de Commits Válidos:
```bash
# Con scope opcional
git commit -m "feat(auth): add login form validation schema"
git commit -m "fix(api): handle 404 response on student profile"
git commit -m "docs: add onboarding steps for 2nd year team"
git commit -m "chore(deps): update lucide-react to latest version"

# Breaking Change (cambio que rompe compatibilidad):
git commit -m "feat(api)!: migrate endpoint to v2 payload structure"
```

### Reglas para el Mensaje:
- **Un cambio lógico por commit**: no mezcles cambios de front con fixes de base de datos en un solo commit.
- **Modo imperativo y presente**: escribe `"add"` en vez de `"added"`, `"fix"` en vez de `"fixed"`.
- **Longitud**: la primera línea (`description`) debe tener menos de **72 caracteres**.
- **Enlace a issues**: cuando aplique, referencia la tarea (`Closes #12` o `Refs #34`).

---

## 🔄 Flujo de Pull Requests (Paso a Paso)

### 1. Actualizar tu copia local de `main`
Antes de iniciar cualquier tarea, asegúrate de tener la última versión:
```bash
git checkout main
git pull origin main
```

### 2. Crear una rama de trabajo
```bash
git checkout -b feat/nombre-de-tu-tarea
```

### 3. Desarrollar y verificar localmente
Haz tus cambios y verifica antes de commitear:
```bash
# Verifica errores de tipado y estilo
pnpm lint

# Verifica que el build pase correctamente
pnpm build
```

### 4. Commitear tus cambios
```bash
git add <archivos-modificados>
git commit -m "feat(scope): descripcion concisa"
```

### 5. Subir tu rama a GitHub
```bash
git push -u origin feat/nombre-de-tu-tarea
```

### 6. Abrir el Pull Request (PR)
1. Ve al repositorio en GitHub y haz clic en **Compare & pull request**.
2. Asegúrate de que la rama base sea `main`.
3. Completa todos los campos del **Pull Request Template**:
   - Descripción clara de lo realizado.
   - Tipo de cambio.
   - Checklist de verificación personal.
4. Asigna como revisores (**Reviewers**) a los mantenedores del proyecto.

---

## 🔍 Criterios de Aceptación para Code Review

Para que tu Pull Request sea aprobado y mergeado:
1. **Pasa todos los checks**: `pnpm lint` y `pnpm build` deben completarse sin advertencias graves ni errores.
2. **Sin código muerto ni logs innecesarios**: elimina `console.log`, código comentado y archivos temporales.
3. **Commits limpios**: mensajes legibles y siguiendo la convención.
4. **Al menos 1 aprobación** de los mantenedores del proyecto.
5. Si un revisor deja comentarios o solicitudes de cambio (*Changes Requested*):
   - Realiza los ajustes en tu misma rama local.
   - Haz un nuevo commit: `git commit -m "fix(review): address mentor comments"`.
   - Vuelve a hacer push: `git push origin feat/nombre-de-tu-tarea`.
   - Notifica en el hilo del PR.

---

## 🛡️ Reglas de Seguridad y Buenas Prácticas

> [!CAUTION]
> **Seguridad ante todo:**
> - **NUNCA** subas archivos `.env`, `.env.local`, llaves privadas, tokens de API o contraseñas al repositorio. Usa `.env.example` solo con valores ficticios.
> - **NUNCA** ejecutes `git push --force` a la rama `main`.
> - **NUNCA** te saltes los hooks o linters (`--no-verify`).
> - Si tienes dudas, consulta primero con los mantenedores del proyecto antes de ejecutar comandos destructivos de Git (`git reset --hard`, etc.).
