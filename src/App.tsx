import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Bot } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider, useLanguage, type Language, type PortfolioContent } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { CustomCursor } from './components/common/CustomCursor';
import { Navbar } from './components/common/Navbar';
import { CommandPalette } from './components/common/CommandPalette';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LazySection } from './components/common/LazySection';
import { StorySection } from './components/story/StorySection';
import { AboutSection } from './components/about/AboutSection';
import { PipelineSection } from './components/pipeline/PipelineSection';
import { Footer } from './components/common/Footer';
import { ASK_AI_EVENT } from './lib/askAI';
import type { PendingQuestion } from './components/chat/ChatDrawer';

// Loaded on demand: the chat when first opened, the map when it nears the viewport
const loadChat = () => import('./components/chat/ChatDrawer');
const ChatDrawer = lazy(() => loadChat().then(m => ({ default: m.ChatDrawer })));
const ExperienceSection = lazy(() => import('./components/experience/ExperienceSection').then(m => ({ default: m.ExperienceSection })));
const SkillsSection = lazy(() => import('./components/skills/SkillsSection').then(m => ({ default: m.SkillsSection })));
const ProjectsSection = lazy(() => import('./components/projects/ProjectsSection').then(m => ({ default: m.ProjectsSection })));
const EducationSection = lazy(() => import('./components/education/EducationSection').then(m => ({ default: m.EducationSection })));
const ContactSection = lazy(() => import('./components/contact/ContactSection').then(m => ({ default: m.ContactSection })));
const InternationalSection = lazy(() =>
  import('./components/international/InternationalSection').then(m => ({ default: m.InternationalSection }))
);

const BackToTop: React.FC = () => {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title={lang === 'es' ? 'Volver arriba' : 'Back to top'}
          className="fixed bottom-4 sm:bottom-6 left-[var(--edge)] z-40 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md text-[#0B2A4A] hover:bg-slate-50 flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const PortfolioContent: React.FC = () => {
  const { lang, t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [pending, setPending] = useState<PendingQuestion | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);
  const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);
  const [storyInView, setStoryInView] = useState(true);

  const openChat = useCallback(() => {
    setChatLoaded(true);
    setChatOpen(true);
  }, []);
  const closeChat = useCallback(() => setChatOpen(false), []);

  // Smooth scrolling
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    let reqId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      reqId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  // Keyboard: Ctrl/Cmd+K command palette, "/" opens the assistant
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(open => !open);
        return;
      }
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openChat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openChat]);

  // "Ask the AI about this" buttons anywhere on the page
  useEffect(() => {
    const onAsk = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      if (!text) return;
      setPending({ id: Date.now(), text });
      openChat();
    };
    window.addEventListener(ASK_AI_EVENT, onAsk);
    return () => window.removeEventListener(ASK_AI_EVENT, onAsk);
  }, [openChat]);

  // Prefetch the chat code when the browser is idle, so opening it feels instant
  useEffect(() => {
    const ric = (window as any).requestIdleCallback as ((cb: () => void, o?: object) => number) | undefined;
    const id = ric ? ric(() => void loadChat(), { timeout: 8000 }) : window.setTimeout(() => void loadChat(), 5000);
    return () => {
      const cic = (window as any).cancelIdleCallback as ((id: number) => void) | undefined;
      cic ? cic(id) : window.clearTimeout(id);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-[#0B2A4A]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#0B2A4A] focus:text-white focus:text-sm focus:font-medium"
      >
        {lang === 'es' ? 'Saltar al contenido principal' : 'Skip to main content'}
      </a>

      <CustomCursor />

      <Navbar onOpenChat={openChat} onOpenCommandPalette={() => setPaletteOpen(true)} />

      <main id="main-content" className="pt-[72px]">
        <StorySection onOpenChat={openChat} externallyPaused={chatOpen || paletteOpen} onInViewChange={setStoryInView} />
        <AboutSection />
        <PipelineSection />
        {/* Below-the-fold sections are split out and mounted as they approach the viewport */}
        <LazySection id="experience" minHeight={950} hashPrefixes={['role-']}>
          <ExperienceSection highlightedSkill={highlightedSkill} />
        </LazySection>
        <LazySection id="international" minHeight={900} hashPrefixes={['city-']}>
          <InternationalSection />
        </LazySection>
        <LazySection id="skills" minHeight={850}>
          <SkillsSection onHighlightProject={setHighlightedProjectId} onHighlightSkill={setHighlightedSkill} />
        </LazySection>
        <LazySection id="projects" minHeight={1100} hashPrefixes={['project-']}>
          <ProjectsSection highlightedProjectId={highlightedProjectId} />
        </LazySection>
        <LazySection id="education" minHeight={1200}>
          <EducationSection />
        </LazySection>
        <LazySection id="contact" minHeight={750}>
          <ContactSection />
        </LazySection>
      </main>

      <Footer />

      <BackToTop />

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenChat={openChat} />

      {/* Lightweight launcher, always present; the chat itself loads on demand */}
      <AnimatePresence>
        {!chatOpen && !storyInView && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 sm:bottom-6 right-[var(--edge)] z-40"
          >
            <button
              type="button"
              onClick={openChat}
              onMouseEnter={() => void loadChat()}
              onFocus={() => void loadChat()}
              aria-label="Open AI Assistant"
              className="group flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full bg-[#0B2A4A] hover:bg-[#133D69] text-white text-sm font-medium shadow-lg transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>{t.hero.ctaChat}</span>
              <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 rounded bg-white/15 text-[11px] font-mono leading-none">/</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {chatLoaded && (
        <ErrorBoundary silent>
          <Suspense fallback={null}>
            <ChatDrawer
              isOpen={chatOpen}
              onClose={closeChat}
              pendingQuestion={pending}
              onPendingConsumed={() => setPending(null)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <Analytics />
    </div>
  );
};

export default function App({ initialLang, initialContent }: { initialLang: Language; initialContent: PortfolioContent }) {
  return (
    <LanguageProvider initialLang={initialLang} initialContent={initialContent}>
      <ToastProvider>
        <PortfolioContent />
      </ToastProvider>
    </LanguageProvider>
  );
}
