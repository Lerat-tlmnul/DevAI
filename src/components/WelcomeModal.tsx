import React from 'react';
import { ArrowRight, Zap, Sliders, Brain, ShieldCheck } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-3.5 sm:p-6 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl p-5 sm:p-7 bg-white border border-zinc-200 shadow-2xl overflow-hidden text-center text-zinc-900">
        
        {/* Liam's Official Message */}
        <div className="my-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left relative">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Liam · 4°1</span>
          </div>
          <blockquote className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed italic">
            « Salut, ce projet à été créé par Liam (4°1), pour vous, c'est 100% gratuit donc amusez vous. »
          </blockquote>
        </div>

        {/* 3 Core Highlights (Mobile friendly grid) */}
        <div className="grid grid-cols-3 gap-2 my-4 text-left">
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <Zap className="w-3.5 h-3.5 text-zinc-900 mb-1" />
            <div className="text-[11px] font-bold text-zinc-900">3 Vitesses</div>
            <div className="text-[10px] text-zinc-500">Rapide, Max</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <Sliders className="w-3.5 h-3.5 text-zinc-900 mb-1" />
            <div className="text-[11px] font-bold text-zinc-900">3 Niveaux</div>
            <div className="text-[10px] text-zinc-500">Facile, Prépa</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <Brain className="w-3.5 h-3.5 text-zinc-900 mb-1" />
            <div className="text-[11px] font-bold text-zinc-900">Voix & Photo</div>
            <div className="text-[10px] text-zinc-500">Parle ou scanne</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 mb-5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
          <span>100% Gratuit · Sans inscription</span>
        </div>

        {/* Enter Button */}
        <button
          onClick={onClose}
          className="w-full min-h-[46px] py-3 px-6 rounded-2xl bg-black hover:bg-zinc-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <span>Commencer mes devoirs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
