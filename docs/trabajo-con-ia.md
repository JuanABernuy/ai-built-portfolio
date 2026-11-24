# Cómo se programó este proyecto con IA

Trabajo de clase sobre **programación con IA**. Este documento explica qué herramientas se usaron, cómo se organizó el trabajo con Spec-Driven Development (SDD), qué errores cometió la IA y cómo se detectaron.

---

## 1. Herramientas y papel de cada una

| Herramienta | Papel en el proyecto |
|---|---|
| **Claude** (asistente conversacional y agente con acceso a la carpeta del proyecto) | Estructurar la información, escribir los prompts para los otros agentes, continuar el desarrollo cuando Antigravity se quedó sin créditos, depurar, optimizar, verificar (build, capturas, Lighthouse, pruebas en navegador) y documentar |
| **Google Antigravity** (IDE con agente) | Generar la primera versión completa del proyecto y la primera mitad del rediseño |
| **Google Vids** (avatar con IA) | Vídeo de presentación de 10 segundos |
| **Google Gemini API** | Modelo de lenguaje y embeddings del asistente RAG de la web |
| **Persona (Juan)** | Definir objetivos, aportar el CV y LinkedIn como fuentes de verdad, revisar cada versión, decidir el alcance y publicar |

## 2. Flujo de trabajo: Spec-Driven Development

