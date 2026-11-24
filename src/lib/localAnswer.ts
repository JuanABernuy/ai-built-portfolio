/**
 * Offline answers for static hosting (GitHub Pages), where there is no server
 * to call Gemini safely. Finds the sections of knowledge/*.md that best match
 * the question and returns them as they are. No API key involved.
 */
const files = import.meta.glob('../../knowledge/*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;

type Section = { title: string; body: string; tokens: Set<string> };
let sections: Section[] | null = null;

const STOP = new Set(
  ('a al de del el la las los lo un una y o en que es por para con sin sobre su sus se le me mi tu como cual cuál ' +
    'qué que quien quién donde dónde cuando cuándo the of and or to in on for with is are was what who where when how ' +
    'does do did his he juan andrés andres bernuy navarrete about tell me cuéntame háblame dime')
    .split(' ')
);

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ');

const tokenize = (s: string) => new Set(norm(s).split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)));

async function load(): Promise<Section[]> {
  if (sections) return sections;
  const texts = await Promise.all(Object.values(files).map(f => f()));
  sections = texts.flatMap(md =>
    md
      .split(/\n(?=##+\s)/)
      .map(part => {
        const [first, ...rest] = part.split('\n');
        const title = first.replace(/^#+\s*/, '').trim();
        const body = rest.join('\n').trim();
        return { title, body, tokens: tokenize(`${title} ${title} ${body}`) };
      })
      .filter(s => s.body.length > 20)
  );
  return sections;
}

export async function localAnswer(question: string, lang: string): Promise<string> {
  const es = lang === 'es';
  const q = tokenize(question);
  const all = await load();
  const ranked = all
    .map(s => ({ s, score: [...q].reduce((n, w) => n + (s.tokens.has(w) ? 1 : 0), 0) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const note = es
    ? 'Modo sin IA: esta versión de la web no tiene servidor, así que te muestro lo que dice mi CV sobre eso.'
    : "Offline mode: this version of the site has no server, so here's what my CV says about it.";

  if (!ranked.length) {
    return es
      ? `${note}\n\nNo he encontrado nada sobre eso. Puedes escribirme a Bernuynavarrete05@gmail.com o por LinkedIn.`
      : `${note}\n\nI couldn't find anything about that. You can email me at Bernuynavarrete05@gmail.com or reach me on LinkedIn.`;
  }
  const clean = (t: string) => t.replace(/\*\*/g, '').replace(/^- /gm, '• ').trim();
  return `${note}\n\n${ranked.map(r => `${r.s.title}\n${clean(r.s.body)}`).join('\n\n')}`;
}
