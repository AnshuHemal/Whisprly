"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSessionStore } from "@/store/sessionStore";
import type { SelectedModel } from "@/types";

interface UseSessionStreamOptions {
  onComplete?: (question: string, answer: string) => void;
}

interface UseSessionStreamReturn {
  streamAnswer: (question: string) => Promise<void>;
  cancelStream: () => void;
}

/**
 * useSessionStream — sends a question to /api/answer and streams the response
 * chunk-by-chunk into the Zustand store via `appendAnswer`.
 *
 * Uses the Fetch API with a ReadableStream reader to process SSE-style
 * text/plain streaming from the Vercel AI SDK.
 */
export function useSessionStream({
  onComplete,
}: UseSessionStreamOptions = {}): UseSessionStreamReturn {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    sessionId,
    resumeContext,
    jobDescription,
    selectedModel,
    setQuestion,
    appendAnswer,
    setAnswer,
    setProcessing,
    setListeningStatus,
    commitTranscript,
  } = useSessionStore();

  // ── Cancel any in-flight stream ────────────────────────────────────────

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProcessing(false);
  }, [setProcessing]);

  // ── Stream an answer ───────────────────────────────────────────────────

  const streamAnswer = useCallback(
    async (question: string) => {
      if (!question.trim() || !sessionId) return;

      // Cancel any previous stream
      cancelStream();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setQuestion(question);
      setProcessing(true);
      setListeningStatus("processing");

      let fullAnswer = "";

      try {
        const res = await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            resumeContext,
            jobDescription,
            model: selectedModel as SelectedModel,
            sessionId,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          if (res.status === 429) {
            toast.warning("Answer limit reached. Please wait a moment.");
          } else {
            throw new Error(json.error ?? `Request failed: ${res.status}`);
          }
          setProcessing(false);
          setListeningStatus("error");
          return;
        }

        if (!res.body) throw new Error("No response body");

        // ── Read the stream ──────────────────────────────────────────────
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        setListeningStatus("ready");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // The Vercel AI SDK streams text/plain — each chunk is raw text
          // Strip the "0:" prefix from data stream protocol if present
          const lines = chunk.split("\n");
          for (const line of lines) {
            let text = line;

            // Handle Vercel AI SDK data stream format: `0:"chunk text"`
            if (line.startsWith('0:"')) {
              try {
                text = JSON.parse(line.slice(2));
              } catch {
                text = line.slice(3, -1); // fallback strip
              }
            } else if (line.startsWith("0:")) {
              text = line.slice(2);
            }

            if (text) {
              fullAnswer += text;
              appendAnswer(text);
            }
          }
        }

        // ── Stream complete ──────────────────────────────────────────────
        setAnswer(fullAnswer);
        setListeningStatus("ready");
        commitTranscript();
        onComplete?.(question, fullAnswer);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — not an error
          return;
        }
        console.error("[useSessionStream] error:", err);
        toast.error("Could not generate an answer. Please try again.");
        setListeningStatus("error");
      } finally {
        setProcessing(false);
        abortControllerRef.current = null;
      }
    },
    [
      sessionId,
      resumeContext,
      jobDescription,
      selectedModel,
      cancelStream,
      setQuestion,
      appendAnswer,
      setAnswer,
      setProcessing,
      setListeningStatus,
      commitTranscript,
      onComplete,
    ]
  );

  return { streamAnswer, cancelStream };
}
