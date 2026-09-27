import { useState, useEffect, useRef, useCallback } from 'react';

// Utility to clean markdown markup before speech synthesis
function cleanMarkdownForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, 'Code block omitted.') // Don't read whole code blocks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link labels
    .replace(/[*_#~>]/g, '') // remove symbols
    .replace(/\n+/g, '. ') // natural pauses
    .trim();
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setActiveMessageId(null);
  }, []);

  const speak = useCallback(
    (text: string, messageId: string) => {
      if (!synthRef.current) return;

      // If already speaking this message, toggle stop
      if (isSpeaking && activeMessageId === messageId) {
        stopSpeaking();
        return;
      }

      // Stop any prior speech
      synthRef.current.cancel();

      const spokenText = cleanMarkdownForSpeech(text);
      if (!spokenText) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utteranceRef.current = utterance;

      // Choose a pleasant voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Female') || v.name.includes('Google'))) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setActiveMessageId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveMessageId(null);
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        setActiveMessageId(null);
      };

      synthRef.current.speak(utterance);
    },
    [isSpeaking, activeMessageId, stopSpeaking]
  );

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    activeMessageId,
    isSupported,
  };
}
