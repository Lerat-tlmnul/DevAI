import React from 'react';
import { History, Trash2, X, ChevronRight } from 'lucide-react';
import { HomeworkSession } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: HomeworkSession[];
  onSelectSession: (session: HomeworkSession) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm h-full bg-white border-l border-zinc-200 p-5 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-900" />
            <span className="text-sm font-semibold text-zinc-900">Historique des devoirs</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              Aucun devoir résolu pour le moment.
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => {
                  onSelectSession(sess);
                  onClose();
                }}
                className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-medium">
                      {sess.subject}
                    </span>
                    <span className="text-[10px] text-zinc-400">{sess.date}</span>
                  </div>
                  <p className="text-xs text-zinc-900 font-medium truncate">
                    {sess.title}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors flex-shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
          <div className="pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClearHistory}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer l'historique</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
