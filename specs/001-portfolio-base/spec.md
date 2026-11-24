# 001 · Portfolio base

**Estado:** Implementado · **Fecha:** 23-11-2026 · **Agente:** Google Antigravity

## Contexto
Quiero una web personal de CV que me represente mejor que un PDF: moderna, interactiva y con un asistente que responda por mí.

## Historias de usuario
- **H1.** Como reclutador, quiero entender en menos de un minuto quién es Juan y qué hace, para decidir si sigo leyendo.
- **H2.** Como reclutador, quiero descargar su CV en PDF con un clic.
- **H3.** Como visitante internacional, quiero leer la web en inglés.
- **H4.** Como reclutador, quiero contactar con Juan sin salir de la web.

## Requisitos funcionales
- **FR-001** Secciones: portada, sobre mí, arquitectura, experiencia, skills, proyectos, formación y contacto.
- **FR-002** Vídeo de presentación en la portada.
- **FR-003** Selector de idioma ES/EN que recuerda la elección.
- **FR-004** Botón de descarga del CV (`public/cv.pdf`).
- **FR-005** Formulario de contacto con validación.
- **FR-006** Diseño responsive (móvil, tablet y escritorio).

## Requisitos no funcionales
- **NFR-001** Todo el texto editable sin tocar componentes (JSON por idioma).
- **NFR-002** Desplegable en Vercel.

## Criterios de aceptación
- Dado un visitante con el navegador en español, cuando abre la web, entonces la ve en español.
- Dado un visitante, cuando pulsa "Descargar CV", entonces descarga el PDF.
- Dado un móvil de 390 px, cuando recorre la página, entonces no hay desplazamiento horizontal.

## Fuera de alcance
Blog, CMS y analítica avanzada.
