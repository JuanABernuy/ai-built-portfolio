/**
 * Gemini called straight from the browser, for static hosting (GitHub Pages)
 * where there is no server to hide the key.
 *
 * The key comes from VITE_GEMINI_API_KEY at build time (a GitHub Actions secret),
 * so it is never in the repo, but it IS visible in the published JavaScript.
 * Accepted on purpose: it is a free-tier key with no billing, restricted to the
 * site's domain and to the Generative Language API (see specs/007-ia-en-github-pages).
 *
 * The whole knowledge base is ~13 KB, so it is sent as context in full:
 * no embeddings needed in the browser.
 */
import { SYSTEM_PROMPT } from './systemPrompt';

export const BROWSER_KEY: string | undefined = import.meta.env.VITE_GEMINI_API_KEY || undefined;

const MODELS = [
  import.meta.env.VITE_GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
].filter((m, i, a): m is string => !!m && a.indexOf(m) === i);

const files = import.meta.glob('../../knowledge/*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;
let knowledge: Promise<string> | null = null;
const loadKnowledge = () =>
  (knowledge ??= Promise.all(
    Object.entries(files).map(async ([path, load]) => `[Source: ${path.split('/').pop()}]\n${await load()}`)
  ).then(parts => parts.join('\n\n---\n\n')));

const deadModels = new Set<string>();
let workingModel: string | undefined;

export class GeminiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function browserErrorMessage(err: unknown, lang: string): string {
  const es = lang === 'es';
  const status = err instanceof GeminiError ? err.status : 0;
  if (status === 429)
    return es
      ? 'El chat ha llegado a su límite de uso por hoy. Prueba más tarde o escríbeme por LinkedIn.'
      : 'The chat has hit its usage limit for now. Try again later or message me on LinkedIn.';
  if (status === 400 || status === 403)
    return es ? 'El chat no está disponible ahora mismo.' : 'The chat is not available right now.';
  if (status === 503)
    return es ? 'Gemini está saturado. Inténtalo en unos segundos.' : 'Gemini is busy. Try again in a few seconds.';
  return es ? 'No se pudo generar la respuesta. Inténtalo de nuevo.' : 'Could not generate the answer. Please try again.';
}

export async function streamFromBrowser(question: string, onChunk: (text: string) => void): Promise<void> {
  if (!BROWSER_KEY) throw new GeminiError(0, 'no key');
  const context = await loadKnowledge();
  const prompt = `USER QUERY:
"${question.slice(0, 450)}"

KNOWLEDGE BASE CONTEXT:
${context}

Remember:
- Speak about Juan in the third person.
- Answer in the same language as the user's query.
- Only state facts supported by the context above.
- Be concise, direct, and professional.`;

  const candidates = [workingModel, ...MODELS].filter(
    (m, i, a): m is string => !!m && a.indexOf(m) === i && !deadModels.has(m)
  );

  let lastErr: unknown = new GeminiError(404, 'no model');
  for (const model of candidates) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': BROWSER_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }),
      }
    );

    if (res.status === 404) {
      deadModels.add(model);
      lastErr = new GeminiError(404, model);
      continue;
    }
    if (!res.ok || !res.body) throw new GeminiError(res.status, await res.text().catch(() => ''));

    workingModel = model;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';
      for (const ev of events) {
        const line = ev.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        try {
          const json = JSON.parse(line.slice(5));
          const text = (json.candidates?.[0]?.content?.parts || [])
            .filter((p: any) => !p.thought)
            .map((p: any) => p.text || '')
            .join('');
          if (text) onChunk(text);
        } catch {
          /* ignore partial event */
        }
      }
    }
    return;
  }
  throw lastErr;
}
