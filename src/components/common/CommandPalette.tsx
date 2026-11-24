import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Globe, Download, Bot, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { scrollToSection } from '../../lib/askAI';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenChat }) => {
  const { t, lang, toggleLang } = useLanguage();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    {
      id: 'sec-about',
      title: `${t.nav.about}`,
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-slate-500" />,
      action: () => scrollToSection('about'),
    },
    {
      id: 'sec-pipeline',
      title: `${t.nav.pipeline}`,
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-slate-500" />,
      action: () => scrollToSection('pipeline'),
    },
    {
      id: 'sec-experience',
      title: `${t.nav.experience}`,
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-slate-500" />,
      action: () => scrollToSection('experience'),
    },
    {
      id: 'sec-skills',
      title: `${t.nav.skills}`,
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-slate-500" />,
      action: () => scrollToSection('skills'),
    },
    {
      id: 'sec-projects',
      title: `${t.nav.projects}`,
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-slate-500" />,
      action: () => scrollToSection('projects'),
    },
    {
      id: 'sec-education',
      title: `${t.nav.education}`,
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-slate-500" />,
      action: () => scrollToSection('education'),
    },
    {
      id: 'sec-contact',
      title: `${t.nav.contact}`,
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-slate-500" />,
      action: () => scrollToSection('contact'),
    },
    {
      id: 'action-chat',
      title: `${t.nav.chat}`,
      category: 'Action',
      icon: <Bot className="w-4 h-4 text-blue-700" />,
      action: onOpenChat,
    },
    {
      id: 'action-lang',
      title: `${lang === 'en' ? 'Cambiar idioma a Español' : 'Switch language to English'}`,
      category: 'Action',
      icon: <Globe className="w-4 h-4 text-blue-700" />,
      action: () => {
        toggleLang();
        showToast(lang === 'en' ? 'Idioma cambiado a Español' : 'Language switched to English', 'success');
      },
    },
    {
      id: 'action-cv',
      title: `${t.nav.cv}`,
      category: 'Action',
      icon: <Download className="w-4 h-4 text-slate-600" />,
      action: () => {
        const link = document.createElement('a');
        link.href = `${import.meta.env.BASE_URL}cv.pdf`;
        link.download = 'CV_Juan_Andres_Bernuy.pdf';
        link.click();
        showToast('CV download initiated', 'success');
      },
    },
  ];

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'es' ? 'Escribe un comando o navega a una sección...' : 'Type a command or navigate to a section...'}
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  {lang === 'es' ? 'No se encontraron resultados.' : 'No matching commands found.'}
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-sans">{item.category}</span>
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Navigate</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">↓</kbd>
                <span className="ml-1">Select</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">↵</kbd>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Close</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">ESC</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
