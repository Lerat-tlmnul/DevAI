/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, 
  Info, 
  History, 
  AlertCircle, 
  ArrowUp,
  Sparkles
} from 'lucide-react';
import { LiquidBackground } from './components/LiquidBackground';
import { DynamicIsland } from './components/DynamicIsland';
import { WelcomeModal } from './components/WelcomeModal';
import { ModeSelector } from './components/ModeSelector';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ImageUploader } from './components/ImageUploader';
import { SolutionViewer } from './components/SolutionViewer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { IntelligenceMode, DifficultyLevel, Subject, HomeworkMessage, HomeworkSession } from './types';

export default function App() {
  // Mode States
  const [intelligence, setIntelligence] = useState<IntelligenceMode>('normal');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('moyen');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Général');

  // Input States
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // App States
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversation & History States
  const [messages, setMessages] = useState<HomeworkMessage[]>([]);
  const [sessions, setSessions] = useState<HomeworkSession[]>(() => {
    try {
      const saved = localStorage.getItem('liam_homework_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('liam_homework_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [sessions]);

  // Clipboard paste support for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  setSelectedImage(reader.result);
                }
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Text to speech synthesizer (French voice)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('La synthèse vocale n’est pas disponible sur votre navigateur.');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeech = text
      .replace(/[#*`_>]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .slice(0, 1500);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Submit homework question
  const handleSolve = async (customPrompt?: string) => {
    const questionToSolve = (customPrompt || prompt).trim();
    if (!questionToSolve && !selectedImage) {
      setErrorMessage('Veuillez poser une question ou ajouter une photo de devoir.');
      return;
    }

    setErrorMessage(null);
    setIsThinking(true);

    const userMsg: HomeworkMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: questionToSolve || 'Photo du devoir envoyée pour analyse.',
      image: selectedImage || undefined,
      subject: selectedSubject,
      difficulty,
      intelligence,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setPrompt('');
    const currentImage = selectedImage;
    setSelectedImage(null);

    try {
      const response = await fetch('/api/homework/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: questionToSolve,
          image: currentImage,
          intelligence,
          difficulty,
          subject: selectedSubject,
          history: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la résolution');
      }

      const assistantMsg: HomeworkMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        subject: selectedSubject,
        difficulty,
        intelligence,
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);

      const newSession: HomeworkSession = {
        id: Date.now().toString(),
        title: questionToSolve ? questionToSolve.slice(0, 40) + (questionToSolve.length > 40 ? '...' : '') : 'Devoir scanné',
        subject: selectedSubject,
        difficulty,
        intelligence,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        messages: updatedMessages,
      };

      setSessions((prev) => [newSession, ...prev.slice(0, 20)]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Impossible de joindre le tuteur. Réessaie dans un instant.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([]);
    setPrompt('');
    setSelectedImage(null);
    setErrorMessage(null);
  };

  const handleSelectSession = (session: HomeworkSession) => {
    stopSpeaking();
    setMessages(session.messages);
    setSelectedSubject(session.subject);
    setDifficulty(session.difficulty);
    setIntelligence(session.intelligence);
  };

  const handleClearHistory = () => {
    if (confirm('Voulez-vous supprimer tout l’historique des devoirs ?')) {
      setSessions([]);
      localStorage.removeItem('liam_homework_sessions');
    }
  };

  // Example starter questions
  const exampleExercises = [
    {
      subject: 'Mathématiques' as Subject,
      text: 'Résous 2x² - 5x + 3 = 0 avec delta.',
      badge: 'Maths',
    },
    {
      subject: 'Français' as Subject,
      text: 'Différence entre métaphore et comparaison.',
      badge: 'Français',
    },
    {
      subject: 'Physique-Chimie' as Subject,
      text: 'Calculer la vitesse moyenne pour 450 km en 2h30.',
      badge: 'Physique',
    },
    {
      subject: 'Histoire-Géo' as Subject,
      text: 'Causes majeures de la Révolution de 1789.',
      badge: 'Histoire',
    },
  ];

  return (
    <div className="relative h-full min-h-screen flex flex-col text-zinc-900 bg-[#fafafa]">
      {/* Background Matrix */}
      <LiquidBackground />

      {/* Liam (4°1) Welcome Modal */}
      <WelcomeModal isOpen={isWelcomeOpen} onClose={() => setIsWelcomeOpen(false)} />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
      />

      {/* Sticky Native iOS Top Navigation Bar */}
      <header className="sticky top-0 z-30 pt-1.5 pb-2 px-3 sm:px-4 bg-[#fafafa]/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-2xl mx-auto w-full">
          {/* Dynamic Island Status Pill */}
          <DynamicIsland
            intelligence={intelligence}
            difficulty={difficulty}
            isListening={isListening}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
            onOpenWelcome={() => setIsWelcomeOpen(true)}
          />

          {/* Compact Navigation Bar */}
          <div className="flex items-center justify-between mt-1 px-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-zinc-900">
                DevAI
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="min-h-[34px] px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs active:scale-95"
                  title="Nouvel exercice"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nouveau</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="min-h-[34px] px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs active:scale-95"
                title="Historique des devoirs"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Historique</span>
                <span className="text-[10px] bg-zinc-100 text-zinc-800 font-bold px-1.5 py-0.2 rounded-full">
                  {sessions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsWelcomeOpen(true)}
                className="min-h-[34px] w-8 h-8 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
                title="Message de Liam (4°1)"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Selector Strip */}
          <div className="mt-2">
            <ModeSelector
              intelligence={intelligence}
              setIntelligence={setIntelligence}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
            />
          </div>
        </div>
      </header>

      {/* Main Chat Feed */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 sm:px-4 pt-2 pb-32 sm:pb-36 flex flex-col">
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Empty State (Mobile Optimized) */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col justify-center items-center text-center my-auto py-6 px-1">
            <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center mb-3 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 mb-1 tracking-tight">
              Que veux-tu travailler ?
            </h1>
            <p className="text-xs text-zinc-500 max-w-xs mb-5 leading-relaxed">
              Tape ton exercice, parle au micro ou envoie une photo. DevAI t'explique la méthode pas à pas.
            </p>

            {/* Quick Suggestions Cards */}
            <div className="w-full space-y-1.5 text-left">
              <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Suggestions rapides
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {exampleExercises.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(ex.subject);
                      setPrompt(ex.text);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left cursor-pointer active:scale-[0.99] shadow-2xs"
                  >
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-semibold mb-1 inline-block">
                      {ex.badge}
                    </span>
                    <p className="text-xs text-zinc-700 line-clamp-2">
                      {ex.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages / Solutions Feed */}
        {messages.length > 0 && (
          <div className="space-y-3 flex-1">
            {messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-[20px] rounded-br-[4px] px-3.5 py-2.5 bg-black text-white shadow-xs text-left">
                      {msg.image && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                          <img
                            src={msg.image}
                            alt="Devoir envoyé"
                            className="max-h-52 w-auto object-cover rounded-xl"
                          />
                        </div>
                      )}
                      <p className="text-xs sm:text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      <div className="mt-1.5 text-[9px] text-zinc-400 text-right">
                        {msg.subject} · {msg.difficulty?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <SolutionViewer
                    key={msg.id}
                    message={msg}
                    onFollowUp={(followPrompt) => handleSolve(followPrompt)}
                    isSpeaking={isSpeaking}
                    onSpeak={speakText}
                    onStopSpeak={stopSpeaking}
                  />
                );
              }
            })}

            {/* Thinking Skeleton */}
            {isThinking && (
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs animate-pulse text-left">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-zinc-800">
                    DevAI réfléchit ({intelligence.toUpperCase()} · {difficulty.toUpperCase()})...
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-zinc-100 rounded-full w-3/4" />
                  <div className="h-2.5 bg-zinc-100 rounded-full w-full" />
                  <div className="h-2.5 bg-zinc-100 rounded-full w-5/6" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Floating Bottom Input Capsule (Native iOS / iMessage style) */}
      <footer className="fixed bottom-0 inset-x-0 z-40 p-2.5 sm:p-3 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none pb-[max(10px,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto w-full pointer-events-auto">
          <div className="p-1.5 sm:p-2 rounded-3xl bg-white border border-zinc-200/90 shadow-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSolve();
              }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5">
                {/* Image uploader / Camera buttons */}
                <ImageUploader
                  selectedImage={selectedImage}
                  onImageSelected={setSelectedImage}
                />

                {/* Text input area */}
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSolve();
                    }
                  }}
                  rows={1}
                  placeholder={
                    isListening
                      ? "Parlez maintenant, DevAI écoute..."
                      : selectedImage
                      ? "Une question sur cette photo ?"
                      : "Pose ta question ou décris l'exercice..."
                  }
                  className="flex-1 bg-transparent px-2.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none resize-none max-h-24 min-h-[38px] leading-tight"
                />

                {/* Voice recording button */}
                <VoiceRecorder
                  isListening={isListening}
                  setIsListening={setIsListening}
                  onTranscription={(text) => {
                    setPrompt((prev) => (prev ? prev + ' ' + text : text));
                  }}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isThinking || (!prompt.trim() && !selectedImage)}
                  className="h-9 w-9 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm flex-shrink-0"
                  title="Envoyer"
                >
                  <ArrowUp className="w-4 h-4 font-bold" />
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-1 text-[9px] text-zinc-400">
            Créé par Liam (4°1) · 100% Gratuit
          </div>
        </div>
      </footer>
    </div>
  );
}
