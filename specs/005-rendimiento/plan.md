# 005 · Plan técnico

| Problema medido | Solución |
|---|---|
| Three.js (859 KB) para unos 40 puntos decorativos, descargado incluso en móvil, donde no se mostraba | Reescritura en Canvas 2D con la misma proyección en perspectiva (unos 5 KB) |
| GSAP solo para fijar una sección al hacer scroll | `position: sticky` y el progreso de scroll de Framer Motion |
| Todo el JavaScript en un único archivo | Carga diferida del chat, el mapa, cada idioma y cada sección bajo la portada (`LazySection`) |
| Fuentes cargadas desde Google Fonts | Fuentes servidas desde la propia web, solo con caracteres latinos |
| Dependencias sin usar (`canvas-confetti`) | Eliminadas |
| Tareas largas al montar toda la página | Secciones montadas al acercarse a la vista; navegación por anclas que carga antes de desplazarse |
