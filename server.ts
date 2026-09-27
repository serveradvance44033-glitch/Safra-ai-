import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

const SYSTEM_INSTRUCTION = `You are Safra, a friendly, warm, intelligent, and highly supportive personal AI assistant.
Your persona:
- Name: Safra
- Tone: Friendly, empathetic, articulate, thoughtful, and crisp.
- Mobile-friendly formatting: Keep responses easy to read on mobile screens (use clean headings, short paragraphs, bullet points, and code formatting when relevant).
- Always introduce yourself warmly as Safra when greeted, and be ready to help with writing, productivity, brainstorming, coding, planning, or casual conversation.
- If asked about your creators or origin, you are Safra AI, a modern personal assistant.`;

// Checks whether a given string is a plausible OpenAI API key (must start with sk- and not be a placeholder)
function isValidOpenAiKeyFormat(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  // Valid OpenAI keys start with "sk-" (such as "sk-proj-...", "sk-admin-...", or "sk-...")
  if (!trimmed.startsWith('sk-')) return false;
  if (
    trimmed.includes('YOUR_') ||
    trimmed.includes('MY_') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('OPENAI_API_KEY')
  ) {
    return false;
  }
  return trimmed.length >= 25;
}

// Checks whether a given string is a plausible Gemini API key
function isValidGeminiKeyFormat(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed.includes('MY_GEMINI_API_KEY') ||
    trimmed.includes('YOUR_') ||
    trimmed.includes('placeholder') ||
    trimmed.startsWith('GEMINI_')
  ) {
    return false;
  }
  return trimmed.length >= 20;
}

// Masks API keys safely for status confirmation (e.g. sk-proj-••••••••w9Z)
function maskKey(key?: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••••••';
  const prefixLen = Math.min(7, Math.floor(trimmed.length / 4));
  const suffixLen = Math.min(4, Math.floor(trimmed.length / 4));
  return trimmed.slice(0, prefixLen) + '••••••••' + trimmed.slice(-suffixLen);
}

// Status endpoint to check active provider and configuration
app.get('/api/status', (_req: Request, res: Response) => {
  // Re-read .env dynamically in case user updated secrets or .env file
  try {
    dotenv.config({ override: true });
  } catch {
    // ignore
  }

  const rawOpenAi = process.env.OPENAI_API_KEY?.trim() || '';
  const rawGemini = process.env.GEMINI_API_KEY?.trim() || '';

  const hasRealOpenAI = isValidOpenAiKeyFormat(rawOpenAi);
  const isOpenAiPlaceholder = Boolean(
    rawOpenAi && !hasRealOpenAI && (rawOpenAi.startsWith('OPENAI_') || rawOpenAi.includes('key'))
  );
  const hasRealGemini = isValidGeminiKeyFormat(rawGemini);

  let provider = 'Safra Engine (Demo Mode)';
  if (hasRealOpenAI) {
    provider = 'OpenAI Responses API';
  } else if (hasRealGemini) {
    provider = 'Gemini Engine';
  }

  res.json({
    status: 'online',
    assistant: 'Safra AI',
    provider,
    hasOpenAiKey: hasRealOpenAI,
    isOpenAiPlaceholder,
    maskedOpenAiKey: rawOpenAi ? maskKey(rawOpenAi) : undefined,
    hasGeminiKey: hasRealGemini,
    maskedGeminiKey: rawGemini ? maskKey(rawGemini) : undefined,
    timestamp: new Date().toISOString(),
  });
});

