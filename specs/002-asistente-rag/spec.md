# 002 · Asistente con IA (RAG)

**Estado:** Implementado · **Fechas:** 23-11-2026 / 24-11-2026

## Contexto
Un reclutador tiene preguntas concretas ("¿qué hace en Bullboat?", "¿qué estudia?"). Un asistente que responde con mis datos ahorra tiempo y demuestra lo que sé hacer con IA.

## Historias de usuario
- **H1.** Como reclutador, quiero preguntar en lenguaje natural sobre la experiencia de Juan y recibir una respuesta breve y correcta.
- **H2.** Como reclutador, quiero ver preguntas sugeridas para empezar.
- **H3.** Como Juan, quiero que el asistente no invente nada sobre mí.

## Requisitos funcionales
- **FR-001** Responder solo con información de `knowledge/`. Si no la tiene, decirlo y sugerir contactar.
- **FR-002** Responder en el idioma de la pregunta y en tercera persona.
- **FR-003** Mostrar la respuesta en streaming.
- **FR-004** Botones "Pregúntale a la IA" en puestos, proyectos y ciudades del mapa que abren el chat con la pregunta escrita.
- **FR-005** Atajos: `/` abre el chat y `Esc` lo cierra.
- **FR-006** Copiar y regenerar respuestas, borrar la conversación y conservarla durante la sesión.

## Requisitos no funcionales
- **NFR-001** La clave de API solo existe en el servidor.
- **NFR-002** Límite de peticiones por IP y longitud máxima de la pregunta.
- **NFR-003** Si el modelo configurado deja de existir, el sistema sigue funcionando con otro.
- **NFR-004** Sin clave configurada, la web no se rompe (modo búsqueda local).

## Criterios de aceptación
- Dada la pregunta "¿Qué hace Juan en Bullboat?", la respuesta menciona la migración de Sage a Cin7 y el paso a Azure, y no incluye cifras que no estén en `knowledge/`.
- Dado un modelo retirado por Google (HTTP 404), el sistema prueba el siguiente de la lista sin mostrar un error al usuario.
- Dada una clave no válida, el chat muestra un mensaje claro en lugar del JSON del error.
