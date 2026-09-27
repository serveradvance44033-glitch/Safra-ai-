import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Moon, Sun, Sparkles, ChevronDown, Check, Zap, Bot } from 'lucide-react';

export type ProviderPreference = 'auto' | 'gemini' | 'openai';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  providerStatusText?: string;
  hasActiveKey?: boolean;
  isOpenAiPlaceholder?: boolean;
  onOpenKeyInfo?: () => void;
  selectedProvider: ProviderPreference;
  onSelectProvider: (provider: ProviderPreference) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  isDarkMode,
  onToggleTheme,
  onOpenKeyInfo,
  selectedProvider,
  onSelectProvider,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const providerLabels: Record<ProviderPreference, { label: string; badge: string }> = {
    auto: { label: 'Auto', badge: 'Smart' },
    gemini: { label: 'Gemini', badge: 'Google' },
    openai: { label: 'OpenAI', badge: 'GPT-4o' },
  };

  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger menu toggle & brand */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          aria-label="Open chat history"
          className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100">
            Safra AI
          </span>
        </div>

        {/* API Switcher Selector Dropdown */}
        <div className="relative ml-1 sm:ml-2" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200/50 dark:border-slate-700/50"
            title="Switch active AI API"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{providerLabels[selectedProvider].label}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden xs:inline">
              ({providerLabels[selectedProvider].badge})
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 text-left animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Active API
              </div>

              {/* Option 1: Auto */}
              <button
                onClick={() => {
                  onSelectProvider('auto');
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                  selectedProvider === 'auto'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="font-semibold">Auto (Recommended)</div>
                    <div className="text-[10px] text-slate-400">Smart fallback between APIs</div>
                  </div>
                </div>
                {selectedProvider === 'auto' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Option 2: Google Gemini */}
              <button
                onClick={() => {
                  onSelectProvider('gemini');
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                  selectedProvider === 'gemini'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <div>
                    <div className="font-semibold">Google Gemini</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Active & Fast (Flash Lite)</div>
                  </div>
                </div>
                {selectedProvider === 'gemini' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Option 3: OpenAI Responses */}
              <button
                onClick={() => {
                  onSelectProvider('openai');
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                  selectedProvider === 'openai'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <div>
                    <div className="font-semibold">OpenAI API</div>
                    <div className="text-[10px] text-slate-400">Responses / GPT-4o-mini</div>
                  </div>
                </div>
                {selectedProvider === 'openai' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenKeyInfo?.();
                  }}
                  className="w-full text-center py-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Manage API Keys & Secrets
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: New Chat and Theme Switcher */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onNewChat}
          aria-label="New Chat"
          title="Start a new chat"
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors touch-manipulation min-h-[38px]"
        >
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden xs:inline">New Chat</span>
        </button>

        <button
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Light mode' : 'Dark mode'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};
