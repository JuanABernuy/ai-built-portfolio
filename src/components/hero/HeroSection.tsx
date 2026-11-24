import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Download, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { scrollToSection as goToSection } from '../../lib/askAI';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { HeroNetwork3D } from './HeroNetwork3D';
import { IntroVideoFrame } from './IntroVideoFrame';
import { MagneticButton } from '../common/MagneticButton';

interface HeroSectionProps {
  onOpenChat: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenChat }) => {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    goToSection(id);
    window.history.pushState(null, '', `#${id}`);
  };

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100svh-72px)] flex items-center justify-center py-16 bg-[#F8FAFC] border-b border-slate-200 overflow-hidden"
    >
      {/* Subtle 3D Network in background (steel blue / navy, 30% opacity) */}
      <ErrorBoundary silent>
        <HeroNetwork3D />
      </ErrorBoundary>

      <div className="absolute inset-y-0 left-0 w-full lg:w-[62%] bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/85 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="site-container relative z-10 w-full py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (7 cols): Editorial Typography & Clear CTAs */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Location & Status Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700"
            >
              <span className="w-2 h-2 rounded-full bg-blue-700" />
              <span>{t.hero.greeting}</span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-700">{t.hero.status}</span>
            </motion.div>

            {/* Name Heading (clamp(2.5rem, 4.5vw, 4rem), semibold, tracking-tight) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-semibold tracking-tight text-[#0B2A4A] leading-[1.08]">
                Juan Andrés Bernuy
              </h1>
            </motion.div>

            {/* Role Title in Inter (clean, formal, no decode scramble) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl font-semibold text-slate-800"
            >
              <span>{t.hero.role}</span>
              <span className="text-slate-400 font-normal">—</span>
              <span className="text-blue-700 font-medium">
                {t.hero.subRole}
              </span>
            </motion.div>

            {/* Tagline: ~65ch max line length, 18px body, leading 1.6 */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-600 max-w-[65ch] leading-[1.6]"
            >
              &ldquo;{t.hero.tagline}&rdquo;
            </motion.p>

            {/* Clear CTA Hierarchy: 1 Primary (Navy), 1 Secondary (White border), 1 Text Link */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              {/* Primary CTA: Solid Brand Navy */}
              <MagneticButton
                onClick={() => scrollToSection('pipeline')}
                className="px-6 py-3 rounded-lg bg-[#0B2A4A] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <span>{t.hero.ctaProjects}</span>
                <ChevronRight className="w-4 h-4" />
              </MagneticButton>

              {/* Secondary CTA: White with 1px Border */}
              <MagneticButton
                onClick={onOpenChat}
                className="px-5 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-blue-700" />
                <span>{t.hero.ctaChat}</span>
              </MagneticButton>

              {/* Text Link with Animated Underline */}
              <a
                href={`${import.meta.env.BASE_URL}cv.pdf`}
                download="CV_Juan_Andres_Bernuy.pdf"
                className="group relative inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors px-2 py-3"
              >
                <Download className="w-4 h-4 text-slate-500 group-hover:text-blue-700 transition-colors" />
                <span>{t.hero.ctaCv}</span>
                <span className="absolute bottom-2 left-2 right-2 h-[1px] bg-slate-300 group-hover:bg-blue-700 transition-colors" />
              </a>
            </motion.div>
          </div>

          {/* Right Column (5 cols): Intro Video Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 flex justify-center"
          >
            <IntroVideoFrame />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
