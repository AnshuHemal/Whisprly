"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

interface AnswerPanelProps {
  onCancelStream: () => void;
}

/**
 * AnswerPanel — displays the streaming answer with a blinking cursor,
 * copy-to-clipboard, and a confidence/status indicator.
 *
 * Empty state: shows a prompt to start listening.
 */
export function AnswerPanel({ onCancelStream }: AnswerPanelProps) {
  const {
    currentQuestion,
    currentAnswer,
    interimTranscript,
    isProcessing,
    listeningStatus,
  } = useSessionStore();

  const [copied, setCopied] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as answer streams in
  useEffect(() => {
    if (answerRef.current && currentAnswer) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [currentAnswer]);

  async function handleCopy() {
    if (!currentAnswer) return;
    await navigator.clipboard.writeText(currentAnswer);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  const isEmpty = !currentQuestion && !currentAnswer && !interimTranscript;

  return (
    <div className="flex flex-col h-full px-5 py-4 gap-4">

      {/* ── Status badge ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <StatusBadge status={listeningStatus} isProcessing={isProcessing} />

        {/* Actions — only show when there's content */}
        {(currentAnswer || isProcessing) && (
          <div className="flex items-center gap-1">
            {isProcessing && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      onClick={onCancelStream}
                      aria-label="Cancel generation"
                    />
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>Cancel (Esc)</TooltipContent>
              </Tooltip>
            )}

            {currentAnswer && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/8"
                      onClick={handleCopy}
                      aria-label="Copy answer"
                    />
                  }
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </TooltipTrigger>
                <TooltipContent>Copy answer</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* ── Question ──────────────────────────────────────────────────── */}
      {(currentQuestion || interimTranscript) && (
        <div className="shrink-0">
          <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-1.5">
            Question
          </p>
          <p className="text-sm text-white/60 leading-relaxed font-mono">
            {currentQuestion || interimTranscript}
            {/* Blinking cursor while still transcribing */}
            {!currentQuestion && interimTranscript && (
              <span className="inline-block w-0.5 h-4 bg-indigo/70 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </div>
      )}

      {/* ── Answer ────────────────────────────────────────────────────── */}
      <div
        ref={answerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <svg
                className="h-8 w-8 text-white/20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/30">Ready when you are</p>
              <p className="text-xs text-white/20 mt-1">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-white/8 font-mono text-white/40 text-xs">
                  Space
                </kbd>{" "}
                or tap the mic to start listening
              </p>
            </div>
          </div>
        ) : isProcessing && !currentAnswer ? (
          /* Loading state — waiting for first token */
          <div className="flex items-center gap-3 pt-2">
            <Loader2 className="h-4 w-4 text-indigo animate-spin shrink-0" />
            <span className="text-sm text-white/40">Generating answer…</span>
          </div>
        ) : (
          /* Streaming answer */
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-base leading-relaxed text-white/90 whitespace-pre-wrap font-sans">
              {currentAnswer}
              {/* Blinking cursor while streaming */}
              {isProcessing && (
                <span className="inline-block w-0.5 h-5 bg-indigo ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────

type BadgeStatus = "idle" | "listening" | "processing" | "ready" | "error";

function StatusBadge({
  status,
  isProcessing,
}: {
  status: BadgeStatus;
  isProcessing: boolean;
}) {
  const config: Record<BadgeStatus, { label: string; color: string; dot: string }> = {
    idle: {
      label: "Ready",
      color: "text-white/30",
      dot: "bg-white/20",
    },
    listening: {
      label: "Listening…",
      color: "text-indigo-light",
      dot: "bg-indigo animate-pulse",
    },
    processing: {
      label: "Processing…",
      color: "text-amber-400",
      dot: "bg-amber-400 animate-pulse",
    },
    ready: {
      label: isProcessing ? "Generating…" : "Answer ready",
      color: isProcessing ? "text-indigo-light" : "text-green-400",
      dot: isProcessing ? "bg-indigo animate-pulse" : "bg-green-400",
    },
    error: {
      label: "Error — try again",
      color: "text-red-400",
      dot: "bg-red-400",
    },
  };

  const { label, color, dot } = config[status] ?? config.idle;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} aria-hidden="true" />
      {label}
    </div>
  );
}
