# 006 · Modo historia, vídeo y tono

**Estado:** Implementado · **Fecha:** 24-11-2026

## Contexto
Petición: "más para vagos, que no tengas ni siquiera que hacer scroll, que sea un storytelling". Además: el vídeo debe empezar nada más cargar, hay que quitar espacios innecesarios y los textos deben sonar a mí, no a un robot.

## Historias de usuario
- **H1.** Como reclutador con prisa, quiero entender la trayectoria de Juan sin tocar nada.
- **H2.** Como visitante, quiero poder pausar, avanzar o saltar la historia.
- **H3.** Como Juan, quiero que mi vídeo sea lo primero que se ve y se oiga.

## Requisitos funcionales
- **FR-001** La primera pantalla es una historia de 8 capítulos que avanza sola: intro, inicios, Zamora, Erasmus, Bullboat, IA, lo que me define y contacto.
- **FR-002** Barras de progreso tipo stories, pausa y reproducción, anterior y siguiente, teclado (← → espacio) y toques en móvil.
- **FR-003** La historia se pausa al salir de pantalla, al cambiar de pestaña o al abrir el chat.
- **FR-004** El vídeo se reproduce al cargar la página. Si el navegador bloquea el sonido, arranca en silencio con un botón visible y activa el sonido con la primera interacción.
- **FR-005** El primer capítulo dura lo mismo que el vídeo.
- **FR-006** Narración por voz opcional (Web Speech API).
- **FR-007** "Ver la web completa" lleva al resto de la página.

## Requisitos de contenido
- **FR-008** Textos en primera persona, frases cortas y ejemplos concretos, siguiendo el estilo del resumen de LinkedIn del autor.

## Criterios de aceptación
- Con el autoplay con sonido permitido, el vídeo suena al cargar y la historia pasa al capítulo 2 al terminar.
- Con el autoplay con sonido bloqueado, el vídeo arranca en silencio y el primer clic activa el sonido y lo reinicia.
- En 1366×768 y 390×844 ningún capítulo corta texto.
