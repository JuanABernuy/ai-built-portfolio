import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [madridTime, setMadridTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
      });
      setMadridTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState(null, '', '#');
  };

  return (
    <footer className="relative bg-[#0B2A4A] text-white py-8 border-t border-slate-800">
      <div className="site-container flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left: Identity and Tagline */}
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-semibold text-sm tracking-tight text-white">
              Juan Andrés Bernuy Navarrete
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.footer.tagline}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            &copy; {new Date().getFullYear()} Juan Andrés Bernuy. {t.footer.rights}
          </p>
        </div>

        {/* Center: Madrid Time */}
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 border border-white/10 text-white font-mono">
            <span>{t.footer.madridTime}:</span>
            <span className="font-semibold text-blue-300">{madridTime} CET</span>
          </span>
        </div>

        {/* Right: Return to top */}
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer border border-white/10 focus-visible:outline-accent"
        >
          <span>{t.footer.backToTop}</span>
          <ArrowUp className="w-3.5 h-3.5 text-blue-300" />
        </button>
      </div>
    </footer>
  );
};
