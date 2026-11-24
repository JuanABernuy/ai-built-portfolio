import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Link2, ArrowDownRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { tagMatchesSkill } from '../../lib/skillMatch';

interface SkillsSectionProps {
  onHighlightProject?: (projectId: string | null) => void;
  onHighlightSkill?: (skill: string | null) => void;
}

type Skill = { name: string; level: string; category: string; projects: string[] };

export const SkillsSection: React.FC<SkillsSectionProps> = ({ onHighlightProject, onHighlightSkill }) => {
  const { t, lang } = useLanguage();
  const es = lang === 'es';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hovered, setHovered] = useState<Skill | null>(null);
  const [pinned, setPinned] = useState<Skill | null>(null);
  const active = hovered ?? pinned;

  const L = es
    ? {
        all: 'Todas',
        technical: 'Técnica',
        soft: 'Transversal',
        level: { Expert: 'Experto', Advanced: 'Avanzado', Intermediate: 'Intermedio', Beginner: 'Básico' } as Record<string, string>,
        roles: (n: number) => `${n} ${n === 1 ? 'puesto' : 'puestos'}`,
        projects: (n: number) => `${n} ${n === 1 ? 'proyecto' : 'proyectos'}`,
        hint: 'Pulsa una skill para ver en qué puestos y proyectos la he usado.',
        usedIn: 'Usada en',
        seeTimeline: 'Ver en el timeline',
        clear: 'Quitar selección',
        none: 'Sin puestos asociados en el timeline',
      }
    : {
        all: 'All',
        technical: 'Technical',
        soft: 'Transferable',
        level: {} as Record<string, string>,
        roles: (n: number) => `${n} ${n === 1 ? 'role' : 'roles'}`,
        projects: (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`,
        hint: 'Click a skill to see the roles and projects where I used it.',
        usedIn: 'Used in',
        seeTimeline: 'See it on the timeline',
        clear: 'Clear selection',
        none: 'No linked roles on the timeline',
      };

  const categories = t.skills.categories;
  const allSkills = categories.flatMap(c => c.skills) as Skill[];
  const displayedSkills = (selectedCategory === 'all' ? allSkills : categories.find(c => c.id === selectedCategory)?.skills || []) as Skill[];

  const rolesFor = useMemo(() => {
    const roles = t.experience.roles;
    return (skill: string) => roles.filter(r => r.tags.some(tag => tagMatchesSkill(tag, skill)));
  }, [t.experience.roles]);

  const projectTitle = (id: string) => t.projects.items.find(p => p.id === id)?.title;

  const emit = (skill: Skill | null) => {
    onHighlightProject?.(skill && skill.projects.length > 0 ? skill.projects[0] : null);
  };

  const togglePin = (skill: Skill) => {
    const next = pinned?.name === skill.name ? null : skill;
    setPinned(next);
    onHighlightSkill?.(next ? next.name : null);
    emit(next);
  };

  const clear = () => {
    setPinned(null);
    onHighlightSkill?.(null);
    emit(null);
  };

  const activeRoles = active ? rolesFor(active.name) : [];
  const activeProjects = active ? active.projects.map(projectTitle).filter(Boolean) : [];

  return (
    <section id="skills" className="py-14 sm:py-16 bg-[#F8FAFC] border-b border-slate-200">
      <div className="site-container">
        <div className="text-left mb-8 space-y-2">
          <div className="text-xs font-semibold text-blue-700 tracking-wider uppercase">{t.skills.badge}</div>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0B2A4A] tracking-tight leading-tight">{t.skills.title}</h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-[65ch] leading-[1.6]">{L.hint}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label={t.skills.title}>
          {[{ id: 'all', name: L.all, count: allSkills.length }, ...categories.map(c => ({ id: c.id, name: c.name, count: c.skills.length }))].map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id ? 'bg-[#0B2A4A] text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-8">
          <AnimatePresence>
            {displayedSkills.map(skill => {
              const isActive = active?.name === skill.name;
              const isPinned = pinned?.name === skill.name;
              const roleCount = rolesFor(skill.name).length;
              return (
                <motion.button
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={skill.name}
                  aria-pressed={isPinned}
                  onClick={() => togglePin(skill)}
                  onMouseEnter={() => {
                    setHovered(skill);
                    if (!pinned) emit(skill);
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                    if (!pinned) emit(null);
                  }}
                  className={`text-left p-4 rounded-xl border bg-white transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
                    isPinned
                      ? 'border-[#0B2A4A] ring-2 ring-[#0B2A4A]/20'
                      : isActive
                      ? 'border-blue-700 ring-2 ring-blue-700/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          skill.level === 'Expert'
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : skill.level === 'Advanced'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {L.level[skill.level] ?? skill.level}
                      </span>
                      {(skill.projects.length > 0 || roleCount > 0) && (
                        <Link2 className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">{skill.name}</h3>
                  </div>

                  <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>{skill.category === 'hard' ? L.technical : L.soft}</span>
                    {roleCount > 0 && <span className="text-blue-700 font-medium">{L.roles(roleCount)}</span>}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Relationship banner */}
        <div
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-600"
          aria-live="polite"
        >
          <div className="flex items-start gap-2 min-w-0">
            <Layers className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            {active ? (
              <span className="min-w-0">
                <span className="font-semibold text-slate-900">{active.name}</span> · {L.usedIn}:{' '}
                {activeRoles.length || activeProjects.length ? (
                  <span className="text-slate-700">
                    {[...activeRoles.map(r => `${r.role} (${r.company})`), ...activeProjects].join(' · ')}
                  </span>
                ) : (
                  <span className="text-slate-500">{L.none}</span>
                )}
              </span>
            ) : (
              <span>{L.hint}</span>
            )}
          </div>

          {pinned && (
            <div className="flex items-center gap-2 shrink-0">
              {rolesFor(pinned.name).length > 0 && (
                <a
                  href="#experience"
                  onClick={e => {
                    e.preventDefault();
                    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A4A] hover:bg-[#133D69] text-white text-xs font-medium"
                >
                  {L.seeTimeline}
                  <ArrowDownRight className="w-3.5 h-3.5 -rotate-90" />
                </a>
              )}
              <button
                type="button"
                onClick={clear}
                aria-label={L.clear}
                title={L.clear}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
