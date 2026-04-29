"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionStore } from "@/store/sessionStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import { useSessionStream } from "@/hooks/useSessionStream";
import { SessionOverlay } from "@/components/session/SessionOverlay";
import type { TranscriptItem, SessionStatus } from "@/types";

interface SessionShellProps {
  session: {
    id: string;
    title: string | null;
    jobTitle: string | null;
    company: string | null;
    status: SessionStatus;
    duration: number;
    createdAt: Date;
  };
  initialTranscripts: TranscriptItem[];
  resumeContext: string;
  userName: string;
}

/**
 * SessionShell — client boundary that wires together:
 *  - Zustand store initialisation
 *  - Speech recognition / audio capture hooks
 *  - Answer streaming hook
 *  - Keyboard shortcuts
 *  - Session end / navigation
 *
 * Renders SessionOverlay as the visible UI.
 */
export function SessionShell({
  session,
  initialTranscripts,
  resumeContext,
  userName,
}: SessionShellProps) {
  const router = useRouter();

  const {
    startSession,
    stopSession,
    addTranscript,
    isListening,
    clearCurrent,
    setJobDescription,
  } = useSessionStore();

  // ── Initialise store on mount ──────────────────────────────────────────
  useEffect(() => {
    startSession({
      sessionId: session.id,
      resumeContext,
      jobDescription: "",
    });

    // Hydrate history from server-fetched transcripts
    initialTranscripts.forEach((t) => addTranscript(t));

    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  // ── Answer streaming ───────────────────────────────────────────────────
  const { streamAnswer, cancelStream } = useSessionStream();

  // ── Speech recognition (primary) ──────────────────────────────────────
  const { isSupported, startListening, stopListening, toggleListening } =
    useSpeechRecognition({
      silenceThresholdMs: 2000,
      onQuestion: (question) => {
        streamAnswer(question);
      },
      onUnsupported: () => {
        toast.info("Web Speech API not supported — using microphone fallback.");
      },
    });

  // ── Audio capture (fallback) ───────────────────────────────────────────
  const { isRecording, startRecording, stopRecording } = useAudioCapture({
    sessionId: session.id,
    onTranscript: (text) => {
      streamAnswer(text);
    },
  });

  // ── Unified toggle ─────────────────────────────────────────────────────
  const handleToggleListening = useCallback(() => {
    if (isSupported) {
      toggleListening();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }, [isSupported, isRecording, toggleListening, startRecording, stopRecording]);

  // ── End session ────────────────────────────────────────────────────────
  const handleEndSession = useCallback(async () => {
    stopListening();
    stopRecording();
    cancelStream();

    try {
      await fetch(`/api/session?id=${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });
    } catch {
      // Non-critical — session will be cleaned up on next load
    }

    stopSession();
    router.push("/dashboard");
  }, [session.id, stopListening, stopRecording, cancelStream, stopSession, router]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't fire when typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        handleToggleListening();
      }

      if (e.code === "Escape") {
        e.preventDefault();
        clearCurrent();
        cancelStream();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleListening, clearCurrent, cancelStream]);

  return (
    <SessionOverlay
      session={session}
      userName={userName}
      isListening={isListening || isRecording}
      isSpeechSupported={isSupported}
      onToggleListening={handleToggleListening}
      onEndSession={handleEndSession}
      onCancelStream={cancelStream}
      onJobDescriptionChange={setJobDescription}
    />
  );
}
