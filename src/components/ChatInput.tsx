import React, { useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  onStopLoading?: () => void;
  isListening: boolean;
  onToggleVoice: () => void;
  isVoiceSupported: boolean;
  voiceError?: string | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStopLoading,
  isListening,
  onToggleVoice,
  isVoiceSupported,
  voiceError,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-expand textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height of ~160px (approx 5-6 lines)
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without shift sends the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend(input);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
    }
  };

  return (
    <div className="w-full bg-slate-50/95 dark:bg-slate-950/95 border-t border-slate-200/70 dark:border-slate-800/80 backdrop-blur-md px-3 pt-2 pb-3 sm:px-4 sm:pt-3 sm:pb-4 safe-area-pb">
      <div className="max-w-3xl mx-auto w-full">
        {/* Voice listening status indicator */}
        {isListening && (
          <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Safra is listening to you... speak clearly</span>
            </div>
            <button
              onClick={onToggleVoice}
              className="text-xs underline font-semibold hover:text-emerald-950 dark:hover:text-white"
            >
              Stop
            </button>
          </div>
        )}

        {/* Voice Error notice if any */}
        {voiceError && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
            {voiceError}
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 rounded-2xl shadow-sm hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1.5 sm:p-2"
        >
          {/* Microphone button */}
          <button
            type="button"
            onClick={onToggleVoice}
            disabled={!isVoiceSupported}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={
              !isVoiceSupported
                ? 'Voice recognition not supported in this browser'
                : isListening
                ? 'Stop listening'
                : 'Speak to Safra (Microphone)'
            }
            className={`p-2.5 rounded-xl transition-all touch-manipulation flex items-center justify-center flex-shrink-0 min-w-[44px] min-h-[44px] ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : isVoiceSupported
                ? 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Multiline auto-expanding textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={isListening ? 'Listening to your voice...' : 'Ask Safra anything...'}
            className="flex-1 max-h-40 min-h-[28px] py-2 px-1 text-[15px] sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-hidden leading-relaxed"
          />

          {/* Send or Stop button */}
          {isLoading ? (
            <button
              type="button"
              onClick={onStopLoading}
              aria-label="Stop response generation"
              title="Stop generation"
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center flex-shrink-0 min-w-[44px] min-h-[44px] touch-manipulation"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              title="Send message (Enter)"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 min-w-[44px] min-h-[44px] touch-manipulation shadow-xs ${
                input.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="hidden sm:inline">Press Enter to send · Shift+Enter for new line</span>
          <span className="sm:hidden">Safra AI Assistant</span>
          <span>OpenAI Responses API Secure Backend</span>
        </div>
      </div>
    </div>
  );
};
