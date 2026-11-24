# Prompts utilizados

Prompts reales que se usaron con otros agentes. Se conservan como parte del trabajo de clase para mostrar cómo se especificó el trabajo a la IA. Los datos de experiencia de la primera versión se corrigieron después (ver [especificación 004](../specs/004-contenido-e-interactividad/spec.md)).

---

## 1. Google Vids · vídeo de presentación

```
Create a 10-second vertical-free, landscape (16:9) professional profile video presented by an AI avatar.

Presenter: Juan Andrés Bernuy Navarrete, Business Systems Analyst.

Structure (4 quick beats, ~2.5 seconds each, fast and dynamic transitions):
1. Intro: "Hi, I'm Juan Andrés Bernuy." On-screen title: "Juan Andrés Bernuy · Business Systems Analyst".
2. Education: "I'm studying Business Administration and Data Science at ESIC." On-screen text: "ESIC · ADE + Data Science".
3. Experience and hard skills: "I automate operations with Azure, Power BI and Python." On-screen text with icons: "Azure · Power BI · Python · APIs".
4. Soft skills and close: "Analytical, a strong team player, and always learning." On-screen text: "Analytical · Teamwork · Problem-solving".

Style: dark background with cyan and violet neon accents, modern and futuristic look, clean sans-serif typography, subtle animated data-network graphics behind the avatar, smooth motion on the text. Confident, friendly, professional tone. No stock footage of people, no music with lyrics, light ambient electronic background music at low volume. Total duration: 10 seconds maximum.
```

## 2. Google Antigravity · versión inicial (resumen)

Prompt completo de unas 120 líneas. Puntos clave:

- **Setup:** crear el proyecto en `C:\juan-portfolio`, leer las skills de `.agents/skills/` (frontend-design) y planificar antes de programar.
- **Pendiente para el humano:** solo la clave de Gemini (`.env.local`) y el vídeo (`public/video/intro.mp4`). El resto debe funcionar, con alternativas si faltan.
- **Stack:** Vite, React, TypeScript, Tailwind, Framer Motion, GSAP, Lenis y React Three Fiber.
- **Secciones:** portada con vídeo, sobre mí, experiencia, pipeline, skills, proyectos, formación y contacto.
- **Asistente RAG:** base de conocimiento en Markdown, embeddings con Gemini, similitud coseno y streaming.
- **Seguridad:** clave solo en el servidor, límite de peticiones y longitud máxima.
- **Calidad:** Lighthouse 90+, accesibilidad, SEO y README con instrucciones.
- **Regla:** "Use placeholders for numbers I haven't given you, clearly marked as TODO (never invent metrics)".

> Antigravity **no respetó** la regla de no inventar cifras. Es uno de los aprendizajes del trabajo (ver [errores de la IA](trabajo-con-ia.md#4-errores-de-la-ia-y-cómo-se-detectaron)).

## 3. Google Antigravity · rediseño corporativo (resumen)

- **Objetivo:** "The site currently looks too tech / too AI… make it clean, formal and corporate while keeping the motion and interactivity".
- **Qué no se toca:** la lógica del backend, el contenido real y `.env.local`.
- **Sistema de diseño:** colores exactos, tipografía, componentes y lista de efectos que eliminar (scanlines, grain, glass, glow).
- **Maquetación:** contenedor compartido, rejilla de 12 columnas y resoluciones que comprobar (1366, 1440, 1920, 2560, 820 y 390).
- **Bloque de UI/UX:** resaltado de la sección activa, paleta de comandos, filtros, modal accesible, mejoras del chat, avisos y estilos de impresión.
- **Comprobaciones obligatorias:** buscar colores prohibidos en el código, build sin errores, capturas en cada resolución y prueba solo con teclado.

## 4. Peticiones en lenguaje natural que guiaron cada especificación

| Petición del autor | Especificación |
|---|---|
| "Que se vea menos tech… parece mucha IA… quiero algo más formal" | 003 |
| "Ponle mi CV… toda mi educación… el link a mi LinkedIn de verdad" | 004 |
| "Una característica de experiencia internacional en un mapa… un timeline interactivo" | 004 |
| "Que sea más eficiente, que no sea lento, sin quitar ninguna característica" | 005 |
| "Más para vagos, que no tengas ni siquiera que hacer scroll, que sea un storytelling" | 006 |
| "El vídeo tiene que empezar nada más comience la página" | 006 |
| "Mejora los textos con mi estilo, que suene menos robótico" | 006 |
