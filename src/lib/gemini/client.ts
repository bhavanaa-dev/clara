/**
 * Gemini API client — server-side singleton.
 * NEVER import this module from client-side code.
 * The GEMINI_API_KEY is read here and never passed to the browser.
 */
import { GoogleGenAI } from '@google/genai';

let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set. Check your .env file.'
    );
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

function readGeminiModel(): string {
  const fromEnv = (process.env.GEMINI_MODEL ?? '').trim();
  return fromEnv || 'gemini-3.1-flash-lite';
}

export const GEMINI_MODEL = readGeminiModel();
export const GEMINI_MODEL_VISION = readGeminiModel();
