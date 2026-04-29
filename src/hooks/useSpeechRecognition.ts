"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/store/sessionStore";

// Extend Window for the Web Speech API (not in all TS lib versions)
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseSpeechRecognitionOptions {
  /**
   * Milliseconds of silence after which a question is considered complete.
   * Defaults to 2000ms.
   */
  silenceThresholdMs?: number;
  /** Called when a final question is detected */
  onQuestion?: (question: string) => void;
  /** Called when the browser doesn't support the Web Speech API */
  onUnsupported?: () => void;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

/**
 * useSpeechRecognition — wraps the Web Speech API for real-time transcription.
 *
 * Behaviour:
 * - Streams interim results to the Zustand store as the user speaks
 * - Detects question end via 2s silence (configurable)
 * - Fires `onQuestion` with the final transcript when silence is detected
 * - Falls back gracefully when the browser doesn't support the API
 */
export function useSpeechRecognition({
  silenceThresholdMs = 2000,
  onQuestion,
  onUnsupported,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const isListeningRef = useRef(false);

  const { setInterimTranscript, setListeningStatus } = useSessionStore();

  // Check browser support
  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // ── Silence detection ──────────────────────────────────────────────────

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const startSilenceTimer = useCallback(
    (transcript: string) => {
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        if (transcript.trim()) {
          onQuestion?.(transcript.trim());
          finalTranscriptRef.current = "";
          setInterimTranscript("");
        }
      }, silenceThresholdMs);
    },
    [clearSilenceTimer, onQuestion, setInterimTranscript, silenceThresholdMs]
  );

  // ── Recognition setup ──────────────────────────────────────────────────

  const setupRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setListeningStatus("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalChunk) {
        finalTranscriptRef.current += " " + finalChunk;
        finalTranscriptRef.current = finalTranscriptRef.current.trim();
      }

      // Show combined interim in the UI
      const displayText = (finalTranscriptRef.current + " " + interim).trim();
      setInterimTranscript(displayText);

      // Reset silence timer on every speech event
      startSilenceTimer(finalTranscriptRef.current || interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are expected — don't treat as errors
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.error("[SpeechRecognition] error:", event.error);
      setListeningStatus("error");
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Recognition may already be starting — ignore
        }
      } else {
        setIsListening(false);
        setListeningStatus("idle");
      }
    };

    return recognition;
  }, [isSupported, setInterimTranscript, setListeningStatus, startSilenceTimer]);

  // ── Controls ───────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!isSupported) {
      onUnsupported?.();
      return;
    }

    if (isListeningRef.current) return;

    const recognition = setupRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    finalTranscriptRef.current = "";
    isListeningRef.current = true;

    try {
      recognition.start();
    } catch (err) {
      console.error("[SpeechRecognition] start error:", err);
      isListeningRef.current = false;
    }
  }, [isSupported, onUnsupported, setupRecognition]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearSilenceTimer();
    finalTranscriptRef.current = "";
    setInterimTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }

    setIsListening(false);
    setListeningStatus("idle");
  }, [clearSilenceTimer, setInterimTranscript, setListeningStatus]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      clearSilenceTimer();
      recognitionRef.current?.stop();
    };
  }, [clearSilenceTimer]);

  return { isSupported, isListening, startListening, stopListening, toggleListening };
}
