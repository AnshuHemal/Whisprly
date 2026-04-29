"use client";

import { useSessionStore } from "@/store/sessionStore";
import { cn } from "@/lib/utils";
import type { ListeningStatus } from "@/types";

interface ListeningIndicatorProps {
  isListening: boolean;
  isProcessing: boolean;
  listeningStatus: ListeningStatus;
  isSpeechSupported: boolean;
}

/**
 * ListeningIndicator — shows the interim transcript while the user is speaking,
 * or a contextual hint when idle.
 */
export function ListeningIndicator({
  isListening,
  isProcessing,
  listeningStatus,
  isSpeechSupported,
}: ListeningIndicatorProps) {
  const { interimTranscript } = useSessionStore();

  if (isListening && interimTranscript) {
    return (
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/50 truncate font-mono leading-relaxed">
          <span className="text-indigo/70 mr-1.5" aria-hidden="true">▸</span>
          {interimTranscript}
          <span className="inline-block w-0.5 h-4 bg-indigo/60 ml-0.5 animate-pulse align-middle" />
        </p>
      </div>
    );
  }

  if (isListening && !interimTranscript) {
    return (
      <div className="flex-1 flex items-center gap-2">
        <SoundWave />
        <span className="text-xs text-white/30">Listening for a question…</span>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex-1">
        <span className="text-xs text-white/30">Generating answer…</span>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <span className="text-xs text-white/20">
        {isSpeechSupported
          ? "Press Space or tap the mic to start"
          : "Tap the mic to record a question"}
      </span>
    </div>
  );
}

// ─── Animated sound wave ──────────────────────────────────────────────────

function SoundWave() {
  return (
    <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
      {[1, 2, 3, 4, 3].map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-0.5 rounded-full bg-indigo/70",
            "animate-bounce"
          )}
          style={{
            height: `${h * 3}px`,
            animationDelay: `${i * 80}ms`,
            animationDuration: "600ms",
          }}
        />
      ))}
    </div>
  );
}
