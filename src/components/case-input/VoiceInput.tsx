'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Minimal Web Speech API result types (SpeechRecognitionEvent is not in TS DOM libs)
interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResultEvent {
  results: ArrayLike<ArrayLike<SpeechRecognitionAlternative>>;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  // Default `true` so the server render and the initial client render produce
  // identical markup. The real browser-only SpeechRecognition check runs in
  // an effect after mount (effects never run on the server), avoiding a
  // hydration mismatch between the <p> fallback and the <div> controls.
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    );
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? '')
        .join(' ');
      onTranscript(transcript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  if (!isSupported) {
    return (
      <p className="text-xs text-gray-400">
        Voice input is not supported in this browser. Try Chrome or Edge.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          isRecording
            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 animate-pulse'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Use Voice
          </>
        )}
      </button>
      {isRecording && (
        <span className="flex items-center gap-1.5 text-xs text-rose-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Listening…
        </span>
      )}
    </div>
  );
}
