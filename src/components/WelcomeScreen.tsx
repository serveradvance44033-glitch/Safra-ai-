import React from 'react';
import { Sparkles, MessageSquare, Lightbulb, Compass, Code2 } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  providerName?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  providerName,
}) => {
  const suggestions = [
    {
      icon: MessageSquare,
      title: 'Quick chat',
      description: 'How can you help organize my daily tasks?',
      prompt: 'Can you help me organize my daily schedule and priorities for maximum focus?',
    },
    {
      icon: Lightbulb,
      title: 'Brainstorm ideas',
      description: 'Ideas for a healthy mobile breakfast routine',
      prompt: 'Give me 5 quick and healthy breakfast ideas that take under 10 minutes to make.',
    },
    {
      icon: Compass,
      title: 'Explain clearly',
      description: 'How do neural networks learn from data?',
      prompt: 'Explain how neural networks learn in simple terms with a real-life analogy.',
    },
    {
      icon: Code2,
      title: 'Draft or code',
      description: 'Write a polite follow-up email to a colleague',
      prompt: 'Draft a warm, professional follow-up email regarding yesterday’s project sync.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full text-center">
      {/* Friendly Avatar Badge */}
      <div className="relative mb-4 group">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10 transition-transform group-hover:scale-105 duration-300">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
        </span>
      </div>

      {/* Main Welcome Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
        Hi, I'm Safra 👋
      </h1>

      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        Your personal AI companion. Friendly, fast, and ready to assist you with ideas, questions, writing, or conversation.
      </p>

      {providerName && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Powered by {providerName}</span>
        </div>
      )}

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 text-left touch-manipulation min-h-[58px]"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
