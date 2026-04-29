import OpenAI from "openai";

/**
 * OpenAI client singleton.
 * Used for GPT-4o answer generation and Whisper speech-to-text transcription.
 */
const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openai = openai;
}
