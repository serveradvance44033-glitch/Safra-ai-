import React from 'react';
import { Plus, MessageSquare, Trash2, X, Sparkles, Moon, Sun, ShieldCheck } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  providerName?: string;
  onOpenKeyInfo?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll,
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  providerName,
  onOpenKeyInfo,
}) => {
  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Drawer / Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-100/90 dark:bg-slate-900/95 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out backdrop-blur-md ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-3.5 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Safra AI
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Personal Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors touch-manipulation min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Recent Chats ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-slate-400 dark:text-slate-500">
              No conversations yet. Start a new chat to begin!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between w-full p-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition-all min-h-[44px] touch-manipulation ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{conv.title || 'Conversation'}</span>
                  </div>

                  {/* Delete individual chat button */}
                  <button
                    onClick={(e) => onDeleteConversation(conv.id, e)}
                    title="Delete conversation"
                    aria-label="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-opacity touch-manipulation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          {providerName && (
            <button
              onClick={() => {
                onOpenKeyInfo?.();
                onClose();
              }}
              title="Open setup & status information"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{providerName}</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Info</span>
            </button>
          )}

          {conversations.length > 0 && (
            <button
              onClick={onClearAll}
              className="w-full text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-1.5 touch-manipulation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all chats</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
