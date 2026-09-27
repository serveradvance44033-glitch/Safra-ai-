import React from 'react';
import { Sparkles } from 'lucide-react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="w-full py-2.5 px-3 sm:px-4 flex justify-start">
      <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] items-start">
        {/* Safra Avatar with gentle pulse */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20 flex-shrink-0 animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Thought bubble */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Safra is thinking
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
