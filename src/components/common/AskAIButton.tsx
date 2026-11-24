import React from 'react';
import { Sparkles } from 'lucide-react';
import { askAI } from '../../lib/askAI';

export const AskAIButton: React.FC<{ question: string; label: string; className?: string; onBeforeAsk?: () => void }> = ({
  question,
  label,
  className = '',
  onBeforeAsk,
}) => (
  <button
    type="button"
    onClick={e => {
      e.stopPropagation();
      onBeforeAsk?.();
      askAI(question);
    }}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:border-blue-300 text-xs font-medium transition-colors cursor-pointer ${className}`}
  >
    <Sparkles className="w-3.5 h-3.5" />
    <span>{label}</span>
  </button>
);
