import { Message, ServerStatus } from '../types';

export async function sendChatMessage(
  messages: Message[],
  providerPreference?: string
): Promise<{ reply: string; model?: string; provider?: string }> {
  const payload = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: payload,
      providerPreference,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error (${response.status})`);
  }

  const data = await response.json();
  return {
    reply: data.reply || 'No response received.',
    model: data.model,
    provider: data.provider,
  };
}

export async function fetchServerStatus(): Promise<ServerStatus | null> {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('Could not fetch server status:', err);
    return null;
  }
}
