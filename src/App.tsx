import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, ServerStatus } from './types';
import { sendChatMessage, fetchServerStatus } from './services/api';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { Header, ProviderPreference } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ThinkingIndicator } from './components/ThinkingIndicator';
import { KeyInfoModal } from './components/KeyInfoModal';

const STORAGE_CONVERSATIONS_KEY = 'safra_ai_conversations';
const STORAGE_ACTIVE_KEY = 'safra_ai_active_id';
const STORAGE_THEME_KEY = 'safra_ai_theme';

function createNewConversation(): Conversation {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to restore conversations:', e);
    }
    return [createNewConversation()];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_ACTIVE_KEY);
    return savedId || conversations[0]?.id || '';
  });

  // UI States
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isKeyInfoOpen, setIsKeyInfoOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderPreference>(() => {
    const saved = localStorage.getItem('safra_api_provider');
    return (saved as ProviderPreference) || 'auto';
  });

  // Abort controller ref for stopping generation
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Voice synthesis & recognition hooks
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    activeMessageId,
    isSupported: isTtsSupported,
  } = useSpeechSynthesis();

  const handleVoiceTranscript = (transcriptText: string) => {
    setInput(transcriptText);
  };

  const {
    isListening,
    isSupported: isVoiceSupported,
    error: voiceError,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({ onTranscript: handleVoiceTranscript });

  // Sync theme to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  // Sync conversations to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  // Sync active conversation id
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(STORAGE_ACTIVE_KEY, activeConversationId);
    }
  }, [activeConversationId]);

  // Check backend server status
  useEffect(() => {
    fetchServerStatus().then((status) => {
      if (status) setServerStatus(status);
    });
  }, []);

  // Current active conversation
  const currentConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, isLoading]);

  // Handler: Start a new chat
  const handleNewChat = () => {
    stopSpeaking();
    stopListening();
    const newConv = createNewConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setInput('');
  };

  // Handler: Select an existing conversation
  const handleSelectConversation = (id: string) => {
    stopSpeaking();
    stopListening();
    setActiveConversationId(id);
    setInput('');
  };

  // Handler: Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeaking();
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fresh = createNewConversation();
        setActiveConversationId(fresh.id);
        return [fresh];
      }
      if (id === activeConversationId) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Handler: Clear all conversations
  const handleClearAllConversations = () => {
    stopSpeaking();
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveConversationId(fresh.id);
  };

  // Handler: Send Message
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (isListening) {
      stopListening();
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    // Update conversation title if it's the first message
    const isFirstMessage = currentConversation.messages.length === 0;
    const newTitle = isFirstMessage
      ? trimmed.length > 30
        ? trimmed.substring(0, 30) + '...'
        : trimmed
      : currentConversation.title;

    const updatedMessages = [...currentConversation.messages, userMessage];

    // Optimistically update conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversation.id
          ? {
              ...c,
              title: newTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(updatedMessages, selectedProvider);

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        model: response.model || 'Safra AI',
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversation.id
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...c.messages, assistantMessage],
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Failed to get Safra response:', err);

      const errorMessage: Message = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `I'm having a little trouble connecting right now.\n\n*Details: ${err.message || 'Network request failed'}*\n\nPlease make sure the server is reachable and your OpenAI key is configured on the backend.`,
        timestamp: Date.now(),
        model: 'Safra Notice',
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversation.id
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...c.messages, errorMessage],
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopLoading = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Sidebar Drawer */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onClearAll={handleClearAllConversations}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        providerName={serverStatus?.provider}
        onOpenKeyInfo={() => setIsKeyInfoOpen(true)}
      />

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          providerStatusText={serverStatus?.provider}
          hasActiveKey={serverStatus?.hasOpenAiKey || serverStatus?.hasGeminiKey}
          isOpenAiPlaceholder={serverStatus?.isOpenAiPlaceholder}
          onOpenKeyInfo={() => setIsKeyInfoOpen(true)}
          selectedProvider={selectedProvider}
          onSelectProvider={(p) => {
            setSelectedProvider(p);
            localStorage.setItem('safra_api_provider', p);
          }}
        />

        {/* Message Thread or Welcome Screen */}
        <main className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-2 flex flex-col justify-start">
          {currentConversation.messages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => {
                setInput(prompt);
                handleSendMessage(prompt);
              }}
              providerName={serverStatus?.provider}
            />
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-1">
              {currentConversation.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isSpeaking={isSpeaking && activeMessageId === msg.id}
                  onToggleSpeech={() => speak(msg.content, msg.id)}
                  canSpeak={isTtsSupported}
                />
              ))}

              {isLoading && <ThinkingIndicator />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </main>

        {/* Chat Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          isLoading={isLoading}
          onStopLoading={handleStopLoading}
          isListening={isListening}
          onToggleVoice={toggleListening}
          isVoiceSupported={isVoiceSupported}
          voiceError={voiceError}
        />
      </div>

      {/* Key Info & Change Modal */}
      <KeyInfoModal
        isOpen={isKeyInfoOpen}
        onClose={() => setIsKeyInfoOpen(false)}
        serverStatus={serverStatus}
        onRefreshStatus={async () => {
          const status = await fetchServerStatus();
          if (status) setServerStatus(status);
        }}
      />
    </div>
  );
}
