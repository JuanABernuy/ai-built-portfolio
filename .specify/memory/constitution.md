# Constitución del proyecto

Principios que gobiernan todas las especificaciones, planes y tareas de este repositorio. Cualquier agente de IA o persona que trabaje en el proyecto debe respetarlos. Si una petición choca con un principio, se para y se pregunta.

**Versión:** 1.0 · **Ratificada:** 24-11-2026 · **Responsable:** Juan Andrés Bernuy Navarrete

---

## I. La verdad antes que el impacto
Todo dato que aparece en la web o en la base de conocimiento del asistente debe poder comprobarse en el CV o en el perfil de LinkedIn del autor. Prohibido inventar métricas, cifras, URLs, dominios, tecnologías o disponibilidad. Si falta un dato, se deja un marcador `TODO` y se pregunta.

## II. Los secretos nunca salen del servidor
La clave de Gemini vive solo en `.env.local` (local) o en las variables de entorno de Vercel. Nunca en el código del navegador, en `.env.example` ni en el historial de Git. Los agentes no abren, imprimen ni modifican `.env.local`.

**Excepción aprobada por el autor (spec 007):** la versión publicada en GitHub Pages llama a Gemini desde el navegador con una clave **distinta**, de capa gratuita y **sin facturación**, restringida al dominio de la web y a la Generative Language API. Entra en el build como secreto de GitHub Actions (`GEMINI_API_KEY` → `VITE_GEMINI_API_KEY`), así que no está en el repositorio, pero sí es visible en el JavaScript publicado. Nunca se usa para esto una clave con facturación.

## III. Contenido separado del código
Todo el texto visible está en `src/content/es.json` y `src/content/en.json`, con la misma estructura en ambos idiomas. Los componentes no contienen frases fijas salvo etiquetas mínimas de interfaz con su traducción.

## IV. El rendimiento es un requisito, no un extra
Presupuestos mínimos:
- Lighthouse Performance ≥ 90 en móvil y ≥ 95 en escritorio.
- JavaScript inicial ≤ 150 KB comprimido.
- CLS < 0,1.
- Las animaciones continuas se pausan cuando no están en pantalla.

## V. Accesible para todos
Contraste WCAG AA, navegación completa con teclado, foco visible, `prefers-reduced-motion` respetado y textos alternativos. Lighthouse Accessibility ≥ 95.

## VI. Verificar, no suponer
Ningún cambio se da por terminado sin:
1. Comprobación de tipos (`tsc -b`) y build de producción sin errores.
2. Revisión visual con capturas en escritorio (1366 y 1440) y móvil (390).
3. Prueba de las interacciones afectadas en un navegador real.

## VII. La persona decide, la IA propone
Las decisiones de producto, de contenido personal y de publicación (subir a GitHub, desplegar, borrar) las toma el autor. La IA puede proponer y ejecutar, pero no publica, borra ni cambia el alcance sin confirmación.

## VIII. Cambios pequeños y trazables
Cada funcionalidad tiene su carpeta en `specs/` con `spec.md`, `plan.md` y `tasks.md`. Los commits explican el porqué y referencian la especificación cuando aplica.
