# 007 · Asistente IA en GitHub Pages

## Problema
GitHub Pages solo sirve archivos estáticos: no existe `/api/chat`, así que el asistente no puede usar Gemini con la clave escondida en un servidor.

## Decisión del autor
Publicar en GitHub Pages y llamar a Gemini **desde el navegador**, aceptando que la clave sea visible. Condiciones:
- Clave propia de la web, en un proyecto de Google **sin facturación** (peor caso: se agota la cuota y el chat deja de responder un rato; no hay coste).
- Restringida a `https://juanabernuy.github.io/*` y a la Generative Language API.
- No se guarda en el repositorio: llega como secreto de GitHub Actions.

## Requisitos
- R1. Si el build tiene `VITE_GEMINI_API_KEY`, el chat responde con Gemini en streaming.
- R2. Se mantiene la lista de modelos de reserva (si uno está retirado, se prueba el siguiente).
- R3. Si se alcanza el límite (429) se avisa con un mensaje claro.
- R4. Sin clave o ante otro error, el chat responde en modo sin IA buscando en `knowledge/`.
- R5. En local y en Vercel no cambia nada: sigue mandando `/api/chat`.
