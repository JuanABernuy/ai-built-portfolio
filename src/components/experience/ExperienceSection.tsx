import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, CheckCircle, ChevronLeft, ChevronRight, Briefcase, GraduationCap, Link as LinkIcon, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { AskAIButton } from '../common/AskAIButton';
import { tagMatchesSkill } from '../../lib/skillMatch';
import { readHash, setHash } from '../../lib/askAI';

type Kind = 'work' | 'education';
type Item = {
  id: string;
  kind: Kind;
  role: string;
  company: string;
  period: string;
  status?: string;
  location: string;
  summary: string;
  highlights: string[];
  tags: string[];
  start: string;
  end: string;
};
type Filter = 'all' | Kind;

const toMonths = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};

export const ExperienceSection: React.FC<{ highlightedSkill?: string | null }> = ({ highlightedSkill = null }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const L = t.experience.timeline;
  const now = new Date();
  const nowM = now.getFullYear() * 12 + now.getMonth();

  const [filter, setFilter] = useState<Filter>('work');
  const [skillFilterHidden, setSkillFilterHidden] = useState(false);
  useEffect(() => setSkillFilterHidden(false), [highlightedSkill]);
  const skill = skillFilterHidden ? null : highlightedSkill;

  const all = useMemo<Item[]>(
    () => [
      ...(t.experience.roles as Omit<Item, 'kind'>[]).map(r => ({ ...r, kind: 'work' as const })),
      ...(t.experience.educationItems as Omit<Item, 'kind'>[]).map(e => ({ ...e, kind: 'education' as const })),
    ],
    [t.experience.roles, t.experience.educationItems]
  );

  const items = useMemo(
    () =>
      all
        .filter(i => filter === 'all' || i.kind === filter)
        .sort((a, b) => toMonths(b.start) - toMonths(a.start)),
    [all, filter]
  );

  const [selectedId, setSelectedId] = useState<string>(() => all.find(i => i.kind === 'work')?.id ?? all[0]?.id);

  // Deep links: #role-<id> selects that entry and scrolls to the timeline
  useEffect(() => {
    const id = readHash('role-');
    const hit = id && all.find(i => i.id === id);
    if (hit) {
      if (hit.kind === 'education') setFilter('all');
      setSelectedId(hit.id);
      setTimeout(() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the selection valid when the filter changes
  useEffect(() => {
    if (!items.some(i => i.id === selectedId) && items[0]) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const select = (id: string) => {
    setSelectedId(id);
    setHash(`role-${id}`);
  };

  const selectedIndex = Math.max(0, items.findIndex(r => r.id === selectedId));
  const selected = items[selectedIndex];

  const matchesSkill = (i: Item) => !!skill && i.tags.some(tag => tagMatchesSkill(tag, skill));
  const anyMatch = !!skill && items.some(matchesSkill);

  // Axis
  const endOf = (i: Item) => (i.end ? toMonths(i.end) : nowM);
  const minYear = Math.floor(Math.min(...items.map(r => toMonths(r.start))) / 12);
  const maxYear = Math.max(Math.floor(nowM / 12) + 1, Math.ceil((Math.max(...items.map(endOf)) + 1) / 12));
  const axisStart = minYear * 12;
  const span = maxYear * 12 - axisStart;
  const pct = (m: number) => ((m - axisStart) / span) * 100;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // Lanes: work first, then studies, so the two groups never mix
  const laid = useMemo(() => {
    const out: Record<string, number> = {};
    let offset = 0;
    for (const kind of ['work', 'education'] as Kind[]) {
      const group = items.filter(i => i.kind === kind).sort((a, b) => toMonths(a.start) - toMonths(b.start));
      const laneEnds: number[] = [];
      for (const r of group) {
        const s = toMonths(r.start);
        let lane = laneEnds.findIndex(end => end <= s);
        if (lane === -1) {
          lane = laneEnds.length;
          laneEnds.push(endOf(r));
        } else laneEnds[lane] = endOf(r);
        out[r.id] = offset + lane;
      }
      offset += laneEnds.length;
    }
    return { lanes: out, count: offset };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, nowM]);

  const duration = (r: Item) => {
    const months = Math.max(1, endOf(r) - toMonths(r.start));
    if (months < 12) return `${months} ${L.months}`;
    const y = Math.floor(months / 12);
    const m = months % 12;
    const yLabel = lang === 'es' ? (y === 1 ? 'año' : 'años') : y === 1 ? 'yr' : 'yrs';
    return m ? `${y} ${yLabel} ${m} ${L.months}` : `${y} ${yLabel}`;
  };

  const step = (dir: 1 | -1) => {
    const asc = [...items].sort((a, b) => toMonths(a.start) - toMonths(b.start));
    const i = asc.findIndex(r => r.id === selectedId);
    select(asc[Math.min(asc.length - 1, Math.max(0, i + dir))].id);
  };

  const onTrackKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    }
  };

  const copyLink = async () => {
    if (!selected) return;
    const url = `${window.location.origin}${window.location.pathname}#role-${selected.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(L.linkCopied, 'success');
    } catch {
      /* ignore */
    }
  };

  const askQuestion = (i: Item) =>
    (i.kind === 'work' ? L.askRoleQ : L.askEduQ).replace('{role}', i.role).replace('{company}', i.company);

  const LANE_H = 56;
  const filters: { id: Filter; label: string }[] = [
    { id: 'work', label: L.filterWork },
    { id: 'education', label: L.filterEducation },
    { id: 'all', label: L.filterAll },
  ];

  return (
    <section id="experience" className="py-14 sm:py-16 bg-white border-b border-slate-200">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8"
        >
          <div className="text-left space-y-2">
            <div className="text-xs font-semibold text-blue-700 tracking-wider uppercase">{t.experience.subtitle}</div>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0B2A4A] tracking-tight leading-tight">
              {t.experience.title}
            </h2>
            <p className="text-sm text-slate-500">{L.hint}</p>
          </div>

          <div role="radiogroup" aria-label={t.experience.title} className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 self-start lg:self-auto">
            {filters.map(f => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`relative px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  filter === f.id ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === f.id && (
                  <motion.span layoutId="tl-filter" className="absolute inset-0 rounded-md bg-[#0B2A4A]" transition={{ duration: 0.25 }} />
                )}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Skill highlight banner (from the Skills section) */}
        <AnimatePresence>
          {skill && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {L.skillFilter} <strong>{skill}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSkillFilterHidden(true)}
                  aria-label={L.clearSkill}
                  className="ml-1 w-5 h-5 rounded hover:bg-blue-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Desktop / tablet: Gantt-style timeline ---------- */}
        <div className="hidden md:block">
          <div
            tabIndex={0}
            role="listbox"
            aria-label={t.experience.title}
            aria-activedescendant={`tl-${selectedId}`}
            onKeyDown={onTrackKey}
            className="relative rounded-xl border border-slate-200 bg-[#F8FAFC] px-5 pt-6 pb-10 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            <motion.div className="relative" animate={{ height: laid.count * LANE_H }} transition={{ duration: 0.3 }}>
              {years.map(y => (
                <div key={y} className="absolute top-0 bottom-0 border-l border-dashed border-slate-200" style={{ left: `${pct(y * 12)}%` }}>
                  <span className="absolute -bottom-8 -translate-x-1/2 text-xs font-mono text-slate-500">{y}</span>
                </div>
              ))}

              <div className="absolute top-[-10px] bottom-0 w-px bg-blue-700" style={{ left: `${pct(nowM)}%` }}>
                <span className="absolute -top-5 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-[#F8FAFC] px-1">
                  {L.today}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {items.map(r => {
                  const s = toMonths(r.start);
                  const e = endOf(r);
                  const future = e > nowM && !!r.end;
                  const isSel = r.id === selectedId;
                  const isEdu = r.kind === 'education';
                  const dim = anyMatch && !matchesSkill(r);
                  const glow = anyMatch && matchesSkill(r);
                  return (
                    <motion.button
                      id={`tl-${r.id}`}
                      key={r.id}
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      tabIndex={-1}
                      onClick={() => select(r.id)}
                      title={`${r.role} · ${r.company} · ${r.period}`}
                      layout
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: dim ? 0.35 : 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        left: `${pct(s)}%`,
                        width: `${Math.max(pct(e) - pct(s), 2)}%`,
                        top: laid.lanes[r.id] * LANE_H + 6,
                        height: LANE_H - 14,
                        originX: 0,
                      }}
                      className={`group absolute rounded-lg border text-left pl-3 pr-2 overflow-hidden transition-colors cursor-pointer flex items-center gap-2 ${
                        isSel
                          ? 'bg-[#0B2A4A] border-[#0B2A4A] text-white shadow-md'
                          : isEdu
                          ? 'bg-blue-50 border-blue-200 text-slate-800 hover:border-blue-700'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-blue-700 hover:shadow-sm'
                      } ${glow ? 'ring-2 ring-blue-600 ring-offset-1' : ''} ${future ? 'border-dashed' : ''}`}
                    >
                      {isEdu && <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-blue-200' : 'text-blue-700'}`} />}
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold leading-tight truncate">{r.role}</span>
                        <span className={`block text-[11px] truncate ${isSel ? 'text-blue-200' : 'text-slate-500'}`}>{r.company}</span>
                      </span>
                      {!r.end && (
                        <span className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent ${isSel ? 'to-[#1D4ED8]' : 'to-blue-100'}`} />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* ---------- Mobile: vertical timeline ---------- */}
        <ol className="md:hidden relative border-l-2 border-slate-200 ml-2 space-y-3">
          {items.map(r => {
            const isSel = r.id === selectedId;
            const dim = anyMatch && !matchesSkill(r);
            return (
              <li key={r.id} className={`relative pl-6 transition-opacity ${dim ? 'opacity-40' : ''}`}>
                <span className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white ${isSel ? 'bg-[#0B2A4A]' : r.kind === 'education' ? 'bg-blue-300' : 'bg-slate-300'}`} />
                <button
                  type="button"
                  onClick={() => select(r.id)}
                  aria-pressed={isSel}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${isSel ? 'border-blue-700 bg-blue-50/40' : 'border-slate-200 bg-white'}`}
                >
                  <span className="block text-[12px] font-mono text-slate-500">{r.period}</span>
                  <span className="block text-base font-semibold text-slate-900">{r.role}</span>
                  <span className="block text-sm text-blue-700">{r.company}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* ---------- Detail panel ---------- */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.article
                key={selected.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8"
                aria-live="polite"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    <span className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      {selected.kind === 'education' ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">{selected.company}</span>
                        {selected.kind === 'work' && !selected.end && selected.status && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">{selected.status}</span>
                        )}
                        {selected.end && toMonths(selected.end) > nowM && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">{L.planned}</span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{selected.role}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-mono text-[13px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {selected.period}
                          {selected.kind === 'work' && <> · {duration(selected)}</>}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {selected.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={copyLink}
                      aria-label={L.copyLink}
                      title={L.copyLink}
                      className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={L.prev}
                      title={L.prev}
                      className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-500 tabular-nums min-w-[3rem] text-center">
                      {items.length - selectedIndex} / {items.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={L.next}
                      title={L.next}
                      className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-[75ch] mb-5">{selected.summary}</p>

                {selected.highlights.length > 0 && (
                  <>
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">{L.responsibilities}</h4>
                    <ul className="space-y-2.5 mb-6">
                      {selected.highlights.map((h, i) => (
                        <motion.li
                          key={h}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.04 * i }}
                          className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                        >
                          <CheckCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(tag => {
                      const hit = !!skill && tagMatchesSkill(tag, skill);
                      return (
                        <span
                          key={tag}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                            hit ? 'bg-blue-700 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-200/80'
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                  <AskAIButton
                    question={askQuestion(selected)}
                    label={selected.kind === 'work' ? L.askRole : L.askEdu}
                    className="self-start sm:self-auto shrink-0"
                  />
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
