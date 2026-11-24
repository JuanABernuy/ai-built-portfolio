import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import chunksData from '../data/knowledge-chunks.json';

export interface ChunkRecord {
  id: string;
  source: string;
  title: string;
  content: string;
  embedding?: number[];
  tokenEstimate: number;
}

const allChunks: ChunkRecord[] = chunksData as ChunkRecord[];

// In-memory rate limiting by IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_INPUT_LENGTH = 450;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimits.get(ip);

  if (!record || now > record.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

// Periodic cleanup of stale rate-limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimits.entries()) {
    if (now > record.resetAt) rateLimits.delete(ip);
  }
}, 5 * 60 * 1000);

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// BM25-style keyword fallback retrieval
export function retrieveBm25Fallback(query: string, topK = 4): ChunkRecord[] {
  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (terms.length === 0) {
    return allChunks.slice(0, topK);
  }

  const scored = allChunks.map(chunk => {
    const textLower = (chunk.title + ' ' + chunk.content).toLowerCase();
    let score = 0;
    for (const term of terms) {
      // Title match gives higher weight
      if (chunk.title.toLowerCase().includes(term)) {
        score += 5;
      }
      const count = (textLower.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length;
      score += count * 2;
      if (textLower.includes(term)) {
        score += 1;
      }
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.chunk);
}

export async function retrieveContext(
  query: string,
  apiKey?: string,
  embedModel = 'gemini-embedding-001',
  topK = 4
): Promise<{ chunks: ChunkRecord[]; mode: 'vector' | 'keyword' }> {
  const modelToUse = embedModel === 'text-embedding-004' ? 'gemini-embedding-001' : embedModel;
  // Check if embeddings are available and API key exists
  const hasEmbeddings = allChunks.some(c => Array.isArray(c.embedding) && c.embedding.length > 0);

  if (apiKey && hasEmbeddings) {
    try {
      let qVec: number[] | undefined = getCachedEmbedding(query);
      if (!qVec) {
        const ai = new GoogleGenAI({ apiKey });
        const embedRes = await ai.models.embedContent({
          model: modelToUse,
          contents: query,
        });
        qVec = (embedRes as any).embedding?.values || (embedRes as any).embeddings?.[0]?.values;
        if (qVec && Array.isArray(qVec)) setCachedEmbedding(query, qVec);
      }
      if (qVec && Array.isArray(qVec)) {
        const scored = allChunks
          .filter(c => Array.isArray(c.embedding) && c.embedding.length === qVec.length)
          .map(chunk => ({
            chunk,
            similarity: cosineSimilarity(qVec, chunk.embedding!),
          }));

        scored.sort((a, b) => b.similarity - a.similarity);
        return {
          chunks: scored.slice(0, topK).map(s => s.chunk),
          mode: 'vector',
        };
      }
    } catch (err) {
      console.warn('Vector embedding retrieval failed, falling back to BM25 keyword matching:', err);
    }
  }

  // Fallback to keyword matching
  return {
    chunks: retrieveBm25Fallback(query, topK),
    mode: 'keyword',
  };
}

import { SYSTEM_PROMPT } from '../lib/systemPrompt';
export { SYSTEM_PROMPT };

export { MAX_INPUT_LENGTH };


/* ------------------------------------------------------------------ */
/* Gemini generation helper: model fallback + readable error messages  */
/* ------------------------------------------------------------------ */

// Tried in order. The model from GEMINI_MODEL goes first; if Google has retired it
// (HTTP 404 / "no longer available") the next one is used automatically.
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
const deadModels = new Set<string>();
let lastWorkingModel: string | undefined;

function errorStatus(err: any): number | undefined {
  const raw = err?.status ?? err?.code ?? err?.error?.code;
  const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  if (typeof n === 'number' && !Number.isNaN(n)) return n;
  const m = String(err?.message || '').match(/"code"\s*:\s*(\d{3})/);
  return m ? parseInt(m[1], 10) : undefined;
}

function isModelGone(err: any): boolean {
  const msg = String(err?.message || '').toLowerCase();
  return errorStatus(err) === 404 || msg.includes('no longer available') || msg.includes('is not found');
}

export function friendlyError(err: any, lang: string = 'en'): string {
  const es = lang === 'es';
  const status = errorStatus(err);
  const msg = String(err?.message || '').toLowerCase();

  if (msg.includes('api key not valid') || msg.includes('api_key_invalid') || (status === 400 && msg.includes('api key'))) {
    return es
      ? 'La clave de Gemini no es válida. Revisa GEMINI_API_KEY en .env.local y reinicia el servidor.'
      : 'The Gemini API key is not valid. Check GEMINI_API_KEY in .env.local and restart the server.';
  }
  if (status === 403 || msg.includes('permission_denied')) {
    return es
      ? 'La clave de Gemini no tiene permiso para este modelo (¿restricciones de la clave o API no habilitada?).'
      : 'The Gemini key lacks permission for this model (key restrictions, or the API is not enabled).';
  }
  if (status === 404) {
    return es
      ? 'Ningún modelo de Gemini configurado está disponible. Cambia GEMINI_MODEL en .env.local por un modelo vigente.'
      : 'None of the configured Gemini models is available. Set GEMINI_MODEL in .env.local to a current model.';
  }
  if (status === 429 || msg.includes('quota') || msg.includes('resource_exhausted')) {
    return es
      ? 'Se ha alcanzado el límite de uso de la API de Gemini. Inténtalo de nuevo en un minuto.'
      : 'The Gemini API usage limit was reached. Please try again in a minute.';
  }
  if (status === 503 || msg.includes('overloaded') || msg.includes('unavailable')) {
    return es ? 'El servicio de Gemini está saturado. Inténtalo de nuevo en unos segundos.' : 'Gemini is overloaded right now. Please try again in a few seconds.';
  }
  return es ? 'No se pudo generar la respuesta. Inténtalo de nuevo.' : 'Could not generate the answer. Please try again.';
}

export async function streamGeminiAnswer(opts: {
  apiKey: string;
  preferredModel?: string;
  prompt: string;
  onChunk: (text: string) => void;
}): Promise<{ model: string }> {
  const ai = new GoogleGenAI({ apiKey: opts.apiKey });
  const ordered = [opts.preferredModel, lastWorkingModel, ...FALLBACK_MODELS].filter(
    (m, i, arr): m is string => !!m && arr.indexOf(m) === i && !deadModels.has(m)
  );
  const candidates = ordered.length ? ordered : FALLBACK_MODELS;

  let lastError: any;
  for (const model of candidates) {
    let sentAny = false;
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2,
          maxOutputTokens: 2048, // headroom: "thinking" models spend part of this budget internally
        },
      });
      for await (const chunk of stream) {
        if (chunk.text) {
          sentAny = true;
          opts.onChunk(chunk.text);
        }
      }
      lastWorkingModel = model;
      return { model };
    } catch (err: any) {
      lastError = err;
      if (!sentAny && isModelGone(err)) {
        console.warn(`[chat] Gemini model "${model}" is unavailable (${errorStatus(err) ?? 'n/a'}); trying the next one.`);
        deadModels.add(model);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}


/* ------------------------------------------------------------------ */
/* In-memory caches: repeated questions answer instantly               */
/* ------------------------------------------------------------------ */
const ANSWER_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ENTRIES = 300;
const answerCache = new Map<string, { text: string; at: number }>();
const embeddingCache = new Map<string, number[]>();

function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function answerCacheKey(question: string, lang: string): string {
  return `${lang}|${normalizeQuestion(question)}`;
}

export function getCachedAnswer(key: string): string | null {
  const hit = answerCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ANSWER_TTL_MS) {
    answerCache.delete(key);
    return null;
  }
  return hit.text;
}

export function setCachedAnswer(key: string, text: string) {
  if (!text.trim()) return;
  if (answerCache.size >= MAX_ENTRIES) answerCache.delete(answerCache.keys().next().value as string);
  answerCache.set(key, { text, at: Date.now() });
}

export function getCachedEmbedding(query: string): number[] | undefined {
  return embeddingCache.get(normalizeQuestion(query));
}

export function setCachedEmbedding(query: string, vec: number[]) {
  if (embeddingCache.size >= MAX_ENTRIES) embeddingCache.delete(embeddingCache.keys().next().value as string);
  embeddingCache.set(normalizeQuestion(query), vec);
}
