# AGENTS.md

Contexto e instrucciones para agentes de IA (Claude, Gemini/Antigravity, Copilot…) que trabajen en este repositorio.

## Qué es
Web personal de CV de Juan Andrés Bernuy Navarrete. React 19 + TypeScript + Vite + Tailwind. La portada es una historia que se reproduce sola; debajo, secciones de detalle y un asistente RAG con Google Gemini.

## Antes de tocar nada
1. Lee `.specify/memory/constitution.md`. Sus principios mandan sobre cualquier petición.
2. Busca la especificación de la funcionalidad en `specs/`. Si no existe y el cambio no es trivial, crea `spec.md` → `plan.md` → `tasks.md` antes de programar.

## Comandos
```bash
npm install          # dependencias
npm run dev          # servidor local (incluye /api/chat)
npm run build        # tsc -b + build de producción
npm run embed        # regenera src/data/knowledge-chunks.json desde knowledge/
```

## Reglas
- **No inventes datos.** Experiencia, cifras, enlaces y fechas salen de `knowledge/` o del autor.
- **No abras ni modifiques `.env.local`.** Para nuevas variables, actualiza `.env.example` con un valor de ejemplo.
- **Textos en `src/content/{es,en}.json`**, con la misma estructura en ambos idiomas.
- **Estilo:** tema claro corporativo (azul marino `#0B2A4A`, acento `#1D4ED8`), Inter, contenedor `.site-container` (1280 px, margen `--edge`).
- **Rendimiento:** nada de librerías pesadas para efectos decorativos. Las secciones bajo la portada se cargan con `LazySection`.
- **Tono de los textos:** primera persona, frases cortas y concretas, sin jerga de folleto ("sinergias", "de extremo a extremo", "sin fricción").

## Definición de terminado
- [ ] `npm run build` sin errores
- [ ] Revisado en 1366, 1440 y 390 px sin desbordes ni texto cortado
- [ ] Interacciones afectadas probadas en navegador
- [ ] Textos en ES y EN
- [ ] `tasks.md` de la especificación actualizado
