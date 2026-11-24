import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, ExternalLink, ShieldCheck, Trophy, Languages, Plane, BookOpen, Rocket } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TiltCard } from '../common/TiltCard';

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export const EducationSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { degrees, certifications, labels, courses } = t.education;
  const cert = certifications[0];
  const syllabus = lang === 'es' ? 'Temario oficial de la certificación' : 'Official certification syllabus';

  return (
    <section id="education" className="py-14 sm:py-16 bg-[#F8FAFC] border-b border-slate-200">
      <div className="site-container">
        <motion.div {...reveal} className="text-left space-y-2 mb-8">
          <div className="text-xs font-semibold text-blue-700 tracking-wider uppercase">{t.education.subtitle}</div>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0B2A4A] tracking-tight leading-tight">
            {t.education.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Degrees timeline */}
          <ol className="lg:col-span-7 relative space-y-5 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
            {degrees.map((deg, idx) => {
              const isExchange = deg.skillsCovered.length === 0 && deg.highlights.length === 0;
              return (
                <motion.li
                  key={`${deg.institution}-${deg.degree}`}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: idx * 0.06 }}
                  className="relative pl-14"
                >
                  <span className="absolute left-0 top-5 w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700">
                    {deg.institution.includes('Santander') ? <Rocket className="w-5 h-5" /> : isExchange ? <Plane className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                  </span>

                  <TiltCard maxTilt={2}>
                    <article className="p-6 sm:p-7 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{deg.degree}</h3>
                        <span className="text-[13px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 whitespace-nowrap">
                          {deg.period}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-blue-700 mb-3">
                        {deg.institution} · {deg.location}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">{deg.details}</p>

                      {deg.highlights.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {deg.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                              <Trophy className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {deg.skillsCovered.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">{labels.certs}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {deg.skillsCovered.map((item, i) => (
                              <span
                                key={i}
                                className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  </TiltCard>
                </motion.li>
              );
            })}
          </ol>

          {/* Certification + languages */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.08 }}>
              <TiltCard maxTilt={3}>
                <article className="p-7 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{cert.date}</span>
                    </span>
                  </div>
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    {cert.issuer} · {cert.code}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-3">{cert.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">{cert.description}</p>
                  <a
                    href={cert.badgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 underline-offset-4 hover:underline"
                  >
                    <span>{syllabus}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </article>
              </TiltCard>
            </motion.div>

            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.11 }}>
              <article className="p-7 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{labels.courses}</h3>
                </div>
                <ul className="divide-y divide-slate-100">
                  {courses.map(c => (
                    <li key={c} className="py-2.5 text-sm text-slate-700 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </motion.div>

            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.14 }}>
              <article className="p-7 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                    <Languages className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{labels.languages}</h3>
                </div>
                <ul className="space-y-2">
                  {labels.languageList.map(l => (
                    <li key={l} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                      {l}
                    </li>
                  ))}
                </ul>
              </article>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
