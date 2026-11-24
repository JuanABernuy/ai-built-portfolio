export interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: any;
  socket?: { remoteAddress?: string };
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string | string[]) => void;
  writeHead: (statusCode: number, headers?: Record<string, string>) => void;
  write: (chunk: any) => boolean;
  end: () => void;
}
import {
  checkRateLimit,
  retrieveContext,
  streamGeminiAnswer,
  friendlyError,
  MAX_INPUT_LENGTH,
  answerCacheKey,
  getCachedAnswer,
  setCachedAnswer,
} from '../src/server/rag-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Security: Client IP & Rate Limiting
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || '127.0.0.1');

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before sending another request.',
    });
  }

  const { message, lang = 'en' } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message field is required and must be a string.' });
  }

  const trimmedQuery = message.trim();
  if (trimmedQuery.length === 0) {
    return res.status(400).json({ error: 'Query cannot be empty.' });
  }

  if (trimmedQuery.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({
      error: `Input too long. Maximum allowed length is ${MAX_INPUT_LENGTH} characters.`,
    });
  }

  // Server-Sent Events streaming setup
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendChunk = (text: string) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  };

  const sendDone = (metadata?: any) => {
    res.write(`data: ${JSON.stringify({ done: true, ...metadata })}\n\n`);
    res.end();
  };

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const geminiModel = process.env.GEMINI_MODEL?.trim() || undefined;
  const embedModel = process.env.GEMINI_EMBED_MODEL?.trim() || 'text-embedding-004';

  try {
    // Retrieve context from knowledge base
    const cacheKey = answerCacheKey(trimmedQuery, lang);
    const cached = apiKey ? getCachedAnswer(cacheKey) : null;
    if (cached) {
      sendChunk(cached);
      return sendDone({ cached: true });
    }

    const { chunks, mode } = await retrieveContext(trimmedQuery, apiKey, embedModel, 4);

    // Scenario A: API key is not yet configured by the user
    if (!apiKey) {
      const isSpanish = lang === 'es' || /[áéíóúñ¿¡]/.test(trimmedQuery.toLowerCase());
      
      const unconfiguredNotice = isSpanish
        ? `⚙️ **[Modo de demostración local]**: La clave de API de Gemini (\`GEMINI_API_KEY\`) aún no ha sido añadida en \`.env.local\`.\n\n` +
          `Aun así, he recuperado los siguientes datos coincidentes de la base de conocimiento de Juan Andrés usando búsqueda local BM25:\n\n`
        : `⚙️ **[Local Preview Mode]**: The Gemini API key (\`GEMINI_API_KEY\`) is not yet set in \`.env.local\`.\n\n` +
          `Here are the relevant facts retrieved from Juan Andrés's verified knowledge base via local BM25 keyword matching:\n\n`;

      sendChunk(unconfiguredNotice);

      // Stream summary of top matching chunks
      for (const chunk of chunks) {
        sendChunk(`### ${chunk.title}\n${chunk.content}\n\n`);
      }

      const footer = isSpanish
        ? `\n\n*(Para activar respuestas conversacionales en tiempo real con Gemini 2.5 Flash, añade tu clave en \`.env.local\` y ejecuta \`npm run embed\`)*`
        : `\n\n*(To enable real-time conversational responses with Gemini 2.5 Flash, add your key to \`.env.local\` and run \`npm run embed\`)*`;

      sendChunk(footer);
      return sendDone({ mode: 'unconfigured_bm25', retrievedChunks: chunks.length });
    }

    // Scenario B: API Key is configured -> Run full Gemini Flash RAG
    const contextText = chunks
      .map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.content}`)
      .join('\n\n---\n\n');

    const promptWithContext = `
USER QUERY:
"${trimmedQuery}"

RETRIEVED KNOWLEDGE BASE CONTEXT:
${contextText}

Remember:
- Speak about Juan in the third person.
- Answer in the same language as the user's query.
- Only state facts supported by the context above.
- Be concise, direct, and professional.
`.trim();

    let full = '';
    await streamGeminiAnswer({
      apiKey,
      preferredModel: geminiModel,
      prompt: promptWithContext,
      onChunk: text => {
        full += text;
        sendChunk(text);
      },
    });
    setCachedAnswer(cacheKey, full);

    sendDone({ mode, retrievedChunks: chunks.length });
  } catch (error: any) {
    console.error('Error during chat processing:', error);
    sendChunk(`\n\n⚠️ ${friendlyError(error, lang)}`);
    sendDone({ error: true });
  }
}
