# Juan Andrés Bernuy · Portfolio

Web personal de CV de **Juan Andrés Bernuy Navarrete**, Business Systems Analyst en Madrid.
La primera pantalla cuenta mi trayectoria como una historia que avanza sola (no hace falta hacer scroll) y el resto de la página permite explorar el detalle: experiencia, proyectos, formación y un asistente con IA que responde preguntas sobre mi perfil.

> 📚 **Trabajo de clase: programar con IA.** El proyecto se ha construido con agentes de IA siguiendo la metodología **Spec-Driven Development (SDD)**. Todo el proceso está documentado en el repositorio (ver [más abajo](#trabajo-de-clase-programar-con-ia)).

## Qué incluye

- **Modo historia**: 8 capítulos que se reproducen solos, con vídeo de presentación, barra de progreso, teclado (← → y espacio), gestos en móvil y narración por voz opcional.
- **Asistente con IA (RAG)**: responde sobre mi experiencia usando una base de conocimiento propia (`knowledge/`) y Google Gemini.
- **Timeline interactivo** de experiencia y estudios, con filtros y enlaces compartibles.
- **Mapa** de experiencia internacional (Madrid y Tallin).
- **Skills conectadas** con los puestos y proyectos donde se han usado.
- **Bilingüe** (español e inglés) con todo el texto en `src/content/*.json`.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · Lenis · Google Gemini API (`@google/genai`) · Vercel (función serverless en `api/`).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y añade tu GEMINI_API_KEY
npm run embed                # genera los embeddings de la base de conocimiento
npm run dev                  # http://localhost:5173
```

| Variable | Descripción |
|---|---|
| `GEMINI_API_KEY` | Clave de Google AI Studio. Solo se usa en el servidor, nunca llega al navegador. |
| `GEMINI_MODEL` | Modelo de generación (por defecto `gemini-3.8-flash`, con modelos de respaldo si no está disponible). |
| `GEMINI_EMBED_MODEL` | Modelo de embeddings (`gemini-embedding-001`). |

Sin clave, el asistente funciona en modo local con búsqueda por palabras clave.

## Estructura

```
api/chat.ts            Función serverless del asistente (Vercel)
knowledge/             Base de conocimiento del asistente (Markdown)
scripts/               Generación de embeddings
src/components/        Secciones de la web (story, experience, projects…)
src/content/           Textos en español e inglés
src/server/            Lógica RAG compartida (recuperación, caché, Gemini)
public/                CV en PDF, vídeo y recursos estáticos
```

## Trabajo de clase: programar con IA

### Objetivo
Construir una aplicación web real usando agentes de IA como herramienta principal de desarrollo, pero con un proceso que garantice calidad, veracidad y seguridad. La idea no es que la IA lo haga todo, sino aprender a **dirigirla, verificarla y corregirla**.

### Metodología: Spec-Driven Development
La especificación es la fuente de verdad, no la conversación con la IA. Se sigue la estructura de [GitHub Spec Kit](https://github.github.com/spec-kit/):

| Artefacto | Para qué sirve |
|---|---|
| [`.specify/memory/constitution.md`](.specify/memory/constitution.md) | Principios del proyecto (no inventar datos, secretos solo en el servidor, presupuestos de rendimiento…) |
| [`specs/`](specs/) | Una carpeta por funcionalidad con `spec.md` (qué y por qué), `plan.md` (cómo) y `tasks.md` (pasos y estado) |
| [`AGENTS.md`](AGENTS.md) | Contexto y reglas para cualquier agente de IA que trabaje en el repo |
| [`docs/trabajo-con-ia.md`](docs/trabajo-con-ia.md) | Herramientas, cronología, **errores de la IA y cómo se detectaron**, buenas prácticas y lecciones |
| [`docs/prompts.md`](docs/prompts.md) | Prompts reales usados con Antigravity y Google Vids |

### Herramientas de IA usadas
- **Claude**: planificación, prompts, desarrollo, depuración, optimización, verificación y documentación.
- **Google Antigravity**: generación de la primera versión y parte del rediseño.
- **Google Vids**: vídeo de presentación con avatar.
- **Google Gemini API**: modelo del asistente RAG de la web.

### Resultados medidos (Lighthouse)
| | Versión generada por IA | Versión final |
|---|---|---|
| Rendimiento móvil | 75 | 95 |
| Rendimiento escritorio | 97 | 100 |
| Accesibilidad | 95 | 96 |
| Datos inventados por la IA en la web | 10+ | 0 |

### Conclusión
La IA acelera muchísimo la construcción, pero sin especificaciones claras, fuentes de verdad y verificación sistemática introduce errores difíciles de ver: cifras inventadas, enlaces falsos, una clave en un archivo público o dependencias pesadas. El valor del desarrollador está en **definir bien qué se quiere y comprobar que se ha conseguido**.

## Despliegue

Pensado para Vercel: importa el repositorio, añade `GEMINI_API_KEY` y `GEMINI_MODEL` en las variables de entorno del proyecto y despliega.

## Autor

Juan Andrés Bernuy Navarrete · [LinkedIn](https://www.linkedin.com/in/juan-andrés-bernuy-navarete) · [GitHub](https://github.com/JuanABernuy)
