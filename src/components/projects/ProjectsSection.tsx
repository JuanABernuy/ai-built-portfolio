import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, CheckCircle2, ChevronLeft, ChevronRight, Code2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { AskAIButton } from '../common/AskAIButton';
import { useToast } from '../../context/ToastContext';
import { readHash, setHash } from '../../lib/askAI';
import { useLanguage } from '../../context/LanguageContext';
import { TiltCard } from '../common/TiltCard';

interface ProjectsSectionProps {
  highlightedProjectId?: string | null;
}

const clean = (v?: string) => (v || '').replace(/^TODO:\s*/i, '').trim();
const isPending = (v?: string) => !v || /^TODO/i.test(v);

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ highlightedProjectId }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const projects = t.projects.items;

  const L =
    lang === 'es'
      ? {
          all: 'Todos',
          filter: 'Filtrar proyectos por categoría',
          view: 'Ver detalle',
          result: 'Resultado clave',
          caseStudy: 'Caso de estudio',
          specs: 'Aspectos técnicos destacados',
          repo: 'Repositorio',
          demo: 'Demo',
          soon: 'Enlaces disponibles próximamente',
          prev: 'Proyecto anterior',
          next: 'Proyecto siguiente',
          count: (a: number, b: number) => `${a} de ${b}`,
        }
      : {
          all: 'All',
          filter: 'Filter projects by category',
          view: 'View details',
          result: 'Key result',
          caseStudy: 'Case study',
          specs: 'Technical highlights',
          repo: 'Repository',
          demo: 'Live demo',
          soon: 'Links available soon',
          prev: 'Previous project',
          next: 'Next project',
          count: (a: number, b: number) => `${a} of ${b}`,
        };

  const [filter, setFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const categories = useMemo(() => Array.from(new Set(projects.map(p => p.badge))), [projects]);
  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter(p => p.badge === filter)),
    [projects, filter]
  );

  const selectedIndex = visible.findIndex(p => p.id === selectedId);
  const selected = selectedIndex >= 0 ? visible[selectedIndex] : null;

  const openProject = (id: string, el: HTMLElement | null) => {
    openerRef.current = el;
    setSelectedId(id);
    setHash(`project-${id}`);
  };

  // Deep link: #project-<id> opens that case study
  useEffect(() => {
    const id = readHash('project-');
    if (id && projects.some(p => p.id === id)) {
      document.getElementById('projects')?.scrollIntoView();
      openProject(id, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#project-${id}`);
      showToast(t.projects.linkCopied, 'success');
    } catch {
      /* ignore */
    }
  };

  const closeProject = useCallback(() => {
    setSelectedId(null);
    setHash(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!visible.length || selectedIndex < 0) return;
      const next = (selectedIndex + dir + visible.length) % visible.length;
      setSelectedId(visible[next].id);
      setHash(`project-${visible[next].id}`);
    },
    [visible, selectedIndex]
  );

  // Body scroll lock, focus management and keyboard handling while the modal is open
  useEffect(() => {
    if (!selected) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeProject();
      } else if (e.key === 'ArrowRight') {
        step(1);
      } else if (e.key === 'ArrowLeft') {
        step(-1);
      } else if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected, closeProject, step]);

  return (
    <section id="projects" className="py-14 sm:py-16 bg-white border-b border-slate-200">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8"
        >
          <div className="text-left space-y-2">
            <div className="text-xs font-semibold text-blue-700 tracking-wider uppercase">
              {t.projects.subtitle}
            </div>
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0B2A4A] tracking-tight leading-tight">
              {t.projects.title}
            </h2>
          </div>

          <div role="group" aria-label={L.filter} className="flex flex-wrap gap-2">
            {['all', ...categories].map(cat => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0B2A4A] border-[#0B2A4A] text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? L.all : cat}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {visible.map(project => {
              const isHighlighted = highlightedProjectId === project.id;
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full"
                >
                  <TiltCard className="h-full" maxTilt={3}>
                    <button
                      type="button"
                      onClick={e => openProject(project.id, e.currentTarget)}
                      aria-label={`${L.view}: ${project.title}`}
                      className={`group h-full w-full text-left p-7 rounded-xl bg-white border flex flex-col justify-between transition-all cursor-pointer shadow-sm hover:shadow-md ${
                        isHighlighted ? 'border-blue-700 ring-2 ring-blue-700/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                            {project.badge}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-blue-700 transition-colors">
                            {L.view}
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-1">{project.title}</h3>
                        <p className="text-sm text-slate-500 mb-3">{project.subtitle}</p>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6">{project.description}</p>
                      </div>

                      <div>
                        <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200/80 mb-4 flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500 font-medium">{L.result}</span>
                          <span className="text-slate-900 font-semibold text-right">{project.metrics}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {project.tech.map((tName: string, i: number) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
                            >
                              {tName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProject}
              className="absolute inset-0 bg-slate-900/50"
              aria-hidden="true"
            />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              data-lenis-prevent
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                  {selected.badge}
                </span>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeProject}
                  aria-label={t.projects.modalClose}
                  className="w-9 h-9 -mt-1 -mr-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 id="project-modal-title" className="text-2xl sm:text-3xl font-semibold text-[#0B2A4A] tracking-tight mb-1">
                {selected.title}
              </h3>
              <p className="text-sm text-slate-500 mb-5">{selected.subtitle}</p>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 mb-5">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">{L.caseStudy}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{selected.caseStudy}</p>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">{L.specs}</h4>
                {selected.highlights.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {selected.tech.map((tName: string, i: number) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                    {tName}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <AskAIButton question={t.projects.askQ.replace('{title}', selected.title)} label={t.projects.ask} onBeforeAsk={closeProject} />
                <button
                  type="button"
                  onClick={() => copyLink(selected.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {t.projects.copyLink}
                </button>
              </div>

              <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {isPending(selected.repoUrl) && isPending(selected.demoUrl) ? (
                    <span className="text-xs text-slate-500">{L.soon}</span>
                  ) : (
                    <>
                      {!isPending(selected.repoUrl) && (
                        <a
                          href={clean(selected.repoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B2A4A] hover:bg-[#133D69] text-white text-xs font-medium transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          {L.repo}
                        </a>
                      )}
                      {!isPending(selected.demoUrl) && (
                        <a
                          href={clean(selected.demoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {L.demo}
                        </a>
                      )}
                    </>
                  )}
                </div>

                {visible.length > 1 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={L.prev}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="tabular-nums min-w-[3.5rem] text-center">{L.count(selectedIndex + 1, visible.length)}</span>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={L.next}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
