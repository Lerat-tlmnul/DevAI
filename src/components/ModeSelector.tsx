import React, { useState } from 'react';
import { Zap, Scale, Brain, Feather, Target, Flame, ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import { IntelligenceMode, DifficultyLevel, Subject } from '../types';

interface ModeSelectorProps {
  intelligence: IntelligenceMode;
  setIntelligence: (mode: IntelligenceMode) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;
  selectedSubject: Subject;
  setSelectedSubject: (subject: Subject) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  intelligence,
  setIntelligence,
  difficulty,
  setDifficulty,
  selectedSubject,
  setSelectedSubject,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSheetTab, setActiveSheetTab] = useState<'all' | 'subject' | 'intel' | 'diff'>('all');

  const subjects: Subject[] = [
    'Général',
    'Mathématiques',
    'Français',
    'Physique-Chimie',
    'SVT',
    'Histoire-Géo',
    'Anglais',
    'Philosophie',
  ];

  const intelligenceOptions: { id: IntelligenceMode; label: string; icon: any; desc: string }[] = [
    { id: 'rapide', label: 'Rapide', icon: Zap, desc: 'Instantané · Réponses directes' },
    { id: 'normal', label: 'Normal', icon: Scale, desc: 'Équilibré · Démarche complète' },
    { id: 'max', label: 'Max', icon: Brain, desc: 'Raisonnement profond · Problèmes complexes' },
  ];

  const difficultyOptions: { id: DifficultyLevel; label: string; icon: any; desc: string }[] = [
    { id: 'facile', label: 'Facile', icon: Feather, desc: 'Pas-à-pas simple · Sans jargon' },
    { id: 'moyen', label: 'Moyen', icon: Target, desc: 'Méthode officielle · Règle + Démonstration' },
    { id: 'difficile', label: 'Difficile', icon: Flame, desc: 'Rigueur absolue · Niveau Concours' },
  ];

  const currentIntelObj = intelligenceOptions.find((i) => i.id === intelligence) || intelligenceOptions[1];
  const currentDiffObj = difficultyOptions.find((d) => d.id === difficulty) || difficultyOptions[1];

  const IntelIcon = currentIntelObj.icon;
  const DiffIcon = currentDiffObj.icon;

  return (
    <div className="w-full">
      {/* MOBILE COMPACT TOOLBAR (Single sleek line, ultra clean iOS feel) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar sm:hidden">
        {/* Quick Settings Pill Button */}
        <button
          type="button"
          onClick={() => {
            setActiveSheetTab('all');
            setIsSheetOpen(true);
          }}
          className="flex-shrink-0 min-h-[36px] px-3 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtres</span>
        </button>

        {/* Intelligence Pill */}
        <button
          type="button"
          onClick={() => {
            setActiveSheetTab('intel');
            setIsSheetOpen(true);
          }}
          className="flex-shrink-0 min-h-[36px] px-3 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-medium flex items-center gap-1.5 active:bg-zinc-100 shadow-2xs"
        >
          <IntelIcon className="w-3.5 h-3.5 text-zinc-900" />
          <span>{currentIntelObj.label}</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {/* Difficulty Pill */}
        <button
          type="button"
          onClick={() => {
            setActiveSheetTab('diff');
            setIsSheetOpen(true);
          }}
          className="flex-shrink-0 min-h-[36px] px-3 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-medium flex items-center gap-1.5 active:bg-zinc-100 shadow-2xs"
        >
          <DiffIcon className="w-3.5 h-3.5 text-zinc-900" />
          <span className="capitalize">{currentDiffObj.label}</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {/* Subject Pill */}
        <button
          type="button"
          onClick={() => {
            setActiveSheetTab('subject');
            setIsSheetOpen(true);
          }}
          className="flex-shrink-0 min-h-[36px] px-3 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-medium flex items-center gap-1.5 active:bg-zinc-100 shadow-2xs"
        >
          <span>{selectedSubject}</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>
      </div>

      {/* DESKTOP VIEW (Segmented sliders on tablet & desktop) */}
      <div className="hidden sm:block space-y-3">
        {/* Subject pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {subjects.map((sub) => {
            const isActive = selectedSubject === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Segmented intelligence & difficulty */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Intelligence */}
          <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-[11px] font-semibold text-zinc-900 tracking-tight">
                Mode Intelligence
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {currentIntelObj.label}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200/60">
              {intelligenceOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = intelligence === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIntelligence(opt.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'text-zinc-600 hover:text-black font-medium'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className="text-[11px] font-semibold text-zinc-900 tracking-tight">
                Niveau de difficulté
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {currentDiffObj.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200/60">
              {difficultyOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = difficulty === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDifficulty(opt.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'text-zinc-600 hover:text-black font-medium'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* NATIVE iOS BOTTOM ACTION SHEET (for mobile selection) */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs sm:hidden">
          <div 
            className="w-full bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl animate-sheet-up border-t border-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber handle */}
            <div className="w-10 h-1 rounded-full bg-zinc-300 mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Configuration DevAI
              </h3>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="text-xs font-semibold text-zinc-900 px-3 py-1 rounded-full bg-zinc-100"
              >
                OK
              </button>
            </div>

            {/* Matière scolaire */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Matière scolaire
              </div>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((sub) => {
                  const isActive = selectedSubject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-black text-white font-semibold'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode d'intelligence */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Vitesse & Raisonnement
              </div>
              <div className="space-y-1.5">
                {intelligenceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = intelligence === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIntelligence(opt.id)}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                        isActive
                          ? 'bg-zinc-100 border border-zinc-300'
                          : 'bg-zinc-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-black text-white' : 'bg-white text-zinc-700 shadow-2xs'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                          <div className="text-[11px] text-zinc-500">{opt.desc}</div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-black mr-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Niveau de difficulté */}
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Niveau d'explication
              </div>
              <div className="space-y-1.5">
                {difficultyOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = difficulty === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDifficulty(opt.id)}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                        isActive
                          ? 'bg-zinc-100 border border-zinc-300'
                          : 'bg-zinc-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-black text-white' : 'bg-white text-zinc-700 shadow-2xs'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                          <div className="text-[11px] text-zinc-500">{opt.desc}</div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-black mr-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
