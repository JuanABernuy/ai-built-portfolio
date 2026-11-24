import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load local environment files for development
const envLocal = path.resolve(process.cwd(), '.env.local');
const envDefault = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api-chat-middleware',
      configureServer(server) {
        server.middlewares.use('/api/chat', async (req, res, next) => {
          if (req.method !== 'POST') {
            return next();
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const { message, lang = 'en' } = parsed;

              if (!message || typeof message !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Message is required' }));
              }

              // Server-Sent Events headers
              res.writeHead(200, {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
              });

              const sendChunk = (text: string) => {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              };

              const sendDone = (metadata?: any) => {
                res.write(`data: ${JSON.stringify({ done: true, ...metadata })}\n\n`);
                res.end();
              };

              // Dynamic import of RAG service
              const { retrieveContext, streamGeminiAnswer, MAX_INPUT_LENGTH, answerCacheKey, getCachedAnswer, setCachedAnswer } = await server.ssrLoadModule('/src/server/rag-service.ts');

              if (message.length > MAX_INPUT_LENGTH) {
                sendChunk(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`);
                return sendDone({ error: true });
              }

              const apiKey = process.env.GEMINI_API_KEY?.trim();
              const geminiModel = process.env.GEMINI_MODEL?.trim() || undefined;
              const embedModel = process.env.GEMINI_EMBED_MODEL?.trim() || 'text-embedding-004';

              const cacheKey = answerCacheKey(message, lang);
              const cached = apiKey ? getCachedAnswer(cacheKey) : null;
              if (cached) {
                sendChunk(cached);
                return sendDone({ cached: true });
              }

              const { chunks, mode } = await retrieveContext(message, apiKey, embedModel, 4);

              // If Gemini API key is missing, provide graceful BM25 fallback
              if (!apiKey) {
                const isSpanish = lang === 'es' || /[áéíóúñ¿¡]/.test(message.toLowerCase());
                const notice = isSpanish
                  ? `⚙️ **[Modo de demostración local]**: La clave de API de Gemini (\`GEMINI_API_KEY\`) aún no ha sido añadida en \`.env.local\`.\n\n` +
                    `Aun así, he recuperado los siguientes datos coincidentes de la base de conocimiento de Juan Andrés usando búsqueda local BM25:\n\n`
                  : `⚙️ **[Local Preview Mode]**: The Gemini API key (\`GEMINI_API_KEY\`) is not yet set in \`.env.local\`.\n\n` +
                    `Here are the relevant facts retrieved from Juan Andrés's verified knowledge base via local BM25 keyword matching:\n\n`;

                sendChunk(notice);

                for (const chunk of chunks) {
                  sendChunk(`### ${chunk.title}\n${chunk.content}\n\n`);
                }

                const footer = isSpanish
                  ? `\n\n*(Para activar respuestas conversacionales en tiempo real con Gemini 2.5 Flash, añade tu clave en \`.env.local\` y ejecuta \`npm run embed\`)*`
                  : `\n\n*(To enable real-time conversational responses with Gemini 2.5 Flash, add your key to \`.env.local\` and run \`npm run embed\`)*`;

                sendChunk(footer);
                return sendDone({ mode: 'unconfigured_bm25', count: chunks.length });
              }

              // Run live Gemini stream with context
              const contextText = chunks
                .map((c: any, i: number) => `[Source ${i + 1}: ${c.title}]\n${c.content}`)
                .join('\n\n---\n\n');

              const promptWithContext = `
USER QUERY:
"${message}"

RETRIEVED KNOWLEDGE BASE CONTEXT:
${contextText}

Remember:
- Speak about Juan in the third person.
- Answer in the same language as the user's query.
- Only state facts supported by the context above.
- Be concise, direct, and professional.
`.trim();

              let full = '';
              const { model } = await streamGeminiAnswer({
                apiKey,
                preferredModel: geminiModel,
                prompt: promptWithContext,
                onChunk: (text: string) => {
                  full += text;
                  sendChunk(text);
                },
              });
              setCachedAnswer(cacheKey, full);
              console.log(`[chat] answered with ${model} (${mode} retrieval, ${chunks.length} chunks)`);

              sendDone({ mode, count: chunks.length });
            } catch (err: any) {
              console.error('Dev chat middleware error:', err);
              let friendly = 'Unknown error';
              try {
                const { friendlyError } = await server.ssrLoadModule('/src/server/rag-service.ts');
                friendly = friendlyError(err, (body && JSON.parse(body).lang) || 'en');
              } catch { /* keep default */ }
              res.write(`data: ${JSON.stringify({ text: `\n\n⚠️ ${friendly}` })}\n\n`);
              res.write(`data: ${JSON.stringify({ done: true, error: true })}\n\n`);
              res.end();
            }
          });
        });
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
