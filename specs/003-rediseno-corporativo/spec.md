# 003 · Rediseño corporativo y UI/UX

**Estado:** Implementado · **Fecha:** 23-11-2026

## Contexto
La primera versión tenía estética "consola futurista": neón cian y violeta, cristal, brillos, tipografía monoespaciada y efectos de texto que se descodifican. Resultado: "parece mucha IA". Quiero algo limpio y formal sin perder el movimiento.

## Requisitos
- **FR-001** Tema claro corporativo: azul marino y un único acento azul. Sin neón, cristal ni brillos.
- **FR-002** Mantener el cursor personalizado, el scroll suave y las animaciones al hacer scroll.
- **FR-003** Márgenes consistentes en todas las resoluciones de escritorio: todas las secciones alineadas al mismo borde.
- **FR-004** Funciones de UI/UX: resaltado de la sección activa, barra de progreso, volver arriba, menú móvil accesible, paleta de comandos (Ctrl/Cmd+K), filtros en skills y proyectos, modal accesible, avisos (toasts), enlace "saltar al contenido" y estilos de impresión.

## Criterios de aceptación
- En 1366, 1440, 1920 y 2560 px el contenido empieza en el mismo borde en todas las secciones y no hay desplazamiento horizontal.
- Toda la web es navegable con teclado y el foco siempre es visible.
- En el código no quedan colores neón ni efectos de brillo.
