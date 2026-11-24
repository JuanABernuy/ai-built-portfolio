# 006 · Plan técnico

- **Reproductor** (`src/components/story/StorySection.tsx`): un único bucle `requestAnimationFrame` actualiza las barras escribiendo directamente en el DOM, sin re-renderizar React en cada frame. Se pausa con `IntersectionObserver`, `visibilitychange` y el estado del chat.
- **Capítulo de vídeo:** el progreso se lee de `video.currentTime`, `onEnded` avanza al siguiente capítulo y, si el vídeo falla, se usa un temporizador.
- **Política de autoplay:** primero `play()` con sonido; si falla, `muted = true` y `play()` otra vez, más un detector de la primera interacción (`pointerdown` o `keydown`) para activar el sonido.
- **Vídeo:** reorganizado con `-movflags +faststart` (sin recomprimir) para que empiece a reproducirse antes de descargarse entero. Portada en JPEG a partir del primer fotograma.
- **Visuales por capítulo** (`StoryVisuals.tsx`): solo Framer Motion. El mapa del Erasmus se precarga un capítulo antes.
- **Espaciado:** secciones `py-14 sm:py-16` y recorrido fijo del pipeline reducido de 1.400 a 800 px.
