import OpenAI from "openai";

/**
 * Lazy OpenAI client singleton.
 * Created on first use so the module can be imported at build time
 * without OPENAI_API_KEY being set.
 *
 * Used for Whisper speech-to-text transcription in /api/transcribe.
 * GPT-4o answer generation uses @ai-sdk/openai directly in /api/answer.
 */
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Named export for backwards compatibility — lazy proxy
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
