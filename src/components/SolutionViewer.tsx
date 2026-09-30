import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  Lightbulb
} from 'lucide-react';
import { HomeworkMessage } from '../types';

interface SolutionViewerProps {
  message: HomeworkMessage;
  onFollowUp: (prompt: string) => void;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
}

export const SolutionViewer: React.FC<SolutionViewerProps> = ({
  message,
  onFollowUp,
  isSpeaking,
  onSpeak,
  onStopSpeak,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      onStopSpeak();
    } else {
      onSpeak(message.content);
    }
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1 or 2
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^#+\s*/, '');
        return (
          <h3 key={idx} className="text-base sm:text-lg font-bold text-zinc-900 mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3.5 rounded-full bg-black" />
            <span>{text}</span>
          </h3>
        );
      }

      // Step headings
      if (/^(étape|step|\d+[\.\)]\s*(étape|step))/i.test(trimmed)) {
        return (
          <div key={idx} className="mt-3 mb-1 px-2.5 py-0.5 rounded-md bg-zinc-100 text-xs font-semibold text-zinc-900 inline-block border border-zinc-200">
            {trimmed}
          </div>
        );
      }

      // Key rules or formulas
      if (trimmed.startsWith('>') || trimmed.toLowerCase().includes('formule :') || trimmed.toLowerCase().includes('règle :')) {
        return (
          <div key={idx} className="my-2 p-3 rounded-xl bg-zinc-50 border-l-3 border-black text-zinc-900 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1 text-zinc-900 font-semibold mb-0.5 text-[11px] uppercase tracking-wide">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Règle clé / Formule</span>
            </div>
            {trimmed.replace(/^>\s*/, '')}
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 text-xs sm:text-sm text-zinc-800">
            <span className="text-zinc-400 mt-1">·</span>
            <span>{trimmed.substring(2)}</span>
          </div>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^\d+/)?.[0];
        const rest = trimmed.replace(/^\d+\.\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-zinc-800">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center text-[10px] font-bold border border-zinc-200 mt-0.5">
              {num}
            </span>
            <span>{rest}</span>
          </div>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // Standard text
      return (
        <p key={idx} className="my-1 text-xs sm:text-sm text-zinc-800 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs relative">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-900">DevAI</span>
            <span className="text-[10px] text-zinc-400 ml-1.5">
              {message.subject || 'Général'} · {message.difficulty?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleSpeak}
            className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
              isSpeaking
                ? 'bg-black text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
            title={isSpeaking ? 'Arrêter la lecture' : 'Écouter la solution'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[11px]">Pause</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Écouter</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[32px] px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            title="Copier la solution"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-900" />
                <span className="text-[11px]">Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Solution Content */}
      <div className="prose prose-zinc max-w-none text-zinc-800 text-xs sm:text-sm">
        {renderFormattedContent(message.content)}
      </div>

      {/* Suggested Follow-up Actions (Horizontal scroll on mobile) */}
      <div className="mt-3.5 pt-2.5 border-t border-zinc-100">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => onFollowUp("Peux-tu m'expliquer encore plus simplement cette étape ?")}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            🌱 Explique plus simplement
          </button>
          <button
            type="button"
            onClick={() => onFollowUp("Donne-moi un autre exemple similaire pour que je m'entraîne.")}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            📝 Exercice similaire
          </button>
          <button
            type="button"
            onClick={() => onFollowUp("Quels sont les pièges classiques à éviter sur ce type d'exercice ?")}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            ⚠️ Pièges à éviter
          </button>
        </div>
      </div>
    </div>
  );
};
