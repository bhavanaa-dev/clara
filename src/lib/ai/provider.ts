/**
 * AI provider abstraction — server-side only.
 *
 * Active provider is selected by AI_PROVIDER (nvidia|gemini). NVIDIA
 * configuration is retained as a backup provider option; Gemini is also
 * used for image/vision input, which NVIDIA text models do not support.
 * The Gemini text model comes from GEMINI_MODEL (see lib/gemini/client).
 *
 * NEVER import a provider API key into client-side code. All calls stay
 * server-side. Keys are read from environment variables only.
 *
 * Selection:
 *   AI_PROVIDER=nvidia|gemini  (explicit override, optional)
 *   default: 'nvidia' when NVIDIA_API_KEY is set, otherwise 'gemini'
 */

export type AIProviderName = 'nvidia' | 'gemini';

export const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1';

export const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL ?? 'deepseek-ai/deepseek-v4-pro-0813';

export interface JsonRequest {
  /** Optional system instruction. Ignored by providers that don't support it. */
  system?: string;
  /** The full user prompt (already contains JSON-schema instructions). */
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export function getActiveProviderName(): AIProviderName {
  const override = (process.env.AI_PROVIDER ?? '').toLowerCase();
  if (override === 'nvidia' || override === 'gemini') return override;
  if (process.env.NVIDIA_API_KEY) return 'nvidia';
  return 'gemini';
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export function isNvidiaConfigured(): boolean {
  return !!process.env.NVIDIA_API_KEY;
}

/**
 * Generate a JSON-formatted completion and return the raw text.
 * Callers parse/validate with their existing parseJsonSafely helpers.
 */
export async function generateJson(request: JsonRequest): Promise<string> {
  const provider = getActiveProviderName();
  if (provider === 'nvidia') {
    return generateJsonNvidia(request);
  }
  return generateJsonGemini(request);
}

// ─── NVIDIA (OpenAI-compatible chat completions) ─────────────────────────────

async function generateJsonNvidia(request: JsonRequest): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error(
      'NVIDIA_API_KEY environment variable is not set. Check your .env file.'
    );
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (request.system) {
    messages.push({ role: 'system', content: request.system });
  }
  messages.push({ role: 'user', content: request.user });

  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      temperature: request.temperature ?? 0.1,
      ...(request.maxTokens ? { max_tokens: request.maxTokens } : {}),
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 500);
    throw new Error(
      `NVIDIA API request failed (model ${NVIDIA_MODEL}, HTTP ${res.status}): ${snippet}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('NVIDIA API returned an empty completion.');
  }
  return content;
}

// ─── Gemini (fallback + vision) ──────────────────────────────────────────────

async function generateJsonGemini(request: JsonRequest): Promise<string> {
  // Relative import (not @/ alias) so this lazy load resolves identically
  // under Next.js, plain Node, and any bundler.
  const { getGeminiClient, GEMINI_MODEL } = await import(
    '../gemini/client'
  );
  const client = getGeminiClient();

  const parts: Array<{ text: string }> = [
    {
      text: request.system
        ? `${request.system}\n\n${request.user}`
        : request.user,
    },
  ];

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: 'user', parts }],
    config: {
      temperature: request.temperature ?? 0.1,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text ?? '';
  if (!text) {
    throw new Error('Gemini API returned an empty completion.');
  }
  return text;
}
