import Anthropic from "@anthropic-ai/sdk";

/**
 * Lazy Anthropic client singleton.
 * Created on first use so the module can be imported at build time
 * without ANTHROPIC_API_KEY being set.
 */
let _anthropic: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

// Named export for backwards compatibility — lazy proxy
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    return (getAnthropic() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
