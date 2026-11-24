# 001 · Plan técnico

## Stack elegido
- **Vite + React + TypeScript**: arranque rápido y tipado.
- **Tailwind CSS**: estilos consistentes con tokens.
- **Framer Motion**: animaciones de interfaz.
- **Lenis**: scroll suave.
- **Vercel**: hosting estático y función serverless para el asistente.

## Estructura
```
src/components/<sección>/   un componente por sección
src/content/{es,en}.json    todo el texto
src/context/                idioma y avisos (toasts)
public/                     CV, vídeo e iconos
```

## Decisiones
- El texto vive en JSON y el tipo de los dos idiomas se deriva de `en.json` para que TypeScript detecte claves que falten.
- La versión inicial usaba Three.js para el fondo 3D y GSAP para el scroll fijado; ambas se sustituyeron en la especificación 005.
