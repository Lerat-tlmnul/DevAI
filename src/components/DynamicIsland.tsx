import React from 'react';
import { Zap, Scale, Brain, Volume2, Mic } from 'lucide-react';
import { IntelligenceMode, DifficultyLevel } from '../types';

interface DynamicIslandProps {
  intelligence: IntelligenceMode;
  difficulty: DifficultyLevel;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onOpenWelcome: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  intelligence,
  difficulty,
  isListening,
  isThinking,
  isSpeaking,
  onStopSpeaking,
}) => {
  const getIntelligenceBadge = () => {
    switch (intelligence) {
      case 'rapide':
        return { label: 'Rapide', icon: Zap };
      case 'max':
        return { label: 'Max', icon: Brain };
      case 'normal':
      default:
        return { label: 'Normal', icon: Scale };
    }
  };

  const currentIntel = getIntelligenceBadge();
  const IntelIcon = currentIntel.icon;

  return (
    <div className="flex justify-center sticky top-1 z-40 px-2 pointer-events-auto">
      <div 
        className={`transition-all duration-300 ease-out rounded-full ios-island flex items-center justify-between shadow-lg ${
          isListening || isThinking || isSpeaking ? 'px-3.5 py-1.5 min-w-[250px]' : 'px-3 py-1 min-w-[190px]'
        }`}
      >
        {isListening ? (
          // Listening state
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <Mic className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white">Écoute en cours...</span>
            </div>
            {/* Audio Waveform visualization */}
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
              <span className="w-0.5 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '450ms' }} />
            </div>
          </div>
        ) : isThinking ? (
          // Thinking state
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-white">Résolution...</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
              {intelligence.toUpperCase()}
            </div>
          </div>
        ) : isSpeaking ? (
          // Speaking state
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="text-xs font-medium text-white">Lecture audio</span>
            </div>
            <button
              onClick={onStopSpeaking}
              className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-white font-medium cursor-pointer"
            >
              Arrêter
            </button>
          </div>
        ) : (
          // Idle state (Clean Apple Pill)
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-[11px] font-bold tracking-tight text-white">
              DevAI
            </span>

            <div className="h-2.5 w-px bg-zinc-800" />

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-300">
                <IntelIcon className="w-3 h-3 text-white" />
                <span>{currentIntel.label}</span>
              </div>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200">
                {difficulty}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
