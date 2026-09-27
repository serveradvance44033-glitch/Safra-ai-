import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Sparkles, User } from 'lucide-react';
import { Message } from '../types';
import { MarkdownView } from './MarkdownView';

interface ChatMessageProps {
  message: Message;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  canSpeak: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isSpeaking,
  onToggleSpeech,
  canSpeak,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group w-full py-2.5 px-3 sm:px-4 flex transition-colors ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[80%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Bubble & Actions */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
          {/* Header row: Name + Time */}
          <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {isUser ? 'You' : 'Safra'}
            </span>
            <span>·</span>
            <span>{formatTime(message.timestamp)}</span>
            {!isUser && message.model && (
              <>
                <span>·</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                  {message.model}
                </span>
              </>
            )}
          </div>

          {/* Bubble content */}
          <div
            className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs transition-shadow ${
              isUser
                ? 'bg-emerald-600 dark:bg-emerald-600 text-white rounded-tr-xs'
                : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-tl-xs'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap break-words text-[15px] sm:text-base leading-relaxed">
                {message.content}
              </p>
            ) : (
              <MarkdownView content={message.content} />
            )}
          </div>

          {/* Action buttons (TTS, Copy) */}
          <div className="flex items-center gap-1 mt-1.5 px-1">
            {!isUser && canSpeak && (
              <button
                onClick={onToggleSpeech}
                aria-label={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
                title={isSpeaking ? 'Stop voice reading' : 'Read aloud with Safra voice'}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors touch-manipulation min-h-[36px] ${
                  isSpeaking
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    <span className="text-[11px] hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[11px] hidden sm:inline">Listen</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleCopy}
              aria-label="Copy message text"
              title="Copy to clipboard"
              className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation min-h-[36px] flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-[11px] hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
