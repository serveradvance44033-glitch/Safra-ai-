export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ServerStatus {
  status: string;
  assistant: string;
  provider: string;
  hasOpenAiKey: boolean;
  isOpenAiPlaceholder?: boolean;
  maskedOpenAiKey?: string;
  hasGeminiKey: boolean;
  maskedGeminiKey?: string;
  timestamp: string;
}
