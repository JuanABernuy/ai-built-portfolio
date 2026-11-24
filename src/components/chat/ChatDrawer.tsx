import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Trash2, Copy, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isError?: boolean;
  query?: string; // the user query that produced this answer (for retry / regenerate)
}

export interface PendingQuestion {
  id: number;
  text: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** A question to send as soon as the chat is ready (from "Ask the AI about this" buttons). */
  pendingQuestion?: PendingQuestion | null;
  onPendingConsumed?: () => void;
}

const STORAGE_KEY = 'juan_portfolio_chat';
const MAX_CHARS = 450;
const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, pendingQuestion, onPendingConsumed }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stickToBottom = useRef(true);
  const busy = isStreaming || isWaiting;

  const L =
    lang === 'es'
      ? {
          you: 'Tú',
          assistant: 'Asistente',
          copy: 'Copiar respuesta',
          copied: 'Respuesta copiada',
          regenerate: 'Regenerar respuesta',
          retry: 'Reintentar',
          clearConfirm: '¿Borrar la conversación?',
          yes: 'Sí, borrar',
          no: 'Cancelar',
          close: 'Cerrar chat',
          hint: 'Esc para cerrar',
        }
      : {
          you: 'You',
          assistant: 'Assistant',
          copy: 'Copy answer',
          copied: 'Answer copied',
          regenerate: 'Regenerate answer',
          retry: 'Retry',
          clearConfirm: 'Clear the conversation?',
          yes: 'Yes, clear',
          no: 'Cancel',
          close: 'Close chat',
          hint: 'Esc to close',
        };

  // Persist conversation for the session
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(m => !m.isError || m.query)));
    } catch {
      /* storage unavailable */
    }
  }, [messages]);

  // Auto-scroll, unless the user scrolled up
  useEffect(() => {
    if (stickToBottom.current) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isWaiting, isStreaming]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      stickToBottom.current = true;
      const id = window.setTimeout(() => inputRef.current?.focus(), 180);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  // Esc closes ("/" to open is handled by the always-loaded launcher in App)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const sendQuery = useCallback(
    async (query: string, base: ChatMessage[]) => {
      const botMsgId = `bot-${Date.now()}`;
      setIsWaiting(true);
      stickToBottom.current = true;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, lang }),
        });

        if (!response.ok) {
          throw new Error(response.status === 429 ? t.chat.rateLimited : t.chat.errorMsg);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error(t.chat.errorMsg);

        setIsWaiting(false);
        setIsStreaming(true);
        setMessages([...base, { id: botMsgId, sender: 'bot', text: '', timestamp: nowLabel(), query }]);

        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const parsed = JSON.parse(trimmed.replace(/^data:\s*/, ''));
              if (parsed.text) {
                setMessages(prev =>
                  prev.map(m => (m.id === botMsgId ? { ...m, text: m.text + parsed.text } : m))
                );
              }
            } catch {
              /* ignore malformed chunk */
            }
          }
        }
      } catch (err: any) {
        setMessages(prev => [
          ...prev.filter(m => m.id !== botMsgId || m.text),
          {
            id: `bot-err-${Date.now()}`,
            sender: 'bot',
            text: err?.message || t.chat.errorMsg,
            timestamp: nowLabel(),
            isError: true,
            query,
          },
        ]);
      } finally {
        setIsStreaming(false);
        setIsWaiting(false);
      }
    },
    [lang, t.chat.errorMsg, t.chat.rateLimited]
  );

  const handleSend = (text?: string) => {
    const query = (text ?? inputValue).trim();
    if (!query || busy) return;
    const base: ChatMessage[] = [
      ...messages,
      { id: `user-${Date.now()}`, sender: 'user', text: query, timestamp: nowLabel() },
    ];
    setMessages(base);
    setInputValue('');
    void sendQuery(query, base);
  };

  // Re-run the query behind an answer (or error), dropping that answer first
  const handleRegenerate = (msg: ChatMessage) => {
    if (busy || !msg.query) return;
    const idx = messages.findIndex(m => m.id === msg.id);
    const base = messages.slice(0, idx);
    setMessages(base);
    void sendQuery(msg.query, base);
  };

  const handleCopy = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedId(msg.id);
      showToast(L.copied, 'success');
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      showToast(t.chat.errorMsg, 'error');
    }
  };

  const handleClear = () => {
    setMessages([]);
    setConfirmClear(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // Send a question coming from an "Ask the AI" button
  const lastPending = useRef<number | null>(null);
  useEffect(() => {
    if (!pendingQuestion || busy || lastPending.current === pendingQuestion.id) return;
    lastPending.current = pendingQuestion.id;
    handleSend(pendingQuestion.text);
    onPendingConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion, busy]);

  const lastBotId = [...messages].reverse().find(m => m.sender === 'bot' && !m.isError)?.id;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div id="chat-drawer" className="fixed inset-0 z-50 pointer-events-none flex items-end sm:justify-end sm:p-[var(--edge)]">
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 sm:hidden pointer-events-auto"
              aria-hidden="true"
            />

            <motion.div
              role="dialog"
              aria-label={t.chat.title}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto relative w-full sm:max-w-[420px] h-[85dvh] sm:h-[640px] sm:max-h-[calc(100dvh-3rem)] bg-white border border-slate-200 rounded-t-2xl sm:rounded-xl shadow-lg flex flex-col overflow-hidden"
            >
              {/* Drag handle (mobile bottom sheet) */}
              <div className="sm:hidden flex justify-center pt-2 bg-[#0B2A4A]">
                <span className="w-10 h-1 rounded-full bg-white/30" />
              </div>

              {/* Header */}
              <div className="px-5 py-3.5 bg-[#0B2A4A] text-white flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-tight truncate">{t.chat.title}</h3>
                    <p className="text-[11px] text-blue-200 truncate">{t.chat.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      title={t.chat.clearChat}
                      aria-label={t.chat.clearChat}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={L.close}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Clear confirmation */}
              {confirmClear && (
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-700">{L.clearConfirm}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-white cursor-pointer"
                    >
                      {L.no}
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-1.5 rounded-lg bg-[#0B2A4A] text-white text-xs font-medium hover:bg-[#133D69] cursor-pointer"
                    >
                      {L.yes}
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                data-lenis-prevent
                role="log"
                aria-live="polite"
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]"
              >
                {/* Welcome message (always localized) */}
                <div className="flex flex-col items-start">
                  <div className="text-[11px] text-slate-500 mb-1 px-1">{L.assistant}</div>
                  <div className="p-3.5 rounded-xl rounded-tl-sm max-w-[88%] text-sm leading-relaxed bg-white border border-slate-200 text-slate-800 whitespace-pre-wrap">
                    {t.chat.welcome}
                  </div>
                </div>

                {messages.length === 0 && !busy && (
                  <div className="pt-1">
                    <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                      <span>{t.chat.suggestedTitle}</span>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      {t.chat.suggestions.slice(0, 4).map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="text-left text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-700 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(msg => {
                  const isBot = msg.sender === 'bot';
                  const showActions = isBot && !msg.isError && msg.text && !(isStreaming && msg.id === lastBotId);
                  return (
                    <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                      <div className="text-[11px] text-slate-500 mb-1 px-1">
                        {isBot ? L.assistant : L.you} · {msg.timestamp}
                      </div>
                      <div
                        className={`p-3.5 max-w-[88%] text-sm leading-relaxed break-words whitespace-pre-wrap ${
                          msg.isError
                            ? 'rounded-xl rounded-tl-sm bg-red-50 border border-red-200 text-red-800'
                            : isBot
                            ? 'rounded-xl rounded-tl-sm bg-white border border-slate-200 text-slate-800'
                            : 'rounded-xl rounded-tr-sm bg-[#0B2A4A] text-white'
                        }`}
                      >
                        {msg.isError && <AlertCircle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
                        {msg.text}
                      </div>

                      {msg.isError && msg.query && (
                        <button
                          type="button"
                          onClick={() => handleRegenerate(msg)}
                          disabled={busy}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {L.retry}
                        </button>
                      )}

                      {showActions && (
                        <div className="mt-1.5 flex items-center gap-1 px-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg)}
                            aria-label={L.copy}
                            title={L.copy}
                            className="w-7 h-7 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-blue-700" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          {msg.id === lastBotId && msg.query && (
                            <button
                              type="button"
                              onClick={() => handleRegenerate(msg)}
                              disabled={busy}
                              aria-label={L.regenerate}
                              title={L.regenerate}
                              className="w-7 h-7 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 flex items-center justify-center cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isWaiting && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 px-1" aria-label={t.chat.typing}>
                    <span className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                      ))}
                    </span>
                    <span>{t.chat.typing}</span>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={MAX_CHARS}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={t.chat.inputPlaceholder}
                    disabled={busy}
                    aria-label={t.chat.inputPlaceholder}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || busy}
                    aria-label={t.chat.send}
                    className="w-10 h-10 shrink-0 rounded-lg bg-[#0B2A4A] hover:bg-[#133D69] text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span className="hidden sm:inline">{L.hint}</span>
                  <span className="tabular-nums ml-auto">
                    {inputValue.length}/{MAX_CHARS}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
