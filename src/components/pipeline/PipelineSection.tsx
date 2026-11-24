import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Database, Server, RefreshCw, BarChart3, CheckCircle2, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';


export const PipelineSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const es = lang === 'es';
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Pin the section while scrolling through the 4 stages (desktop only).
  // CSS sticky + Framer's scroll progress replace the former GSAP ScrollTrigger.
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)');
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 72px', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', p => {
    if (!pinned) return;
    setActiveStep(Math.min(Math.floor(p * 4), 3));
  });

  const nodes = t.pipeline.nodes;
  const activeNodeData = nodes[hoveredNode !== null ? hoveredNode : activeStep] || nodes[0];

  const nextStep = () => {
    setActiveStep(prev => (prev < nodes.length - 1 ? prev + 1 : 0));
  };

  const prevStep = () => {
    setActiveStep(prev => (prev > 0 ? prev - 1 : nodes.length - 1));
  };

  const getNodeIcon = (index: number) => {
    switch (index) {
      case 0: return <RefreshCw className="w-5 h-5" />;
      case 1: return <Server className="w-5 h-5" />;
      case 2: return <Database className="w-5 h-5" />;
      case 3: return <BarChart3 className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div
      ref={sectionRef}
      id="pipeline"
      className="relative bg-[#F8FAFC] border-b border-slate-200"
      style={pinned ? { height: 'calc(100vh + 800px)' } : undefined}
    >
      <div
        className={
          pinned
            ? 'sticky top-[72px] min-h-[calc(100vh-72px)] py-6 flex flex-col justify-center'
            : 'py-14 sm:py-16 flex flex-col justify-center'
        }
      >
      <div className="site-container w-full">
        {/* Section Header */}
        <div className="text-left mb-8 space-y-2">
          <div className="text-xs font-semibold text-blue-700 tracking-wider uppercase font-sans">
            {t.pipeline.badge}
          </div>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0B2A4A] tracking-tight leading-tight">
            {t.pipeline.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-[65ch] leading-[1.6]">
            {t.pipeline.description}
          </p>
        </div>

        {/* Pipeline Architecture Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          {/* Main Nodes Horizontal Flow */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative min-w-0">
            {/* Connecting Accent Line for Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-slate-200 z-0">
              <motion.div
                className="h-full bg-blue-700"
                animate={{ width: `${((activeStep + 1) / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
              {/* Subtle Small Flowing Particle */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-700"
                animate={{ left: ['0%', '100%'] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              />
            </div>

            {nodes.map((node, i) => {
              const isCurrent = i === activeStep;
              const isInspected = hoveredNode === i;
              const isPast = i < activeStep;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setActiveStep(i)}
                  className={`relative z-10 min-w-0 p-5 rounded-xl border bg-white transition-all cursor-pointer shadow-sm ${
                    isCurrent || isInspected
                      ? 'border-blue-700 ring-2 ring-blue-700/10 shadow-md'
                      : isPast
                      ? 'border-slate-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isCurrent || isInspected
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {getNodeIcon(i)}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">
                    {node.label}
                  </h3>
                  <div className="text-xs text-blue-700 font-medium mb-1">
                    {node.category}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {node.tech}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{es ? 'Estado:' : 'Status:'}</span>
                    <span className={`font-medium ${isCurrent ? 'text-blue-700' : 'text-slate-600'}`}>
                      {node.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Node Specification Inspection Card */}
          <div className="lg:col-span-12 min-w-0">
            <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-900 uppercase tracking-wide">
                  {es ? 'Detalle de la fase' : 'Stage specification'}
                </span>
                <span className="font-mono text-blue-700 font-medium">
                  {es ? 'Fase' : 'Phase'} 0{nodes.findIndex(n => n.id === activeNodeData.id) + 1} {es ? 'de' : 'of'} 04
                </span>
              </div>

              <h4 className="text-lg font-semibold text-slate-900 mb-1">
                {activeNodeData.label}
              </h4>
              <p className="text-xs text-blue-700 font-medium mb-3">
                {activeNodeData.tech}
              </p>

              <p className="text-sm text-slate-600 mb-5 leading-relaxed max-w-[75ch]">
                {activeNodeData.description}
              </p>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {es ? 'Especificaciones técnicas' : 'Technical specifications'}
                </div>
                {activeNodeData.specs.map((spec: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              {/* Step-by-Step Previous/Next Controls (usable without scrolling) */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={prevStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-accent cursor-pointer"
                  aria-label="Previous pipeline stage"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{es ? 'Anterior' : 'Previous'}</span>
                </button>

                <span className="text-xs text-slate-400 font-mono">
                  {activeStep + 1} / 4
                </span>

                <button
                  onClick={nextStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-accent cursor-pointer"
                  aria-label="Next pipeline stage"
                >
                  <span>{es ? 'Siguiente' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