// Helper: Call OpenAI Responses API with fallback to Chat Completions
async function callOpenAI(messages: Array<{ role: string; content: string }>, apiKey: string) {
  // First attempt: OpenAI Responses API (/v1/responses)
  try {
    const formattedInput = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const responsesRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: formattedInput,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (responsesRes.ok) {
      const data = await responsesRes.json();
      if (typeof data.output_text === 'string' && data.output_text) {
        return { text: data.output_text, modelUsed: 'gpt-4o-mini (OpenAI Responses)' };
      }
      if (Array.isArray(data.output)) {
        for (const item of data.output) {
          if (item?.content && Array.isArray(item.content)) {
            const textItem = item.content.find((c: any) => c.type === 'text' || typeof c.text === 'string');
            if (textItem?.text) {
              return { text: textItem.text, modelUsed: 'gpt-4o-mini (OpenAI Responses)' };
            }
          }
        }
      }
    } else {
      const errorJson = await responsesRes.json().catch(() => ({}));
      const errMsg = errorJson.error?.message || `OpenAI Responses API returned status ${responsesRes.status}`;
      if (responsesRes.status === 401 || responsesRes.status === 429 || errMsg.includes('credits') || errMsg.includes('quota')) {
        throw new Error(errMsg);
      }
    }
  } catch (err: any) {
    if (
      err.message?.includes('Incorrect API key') ||
      err.message?.includes('invalid_api_key') ||
      err.message?.includes('credits') ||
      err.message?.includes('quota')
    ) {
      throw err;
    }
    console.warn('Responses API call failed, trying Chat Completions fallback:', err.message);
  }

  // Fallback: standard OpenAI Chat Completions API
  const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
    signal: AbortSignal.timeout(6000),
  });

  if (!chatRes.ok) {
    const errorData = await chatRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API returned status ${chatRes.status}`);
  }

  const chatData = await chatRes.json();
  const reply = chatData.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('No reply received from OpenAI API');
  }

  return { text: reply, modelUsed: 'gpt-4o-mini (OpenAI Chat)' };
}

// Fallback: Google Gemini API if Gemini key is available
async function callGemini(messages: Array<{ role: string; content: string }>, apiKey: string) {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const formattedContents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini ${model} timed out`)), 7000)
      );

      const generatePromise = ai.models.generateContent({
        model,
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response.text) {
        return { text: response.text, modelUsed: `${model} (Google Gemini)` };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} attempt failed:`, err.message || err);
    }
  }

  throw lastError || new Error('No content received from Gemini');
}

// Friendly fallback engine with helpful topic-based responses
function generateFriendlyFallback(lastUserMessage: string, keyWarning?: string): { text: string; modelUsed: string } {
  const query = lastUserMessage.toLowerCase();

  const warningNote = keyWarning
    ? `\n\n> ⚠️ **API Key Notice**: The backend received an invalid or placeholder OpenAI key (*"${keyWarning}"*). To use live OpenAI models, set a valid key starting with \`sk-...\` in your environment secrets.\n`
    : '';

  // Greetings
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return {
      text: `Hello there! 👋 I'm **Safra**, your personal AI assistant.${warningNote}\nI'm ready to help you with:\n- ✍️ **Writing & Editing**: Drafting emails, messages, essays, and reports.\n- 💡 **Brainstorming**: Generating ideas, names, and strategies.\n- 📋 **Daily Productivity**: Organizing routines, checklists, and schedules.\n- 🎙️ **Voice & Audio**: Listen to my replies with the audio button or speak to me via the microphone!\n\nWhat would you like to work on today?`,
      modelUsed: 'Safra Core Engine',
    };
  }

  // Who are you / about Safra
  if (query.includes('who are you') || query.includes('your name') || query.includes('about you') || query.includes('what are you')) {
    return {
      text: `I'm **Safra AI** 👋, a modern personal AI assistant designed to be fast, friendly, and easy to use on both mobile phones and desktops.${warningNote}\nKey features I include:\n- 📱 **Mobile-First Design**: Smooth, responsive, touch-friendly UI for Android & iOS.\n- 🎙️ **Voice Input & Text-to-Speech**: Hands-free conversation anywhere.\n- 💬 **Session History**: Easily switch between past conversations or start a new chat.\n- 🔒 **Secure Backend**: Securely connects to the OpenAI Responses API without exposing keys to the browser.`,
      modelUsed: 'Safra Core Engine',
    };
  }

  // Productivity advice
  if (query.includes('productivity') || query.includes('focus') || query.includes('schedule') || query.includes('organize')) {
    return {
      text: `Here are **3 high-impact productivity habits** to supercharge your day:${warningNote}\n\n1. **The 3-Priority Rule (The Rule of 3)**\n   Each morning, choose only **3 core outcomes** that will make the day successful. Complete the hardest one before checking social media or email.\n\n2. **Time-Boxing with the 50/10 Rhythm**\n   Work with total focus for 50 minutes, followed by a strict 10-minute screen-free break (stretch, drink water, breathe).\n\n3. **Close Open Loops Before Bed**\n   Spend 5 minutes writing down tomorrow’s to-do list. Emptying your head onto paper reduces nighttime cognitive load and allows deeper rest.\n\nWould you like help planning out your tasks for today?`,
      modelUsed: 'Safra Core Engine',
    };
  }

  // Breakfast / Food suggestions
  if (query.includes('breakfast') || query.includes('meal') || query.includes('food') || query.includes('recipe') || query.includes('healthy')) {
    return {
      text: `Here are **3 quick, healthy breakfast ideas** that take under 10 minutes:${warningNote}\n\n- 🥣 **High-Protein Overnight Oats**: Rolled oats, Greek yogurt, chia seeds, a splash of almond milk, topped with sliced banana or berries.\n- 🥑 **Avocado & Poached Egg Toast**: Toasted sourdough or whole-grain bread, mashed avocado with lemon juice, a pinch of sea salt, and a soft egg on top.\n- 🍓 **Energizing Green Smoothie**: 1 cup spinach, 1 frozen banana, 1 scoop protein powder, 1 tablespoon peanut butter, and almond milk blended smooth.\n\nEnjoy your healthy start!`,
      modelUsed: 'Safra Core Engine',
    };
  }

  // Code & programming
  if (query.includes('code') || query.includes('javascript') || query.includes('python') || query.includes('react') || query.includes('html') || query.includes('programming')) {
    return {
      text: `Here is a clean code example to help you out:${warningNote}\n\n\`\`\`javascript\n// Simple async helper to fetch data safely\nasync function fetchSafely(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);\n    return await res.json();\n  } catch (error) {\n    console.error('Fetch error:', error);\n    return null;\n  }\n}\n\`\`\`\n\nFeel free to ask me for any specific function, algorithm, or explanation you need!`,
      modelUsed: 'Safra Core Engine',
    };
  }

  // General questions / fallback
  return {
    text: `I'm happy to help you with that! ✨${warningNote}\n\nYou asked about: **"${lastUserMessage}"**\n\nHere are some helpful insights:\n- Break large problems down into 2 or 3 smaller steps.\n- Focus on the core objective first, then refine details.\n- You can use my voice reading button to hear this aloud anytime!\n\n*Tip: To activate full live OpenAI reasoning, ensure a valid \`OPENAI_API_KEY\` (starting with \`sk-...\`) is added to your environment.* How else can I assist you?`,
    modelUsed: 'Safra Core Engine',
  };
}