El proyecto sigue la estructura de [GitHub Spec Kit](https://github.github.com/spec-kit/):

```
.specify/memory/constitution.md   Principios que no se negocian
specs/NNN-funcionalidad/
  ├── spec.md    QUÉ y POR QUÉ (historias, requisitos, criterios de aceptación)
  ├── plan.md    CÓMO (stack, arquitectura, decisiones)
  └── tasks.md   Pasos concretos y su estado
AGENTS.md                         Contexto para cualquier agente que entre al repo
```

El ciclo de cada funcionalidad:

1. **Especificar.** La persona describe lo que quiere en lenguaje natural ("que no haga falta hacer scroll"). La IA lo convierte en requisitos y criterios de aceptación comprobables.
2. **Planificar.** La IA propone cómo hacerlo y la persona valida las decisiones con impacto (formato, publicación, borrados).
3. **Dividir en tareas.** Pasos pequeños, cada uno verificable.
4. **Implementar.** El agente escribe el código.
5. **Verificar.** Tipos, build, capturas en varias resoluciones, pruebas de interacción y medición con Lighthouse. Si algo falla, se vuelve al paso 4.

| Especificación | Contenido |
|---|---|
| [001](../specs/001-portfolio-base/spec.md) | Portfolio base |
| [002](../specs/002-asistente-rag/spec.md) | Asistente RAG |
| [003](../specs/003-rediseno-corporativo/spec.md) | Rediseño corporativo y UI/UX |
| [004](../specs/004-contenido-e-interactividad/spec.md) | Contenido real, timeline y mapa |
| [005](../specs/005-rendimiento/spec.md) | Rendimiento |
| [006](../specs/006-modo-historia/spec.md) | Modo historia, vídeo y tono |

## 3. Cronología (23–24 de noviembre de 2026)

1. Claude estructura la información del CV y escribe el prompt del vídeo (Google Vids) y el de la web (Antigravity). → [prompts](prompts.md)
2. Antigravity genera la versión 1 en `C:\juan-portfolio`.
3. Revisión humana: "parece mucha IA". Claude escribe un prompt de rediseño con criterios concretos y comprobables.
4. Antigravity hace la mitad del rediseño y **se queda sin créditos**. Claude analiza el estado de la carpeta y termina el trabajo.
5. La API del chat deja de funcionar. Claude diagnostica que el modelo de Gemini ha sido retirado y añade una cascada de modelos.
6. Se cargan el CV y el perfil de LinkedIn como fuentes de verdad y se sustituye el contenido de relleno.
7. Se añaden el timeline y el mapa interactivos.
8. Petición de rendimiento: se mide, se optimiza y se vuelve a medir (Lighthouse móvil de 75 a 94).
9. Modo historia: la portada pasa a ser una narración que avanza sola.
10. Vídeo con autoplay, textos con el tono del autor, ajuste de márgenes y publicación en GitHub.

## 4. Errores de la IA y cómo se detectaron

Esta es la parte más importante del trabajo: **la IA se equivoca, y hay que diseñar el proceso para detectarlo**.

| Error | Quién | Cómo se detectó | Corrección |
|---|---|---|---|
| Métricas inventadas (99,2% PR-AUC, "millones de registros", "<80 ms", "100% de fiabilidad") | Antigravity | Revisión del contenido contra el CV y LinkedIn | Eliminadas; principio I de la constitución |
| Usuario de GitHub (`juanbernu`) y dominio (`juanbernu.com`) inventados | Antigravity | Búsqueda en todo el repositorio antes de publicar | Sustituidos por los reales o eliminados |
| Disponibilidad inventada en el chatbot ("reubicación", "remoto") | Antigravity | Auditoría de `knowledge/` | Reescrito con el texto literal de LinkedIn |
| Clave real de la API en `.env.example` (archivo que se sube a Git) | Antigravity | Revisión de los archivos de entorno | Clave sustituida por un valor de ejemplo; historial revisado |
| Nombre del autor incorrecto en los primeros prompts | Claude | El propio autor | Corregido; lección: no completar datos personales desde suposiciones |
| Componentes creados pero nunca conectados (paleta de comandos, avisos) | Antigravity | Búsqueda de importaciones | Conectados en `App.tsx` |
| Modelo de Gemini retirado: el chat no respondía | Cambio externo | Prueba manual y consulta de la página de deprecaciones | Cascada de modelos y mensajes de error legibles |
| Archivo copiado en versión antigua (datos del mapa) | Claude (proceso) | Verificación del tamaño y del contenido tras copiarlo | Copiado de nuevo y verificado |
| El botón flotante tapaba controles en móvil | Claude | Capturas en 390 px | Se oculta mientras se ve la historia |
| Línea del Gantt, barra superior partida, solapes | Antigravity/Claude | Capturas en varias resoluciones | Ajustes de maquetación |

## 5. Buenas prácticas aplicadas

- **Fuentes de verdad explícitas.** El CV en PDF y LinkedIn. Todo lo demás es sospechoso.
- **Prompts con criterios de aceptación.** No "hazlo bonito", sino "contraste AA, márgenes iguales en 1366/1440/1920/2560, sin `font-mono` salvo fechas".
- **Medir antes y después.** Lighthouse antes de optimizar; cada cambio se justifica con datos.
- **Verificación independiente del agente.** El agente que escribe el código no da por bueno su trabajo sin capturas y pruebas.
- **Humano en el bucle para lo irreversible.** Publicar, borrar o cambiar contenido personal requiere confirmación.
- **Secretos fuera del alcance de la IA.** Los agentes tienen prohibido leer `.env.local`.
- **Contexto persistente para agentes.** `AGENTS.md` y la constitución hacen que cualquier agente nuevo trabaje con las mismas reglas.
- **Cambiar de herramienta sin perder el hilo.** Cuando Antigravity se quedó sin créditos, otro agente continuó porque el estado estaba en el repositorio y no en una conversación.

## 6. Lecciones aprendidas

1. **La IA rellena huecos con datos plausibles.** Si no le das el dato, lo inventa. Por eso se le prohíbe explícitamente y se audita.
2. **"Que no parezca IA" es un requisito de diseño.** Los valores por defecto de los generadores (neón, cristal, degradados) se reconocen enseguida.
3. **Los agentes trabajan mejor con especificaciones que con conversaciones.** Un `spec.md` con criterios de aceptación es más fiable que diez mensajes de chat.
4. **Las dependencias de IA caducan.** Un modelo puede retirarse en semanas; el código debe tolerarlo.
5. **El rendimiento se pierde fácil con IA.** Los agentes tienden a añadir librerías pesadas para efectos pequeños (859 KB de Three.js para 40 puntos).

## 7. Limitaciones

- Algunas pruebas se hicieron en un entorno sin acceso a la API de Google, así que la respuesta real del modelo se probó desde el ordenador del autor.
- Las cachés del asistente son en memoria: en Vercel duran mientras la instancia esté activa.
