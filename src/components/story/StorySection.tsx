import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, ChevronsDown, Bot, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { HeroNetwork3D } from '../hero/HeroNetwork3D';
import { scrollToSection } from '../../lib/askAI';
import {
  IntroVisual, CableVisual, ZamoraVisual, EuropeVisual, BullboatVisual, AIVisual, ProfileVisual, ContactVisual, preloadMap,
} from './StoryVisuals';

/**
 * "Lazy mode" landing: the whole profile told as an auto-playing story
 * in the first screen, no scrolling required. Pauses itself when the visitor
 * scrolls away, switches tab or opens the assistant.
 */
export const StorySection: React.FC<{
  onOpenChat: () => void;
  externallyPaused?: boolean;
  /** Lets the page hide floating widgets while the story is on screen. */
  onInViewChange?: (inView: boolean) => void;
}> = ({ onOpenChat, externallyPaused = false, onInViewChange }) => {
  const { t, lang } = useLanguage();
  const C = t.story.controls;
  const chapters = t.story.chapters;
  const v = t.story.visuals;
  const reduce = useReducedMotion();

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [narrate, setNarrate] = useState(false);
  const [speechOK, setSpeechOK] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsed = useRef(0);
  // The first chapter follows the intro video: it lasts as long as the video and advances when it ends
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const chapter = chapters[idx];
  const last = idx === chapters.length - 1;
  const active = playing && inView && tabVisible && !externallyPaused && !last;
  const videoDriven = chapter.id === 'intro' && !videoFailed;

  const go = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(chapters.length - 1, n));
      elapsed.current = 0;
      setIdx(next);
    },
    [chapters.length]
  );
  const next = useCallback(() => go(idx + 1), [go, idx]);
  const prev = useCallback(() => go(idx - 1), [go, idx]);
  const replay = () => {
    go(0);
    setPlaying(true);
  };

  // Visibility of the story and of the tab
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.6, 1] });
    io.observe(el);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => onInViewChange?.(inView), [inView, onInViewChange]);

  useEffect(() => setSpeechOK(typeof window !== 'undefined' && 'speechSynthesis' in window), []);

  // Prefetch the map a chapter before it is needed
  useEffect(() => {
    if (chapters[idx + 1]?.id === 'europe' || chapter.id === 'europe') void preloadMap();
  }, [idx, chapters, chapter.id]);

  // Progress bars + auto-advance (one rAF loop, no React re-render per frame)
  useEffect(() => {
    barRefs.current.forEach((b, i) => {
      if (b) b.style.transform = `scaleX(${i < idx || (last && i === idx) ? 1 : 0})`;
    });
    const duration = (chapter.duration || 0) * 1000;
    if (!duration) return;
    let raf = 0;
    let prevT = performance.now();
    const tick = (now: number) => {
      const dt = now - prevT;
      prevT = now;
      if (videoDriven) {
        const v = videoEl.current;
        const bar = barRefs.current[idx];
        if (v && v.duration && bar) bar.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`;
        raf = requestAnimationFrame(tick);
        return;
      }
      if (active && !narrate) elapsed.current += dt;
      if (narrate && active) elapsed.current = Math.min(elapsed.current + dt, duration * 0.97);
      const p = Math.min(1, elapsed.current / duration);
      const bar = barRefs.current[idx];
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (p >= 1 && !narrate) {
        next();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, active, narrate, chapter.duration, last, next, videoDriven]);

  // Narration (Web Speech API): reads each chapter and advances when done
  useEffect(() => {
    if (!speechOK) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    if (!narrate || !inView || !tabVisible || externallyPaused || (chapter.id === 'intro' && !videoFailed)) return;
    const u = new SpeechSynthesisUtterance(`${chapter.title}. ${chapter.text}`);
    u.lang = lang === 'es' ? 'es-ES' : 'en-GB';
    u.rate = 1.02;
    const voice = synth.getVoices().find(vo => vo.lang.toLowerCase().startsWith(lang));
    if (voice) u.voice = voice;
    u.onend = () => {
      if (!last) setTimeout(() => setIdx(i => (i === idx ? Math.min(i + 1, chapters.length - 1) : i)), 500);
    };
    synth.speak(u);
    if (!playing) synth.pause();
    return () => synth.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrate, idx, lang, inView, tabVisible, externallyPaused, speechOK]);

  useEffect(() => {
    if (!speechOK || !narrate) return;
    playing ? window.speechSynthesis.resume() : window.speechSynthesis.pause();
  }, [playing, narrate, speechOK]);

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  // Keyboard: ← → move, space pauses (only while the story is on screen)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inView || e.metaKey || e.ctrlKey || e.altKey) return;
      const tEl = e.target as HTMLElement | null;
      if (tEl && (tEl.closest('input, textarea, [contenteditable], [role=dialog], [role=listbox]') || tEl.isContentEditable)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === ' ' && !(tEl && tEl.closest('button, a'))) {
        e.preventDefault();
        last ? replay() : setPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, next, prev, last]);

  // Touch: tap left third = back, elsewhere = forward (ignores buttons, links and the video)
  const onTap = (e: React.MouseEvent) => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    if ((e.target as HTMLElement).closest('button, a, video, [role=button]')) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    (e.clientX - rect.left < rect.width / 3 ? prev : next)();
  };

  const visual = (() => {
    switch (chapter.id) {
      case 'intro':
        return (
          <IntroVisual
            active={active}
            onEnded={() => setTimeout(next, 400)}
            onFailed={() => setVideoFailed(true)}
            onVideoElement={el => {
              videoEl.current = el;
            }}
          />
        );
      case 'cable':
        return <CableVisual v={v} />;
      case 'zamora':
        return <ZamoraVisual v={v} />;
      case 'europe':
        return <EuropeVisual v={v} />;
      case 'bullboat':
        return <BullboatVisual v={v} />;
      case 'ai':
        return <AIVisual v={v} />;
      case 'profile':
        return <ProfileVisual v={v} />;
      default:
        return <ContactVisual v={v} onAsk={onOpenChat} linkedin={t.contact.linkedinValue} />;
    }
  })();

  const ctrlBtn = 'w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-[#0B2A4A] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={chapters[0].title}
      className="relative h-[calc(100svh-72px)] min-h-[560px] bg-[#F8FAFC] border-b border-slate-200 overflow-hidden flex flex-col"
    >
      <ErrorBoundary silent>
        <HeroNetwork3D />
      </ErrorBoundary>
      <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/80 to-[#F8FAFC]/40 pointer-events-none" aria-hidden="true" />

      {/* Stories-style progress */}
      <div className="site-container relative z-10 pt-3 sm:pt-4">
        <div className="flex gap-1.5" role="tablist" aria-label={C.chapter}>
          {chapters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`${C.chapter} ${i + 1}: ${c.title}`}
              onClick={() => go(i)}
              className="group flex-1 py-2 cursor-pointer"
            >
              <span className="block h-1 rounded-full bg-slate-200 overflow-hidden group-hover:bg-slate-300 transition-colors">
                <span
                  ref={el => {
                    barRefs.current[i] = el;
                  }}
                  className="block h-full bg-[#0B2A4A] origin-left"
                  style={{ transform: `scaleX(${i < idx ? 1 : 0})` }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chapter */}
      <div className="relative z-10 flex-1 min-h-0" onClick={onTap}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${lang}-${chapter.id}`}
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="site-container h-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center content-center py-4 overflow-hidden"
          >
            <div className={`${idx === 0 ? 'lg:col-span-5' : 'lg:col-span-6'} space-y-3 sm:space-y-4`}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="text-xs font-semibold text-blue-700 tracking-wider uppercase"
              >
                {chapter.eyebrow}
              </motion.p>
              {idx === 0 ? (
                <h1 className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold tracking-tight text-[#0B2A4A] leading-[1.08]">{chapter.title}</h1>
              ) : (
                <h2 className="text-[clamp(1.75rem,4vw,3.25rem)] font-semibold tracking-tight text-[#0B2A4A] leading-[1.1]">{chapter.title}</h2>
              )}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-base sm:text-lg text-slate-600 leading-[1.6] max-w-[52ch]"
              >
                {chapter.text}
              </motion.p>
              {idx === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex flex-wrap items-center gap-3 pt-1"
                >
                  <button
                    type="button"
                    onClick={onOpenChat}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B2A4A] hover:bg-[#133D69] text-white text-sm font-semibold shadow-sm cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    {t.hero.ctaChat}
                  </button>
                  <a
                    href={`${import.meta.env.BASE_URL}cv.pdf`}
                    download="CV_Juan_Andres_Bernuy.pdf"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    {t.hero.ctaCv}
                  </a>
                </motion.div>
              )}
            </div>
            <div className={`${idx === 0 ? 'lg:col-span-7' : 'lg:col-span-6'} min-h-0 max-h-[46svh] lg:max-h-none overflow-hidden flex items-center`}>{visual}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="site-container relative z-10 pb-3 sm:pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={prev} disabled={idx === 0} aria-label={C.prev} title={C.prev} className={ctrlBtn}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {last ? (
              <button type="button" onClick={replay} aria-label={C.replay} title={C.replay} className={`${ctrlBtn} !w-auto px-4 gap-2 text-sm font-medium`}>
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{C.replay}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(p => !p)}
                aria-label={playing ? C.pause : C.play}
                title={playing ? C.pause : C.play}
                className={`${ctrlBtn} !bg-[#0B2A4A] !text-white !border-[#0B2A4A] hover:!bg-[#133D69]`}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            )}
            <button type="button" onClick={next} disabled={last} aria-label={C.next} title={C.next} className={ctrlBtn}>
              <ChevronRight className="w-4 h-4" />
            </button>
            {speechOK && (
              <button
                type="button"
                onClick={() => setNarrate(n => !n)}
                aria-pressed={narrate}
                aria-label={narrate ? C.narrateOff : C.narrateOn}
                title={narrate ? C.narrateOff : C.narrateOn}
                className={`${ctrlBtn} ${narrate ? '!bg-blue-50 !border-blue-300 !text-blue-800' : ''}`}
              >
                {narrate ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
            <span className="hidden sm:inline ml-1 text-xs text-slate-500 tabular-nums whitespace-nowrap">
              {idx + 1} / {chapters.length}
            </span>
          </div>

          <span className="hidden lg:block text-xs text-slate-500">{C.hint}</span>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              scrollToSection('about');
            }}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{C.skip}</span>
            <ChevronsDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
