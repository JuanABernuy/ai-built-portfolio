import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Globe, Bot, Menu, X, Command } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { scrollToSection } from '../../lib/askAI';

interface NavbarProps {
  onOpenChat: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat, onOpenCommandPalette }) => {
  const { t, lang, toggleLang } = useLanguage();
  const { showToast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Thin 2px accent scroll-progress bar under navbar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const navLinks = [
    { id: 'about', href: '#about', label: t.nav.about },
    { id: 'pipeline', href: '#pipeline', label: t.nav.pipeline },
    { id: 'experience', href: '#experience', label: t.nav.experience },
    { id: 'skills', href: '#skills', label: t.nav.skills },
    { id: 'projects', href: '#projects', label: t.nav.projects },
    { id: 'education', href: '#education', label: t.nav.education },
    { id: 'contact', href: '#contact', label: t.nav.contact },
  ];

  // Scrollspy & scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Section detection
      const sections = ['hero', ...navLinks.map(l => l.id)];
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const secId = sections[i];
        const el = document.getElementById(secId);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(secId);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  // Handle link click & update hash
  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    scrollToSection(targetId);
    window.history.pushState(null, '', href);
  };

  // Keyboard accessibility for mobile menu (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-[72px] transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm'
            : 'bg-white border-b border-slate-200/80'
        }`}
      >
        <div className="site-container h-full flex items-center justify-between">
          {/* Logo: Square Navy Monogram "JB" + Name */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState(null, '', '#');
            }}
            className="flex items-center gap-3 group focus-visible:outline-accent"
          >
            <div className="w-9 h-9 rounded-md bg-[#0B2A4A] flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm transition-transform group-hover:scale-105">
              JB
            </div>
            <div className="flex flex-col text-left whitespace-nowrap">
              <span className="text-sm font-semibold text-slate-900 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                Juan Andrés Bernuy
              </span>
              <span className="hidden xl:block text-xs text-slate-500 font-normal">
                {t.nav.systemStatus}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links with Animated Scrollspy */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.href)}
                  className={`relative px-2.5 xl:px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer rounded-md focus-visible:outline-accent ${
                    isActive ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-blue-700"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Cmd+K hint, Lang toggle, CTA */}
          <div className="flex items-center gap-2.5">
            {/* Command Palette Shortcut Button */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-accent cursor-pointer"
              title="Search and quick jump (Ctrl+K / ⌘K)"
            >
              <Command className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-[11px] text-slate-500">⌘K</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                toggleLang();
                showToast(lang === 'en' ? 'Idioma cambiado a Español' : 'Language switched to English', 'info');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors focus-visible:outline-accent cursor-pointer"
              title="Toggle Language (ES / EN)"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.nav.langToggle}</span>
            </button>

            {/* Ask AI CTA Button */}
            <button
              onClick={onOpenChat}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 whitespace-nowrap shrink-0 rounded-lg bg-[#0B2A4A] hover:bg-blue-700 text-white text-xs font-semibold tracking-wide transition-colors shadow-sm focus-visible:outline-accent cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t.nav.chat}</span>
            </button>

            {/* Mobile Menu Toggle Button (Min 44px tap target) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-accent"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 2px Accent Scroll Progress Bar Under Navbar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-700 origin-left"
          style={{ scaleX }}
        />
      </header>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-[72px] z-40 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="relative bg-white border-b border-slate-200 shadow-xl px-6 py-6 space-y-3"
            >
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.href)}
                    className="flex items-center text-left py-3 px-3 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-blue-700 transition-colors min-h-[44px]"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenChat();
                  }}
                  className="w-full py-3 rounded-lg bg-[#0B2A4A] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
                >
                  <Bot className="w-4 h-4" />
                  <span>{t.nav.chat}</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Shortcut: Press / anytime to chat</span>
                  <span>Ctrl+K for menu</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
