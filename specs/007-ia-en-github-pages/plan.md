# 007 · Plan

- `src/lib/systemPrompt.ts`: prompt del sistema compartido entre servidor y navegador.
- `src/lib/browserGemini.ts`: llamada REST a `streamGenerateContent?alt=sse` con `fetch` (sin `@google/genai` en el navegador, 2,4 KB gzip). La base de conocimiento entera (~13 KB) va como contexto, así que no hacen falta embeddings en el cliente.
- `ChatDrawer.tsx`: orden de intento → `/api/chat` → Gemini desde el navegador → respuesta local.
- `.github/workflows/deploy-pages.yml`: pasa `secrets.GEMINI_API_KEY` como `VITE_GEMINI_API_KEY` en el build.
- `src/env.d.ts`: tipos de las variables `VITE_*`.

Riesgo aceptado: cualquiera puede copiar la clave. Mitigación: sin facturación, restricciones de dominio y API, cuota baja, y rotarla si hay uso raro.
