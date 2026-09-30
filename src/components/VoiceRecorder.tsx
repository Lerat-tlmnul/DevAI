import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  isListening,
  setIsListening,
}) => {
  const [hasSupport, setHasSupport] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSupport(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        onTranscription(finalTranscript.trim());
      }
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription, setIsListening]);

  const toggleListening = () => {
    if (!hasSupport) {
      alert('La reconnaissance vocale n’est pas supportée sur ce navigateur. Tu peux taper ta question au clavier.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
        isListening
          ? 'bg-rose-600 text-white ring-2 ring-rose-300 animate-pulse'
          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
      }`}
      title={isListening ? 'Arrêter l’écoute vocale' : 'Parler au micro'}
    >
      {isListening ? (
        <MicOff className="w-4 h-4 text-white" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};