// Main chat route: /api/chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    try {
      dotenv.config({ override: true });
    } catch {
      // ignore
    }

    const { messages, providerPreference } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
      return;
    }

    const rawOpenAi = process.env.OPENAI_API_KEY?.trim() || '';
    const rawGemini = process.env.GEMINI_API_KEY?.trim() || '';

    const hasValidOpenAiKey = isValidOpenAiKeyFormat(rawOpenAi);
    const hasValidGeminiKey = isValidGeminiKeyFormat(rawGemini);
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // If user explicitly chose Gemini or if OpenAI is not available/requested
    if (providerPreference === 'gemini' && hasValidGeminiKey) {
      try {
        const result = await callGemini(messages, rawGemini);
        res.json({
          reply: result.text,
          model: result.modelUsed,
          provider: 'Google Gemini',
        });
        return;
      } catch (geminiError: any) {
        console.warn('Direct Gemini call failed:', geminiError.message);
      }
    }

    // OpenAI Responses API (if preferred or auto and key is valid)
    if (providerPreference !== 'gemini' && hasValidOpenAiKey) {
      try {
        const result = await callOpenAI(messages, rawOpenAi);
        res.json({
          reply: result.text,
          model: result.modelUsed,
          provider: 'OpenAI Responses API',
        });
        return;
      } catch (openAiError: any) {
        console.warn('OpenAI API call failed:', openAiError.message);

        // If Gemini is available, seamlessly fall back to Gemini without failing user experience
        if (hasValidGeminiKey) {
          try {
            const geminiResult = await callGemini(messages, rawGemini);
            res.json({
              reply: geminiResult.text,
              model: geminiResult.modelUsed,
              provider: 'Google Gemini (Auto Fallback)',
              notice: `OpenAI quota note: ${openAiError.message}. Handled smoothly by Gemini.`,
            });
            return;
          } catch (geminiError: any) {
            console.warn('Gemini fallback also failed:', geminiError.message);
          }
        }

        // Return graceful fallback response with explanation so user experience never breaks
        const fallback = generateFriendlyFallback(lastUserMessage, openAiError.message);
        res.json({
          reply: fallback.text,
          model: fallback.modelUsed,
          provider: 'Safra Core Engine',
          keyIssue: true,
          notice: `OpenAI key issue: ${openAiError.message}`,
        });
        return;
      }
    }

    // Secondary priority: Gemini API (if OpenAI wasn't used)
    if (hasValidGeminiKey) {
      try {
        const result = await callGemini(messages, rawGemini);
        res.json({
          reply: result.text,
          model: result.modelUsed,
          provider: 'Google Gemini',
        });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed:', geminiError.message);
      }
    }

    // Notice for placeholder keys like "OPENAI_A..._key"
    let keyWarningMessage = '';
    if (rawOpenAi && !hasValidOpenAiKey) {
      keyWarningMessage = `Incorrect or placeholder API key provided ("${rawOpenAi.slice(0, 10)}..."). OpenAI keys must begin with "sk-".`;
    }

    // Fallback: Friendly built-in Safra engine
    const fallback = generateFriendlyFallback(lastUserMessage, keyWarningMessage);
    res.json({
      reply: fallback.text,
      model: fallback.modelUsed,
      provider: 'Safra Core Engine',
      notice: keyWarningMessage || 'Configure OPENAI_API_KEY (sk-...) in environment to unlock full OpenAI Responses model.',
    });
  } catch (err: any) {
    console.error('Unexpected server error in /api/chat:', err);
    res.status(500).json({ error: 'Internal server error processing chat message.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Safra AI backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Safra AI server:', err);
  process.exit(1);
});
