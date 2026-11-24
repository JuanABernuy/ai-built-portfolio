# Juan Andrés Bernuy · Portfolio

Web personal de CV de **Juan Andrés Bernuy Navarrete**, Business Systems Analyst en Madrid.
La primera pantalla cuenta mi trayectoria como una historia que avanza sola (no hace falta hacer scroll) y el resto de la página permite explorar el detalle: experiencia, proyectos, formación y un asistente con IA que responde preguntas sobre mi perfil.

> Proyecto desarrollado como trabajo de clase sobre **programación con IA**. La documentación del proceso (metodología Spec-Driven Development y uso de agentes de IA) está en la carpeta [`docs/`](docs/).

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

## Despliegue

Pensado para Vercel: importa el repositorio, añade `GEMINI_API_KEY` y `GEMINI_MODEL` en las variables de entorno del proyecto y despliega.

## Autor

Juan Andrés Bernuy Navarrete · [LinkedIn](https://www.linkedin.com/in/juan-andrés-bernuy-navarete) · [GitHub](https://github.com/JuanABernuy)
