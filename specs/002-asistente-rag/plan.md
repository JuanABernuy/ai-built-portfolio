# 002 · Plan técnico

## Flujo
```
knowledge/*.md ──(npm run embed)──► chunks + embeddings (gemini-embedding-001)
                                             │
pregunta ──► embedding de la pregunta ──► similitud coseno ──► top 4 fragmentos
                                             │
                     prompt de sistema + contexto ──► Gemini Flash ──► SSE al navegador
```

## Componentes
- `scripts/build-embeddings.ts`: trocea el Markdown y genera los embeddings.
- `src/server/rag-service.ts`: lógica compartida (recuperación, BM25 de respaldo, cascada de modelos, mensajes de error legibles y cachés).
- `api/chat.ts`: función serverless para Vercel.
- `vite.config.ts`: middleware equivalente para desarrollo local.
- `src/components/chat/ChatDrawer.tsx`: interfaz, cargada solo cuando se abre.

## Decisiones
- **Cascada de modelos.** `GEMINI_MODEL` → `gemini-3.8-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-2.5-flash`. Motivo: el modelo original (`gemini-2.5-flash`) fue retirado y la web dejó de responder.
- **Caché en memoria.** Las respuestas a preguntas repetidas (6 h) y los embeddings de preguntas ya vistas se reutilizan. Responde al instante y gasta menos cuota.
- **Una única fuente de lógica** para local y Vercel, que antes estaba duplicada.
