import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Database, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TiltCard } from '../common/TiltCard';

function CounterValue({ target, isTodo, todoText }: { target: number; isTodo?: boolean; todoText?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView || isTodo) return;
    let start = 0;
    const duration = 1000;
    const steps = 25;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, target, isTodo]);

  if (isTodo && todoText) {
    return (
      <span ref={ref} className="text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-mono font-medium">
        {todoText}
      </span>
    );
  }

  return <span ref={ref} className="font-semibold text-slate-900">{count}</span>;
}

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-14 sm:py-16 bg-white border-b border-slate-200">
      <div className="site-container">
        {/* Section Header with Left-Aligned Shared Edge */}
        <div className="text-left mb-8 space-y-2">
          <div className="text-xs font-semibold text-blue-700 tracking-wider uppercase font-sans">
            {t.about.subtitle}
          </div>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0B2A4A] tracking-tight leading-tight">
            {t.about.title}
          </h2>
        </div>

        {/* Content Grid: Bio Paragraphs & Key Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-8">
          <div className="lg:col-span-7 space-y-4 text-slate-600 text-base leading-[1.6] max-w-[65ch]">
            {t.about.bioParagraphs.map((para, i) => (
              <p key={i} className={i === 0 ? 'text-slate-900 font-medium text-lg' : ''}>
                {para}
              </p>
            ))}

            {/* Core Competency Pillars */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.about.traits.map((trait, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mb-3">
                    {i === 0 ? <Database className="w-4 h-4" /> : i === 1 ? <ShieldCheck className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{trait.title}</h3>
                  <p className="text-xs text-slate-600 leading-normal">{trait.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Clean Metric Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.about.stats.map((stat) => (
              <TiltCard key={stat.id} maxTilt={3}>
                <div className="p-6 rounded-xl h-full flex flex-col justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">
                      {stat.label}
                    </div>

                    <div className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
                      {stat.isTodo ? (
                        <CounterValue
                          target={stat.numericValue || 0}
                          isTodo={true}
                          todoText={stat.value}
                        />
                      ) : (
                        <>
                          <CounterValue target={stat.numericValue ?? parseInt(stat.value)} />
                          <span className="text-blue-700">{stat.suffix}</span>
                          {stat.value.includes('%') && <span className="text-blue-700">%</span>}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    {stat.notes}
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
