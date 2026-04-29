"use client";

import { useSessionStore } from "@/store/sessionStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectedModel } from "@/types";

const MODELS: { value: SelectedModel; label: string; badge: string }[] = [
  { value: "gpt-4o", label: "GPT-4o", badge: "OpenAI" },
  { value: "claude-sonnet", label: "Claude Sonnet", badge: "Anthropic" },
];

/**
 * ModelSelector — compact dropdown to switch between GPT-4o and Claude Sonnet.
 * Writes directly to the Zustand session store.
 */
export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useSessionStore();

  return (
    <Select
      value={selectedModel}
      onValueChange={(v) => setSelectedModel(v as SelectedModel)}
    >
      <SelectTrigger
        className="h-8 w-auto gap-1.5 border-white/10 bg-white/5 text-white/60 hover:bg-white/8 hover:text-white text-xs px-2.5 focus:ring-indigo/50 [&>svg]:text-white/30"
        aria-label="Select AI model"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
        {MODELS.map((m) => (
          <SelectItem
            key={m.value}
            value={m.value}
            className="text-xs focus:bg-white/8 focus:text-white cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {m.label}
              <span className="text-[10px] text-white/30">{m.badge}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
