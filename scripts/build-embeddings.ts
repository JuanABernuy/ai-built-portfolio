import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import { fileURLToPath } from 'url';

// Load .env.local first, fallback to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envLocalPath = path.resolve(projectRoot, '.env.local');
const envPath = path.resolve(projectRoot, '.env');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export interface ChunkRecord {
  id: string;
  source: string;
  title: string;
  content: string;
  embedding?: number[];
  tokenEstimate: number;
}

const KNOWLEDGE_DIR = path.resolve(projectRoot, 'knowledge');
const OUTPUT_FILE = path.resolve(projectRoot, 'src/data/knowledge-chunks.json');

function chunkMarkdown(filename: string, content: string): ChunkRecord[] {
  const sections = content.split(/\n(?=##?\s+)/);
  const chunks: ChunkRecord[] = [];
  const baseName = path.basename(filename, '.md');

  sections.forEach((section, idx) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    // Further split section if it's very large (> 2000 chars)
    if (trimmed.length > 2000) {
      const paragraphs = trimmed.split(/\n\n+/);
      let currentChunk = '';

      paragraphs.forEach((p, pIdx) => {
        if ((currentChunk + '\n\n' + p).length > 1800) {
          if (currentChunk.trim()) {
            chunks.push({
              id: `${baseName}-${idx}-${pIdx}`,
              source: filename,
              title: `${baseName} (Part ${chunks.length + 1})`,
              content: currentChunk.trim(),
              tokenEstimate: Math.round(currentChunk.length / 4),
            });
          }
          currentChunk = p;
        } else {
          currentChunk = currentChunk ? `${currentChunk}\n\n${p}` : p;
        }
      });

      if (currentChunk.trim()) {
        chunks.push({
          id: `${baseName}-${idx}-end`,
          source: filename,
          title: `${baseName} (Part ${chunks.length + 1})`,
          content: currentChunk.trim(),
          tokenEstimate: Math.round(currentChunk.length / 4),
        });
      }
    } else {
      const titleMatch = trimmed.match(/^#+\s+(.+)/);
      const title = titleMatch ? titleMatch[1] : `${baseName} Section ${idx + 1}`;
      chunks.push({
        id: `${baseName}-${idx}`,
        source: filename,
        title,
        content: trimmed,
        tokenEstimate: Math.round(trimmed.length / 4),
      });
    }
  });

  return chunks;
}

async function main() {
  console.log('⚡ [RAG Build] Starting knowledge base indexing...');

  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`❌ Knowledge directory not found at ${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md'));
  const allChunks: ChunkRecord[] = [];

  for (const file of files) {
    const fullPath = path.join(KNOWLEDGE_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const chunks = chunkMarkdown(file, content);
    console.log(`📄 Indexed ${file} into ${chunks.length} chunks`);
    allChunks.push(...chunks);
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  let embedModel = process.env.GEMINI_EMBED_MODEL?.trim() || 'gemini-embedding-001';
  if (embedModel === 'text-embedding-004') {
    embedModel = 'gemini-embedding-001';
  }

  if (!apiKey) {
    console.warn('\n⚠️  GEMINI_API_KEY is not set or empty in .env.local.');
    console.warn('⚡ Saving chunked knowledge base with BM25 keyword fallback capabilities.');
    console.warn('👉 To generate semantic vector embeddings, add your GEMINI_API_KEY in .env.local and run `npm run embed`.\n');
  } else {
    console.log(`\n🔮 Generating vector embeddings using model: ${embedModel}...`);
    const ai = new GoogleGenAI({ apiKey });

    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i];
      try {
        process.stdout.write(`Embedding chunk ${i + 1}/${allChunks.length} (${chunk.title})... `);
        const res = await ai.models.embedContent({
          model: embedModel,
          contents: chunk.content,
        });

        const vector = (res as any).embedding?.values || (res as any).embeddings?.[0]?.values;
        if (vector && Array.isArray(vector)) {
          chunk.embedding = vector;
          console.log(`✓ (${vector.length} dims)`);
        } else {
          console.log(`⚠️ (No vector returned)`);
        }
      } catch (err: any) {
        console.error(`\n❌ Failed to embed chunk ${chunk.id}:`, err?.message || err);
      }
    }
  }

  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2), 'utf-8');
  console.log(`\n✅ Successfully saved ${allChunks.length} knowledge chunks to:`);
  console.log(`   ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Fatal error building embeddings:', err);
  process.exit(1);
});
