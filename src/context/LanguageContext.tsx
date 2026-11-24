import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'es';
// Type-only import: the dictionaries themselves are loaded on demand (one per language).
export type PortfolioContent = typeof import('../content/en.json');

const loaders: Record<Language, () => Promise<PortfolioContent>> = {
  en: () => import('../content/en.json').then(m => m.default as PortfolioContent),
  es: () => import('../content/es.json').then(m => m.default as unknown as PortfolioContent),
};
const cache: Partial<Record<Language, PortfolioContent>> = {};

export async function loadDictionary(lang: Language): Promise<PortfolioContent> {
  if (!cache[lang]) cache[lang] = await loaders[lang]();
  return cache[lang]!;
}

export function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('juan_portfolio_lang');
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

interface LanguageContextType {
  lang: Language;
  t: PortfolioContent;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang: Language;
  initialContent: PortfolioContent;
}> = ({ children, initialLang, initialContent }) => {
  const [state, setState] = useState<{ lang: Language; t: PortfolioContent }>({ lang: initialLang, t: initialContent });

  const setLang = useCallback((next: Language) => {
    void loadDictionary(next).then(t => {
      setState({ lang: next, t });
      try {
        localStorage.setItem('juan_portfolio_lang', next);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const toggleLang = useCallback(() => setLang(state.lang === 'en' ? 'es' : 'en'), [setLang, state.lang]);

  useEffect(() => {
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  // Warm up the other language when the browser is idle, so the toggle is instant
  useEffect(() => {
    const other: Language = state.lang === 'en' ? 'es' : 'en';
    const ric = (window as any).requestIdleCallback as ((cb: () => void) => number) | undefined;
    const id = ric ? ric(() => void loadDictionary(other)) : window.setTimeout(() => void loadDictionary(other), 3000);
    return () => {
      const cic = (window as any).cancelIdleCallback as ((id: number) => void) | undefined;
      cic ? cic(id) : window.clearTimeout(id);
    };
  }, [state.lang]);

  return (
    <LanguageContext.Provider value={{ lang: state.lang, t: state.t, toggleLang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
