"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface UseAudioCaptureOptions {
  /** Called with the transcribed text from the Whisper API */
  onTranscript: (text: string) => void;
  /** Session ID — required for the /api/transcribe rate limit key */
  sessionId: string | null;
}

interface UseAudioCaptureReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

/**
 * useAudioCapture — MediaRecorder-based audio capture with Whisper STT fallback.
 *
 * Used when the Web Speech API is unavailable (e.g. Firefox, some mobile browsers).
 * Records audio as a WebM/Opus blob, sends it to /api/transcribe (OpenAI Whisper),
 * and fires `onTranscript` with the result.
 */
export function useAudioCapture({
  onTranscript,
  sessionId,
}: UseAudioCaptureOptions): UseAudioCaptureReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Start recording ────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Prefer WebM/Opus for best compression; fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        chunksRef.current = [];

        if (blob.size < 1000) return; // Too short — skip

        await transcribeBlob(blob);
      };

      recorder.start(250); // Collect data every 250ms
      setIsRecording(true);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone access and try again."
          : "Could not access your microphone.";
      toast.error(message);
    }
  }, [isRecording]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop recording ─────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    try {
      mediaRecorderRef.current.stop();
    } catch {
      // Already stopped
    }

    setIsRecording(false);
  }, [isRecording]);

  // ── Transcribe via Whisper ─────────────────────────────────────────────

  const transcribeBlob = useCallback(
    async (blob: Blob) => {
      if (!sessionId) return;

      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("sessionId", sessionId);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            toast.warning("Transcription limit reached. Please wait a moment.");
          } else {
            throw new Error(json.error ?? "Transcription failed");
          }
          return;
        }

        const text: string = json.data?.text ?? "";
        if (text.trim()) {
          onTranscript(text.trim());
        }
      } catch (err) {
        console.error("[useAudioCapture] transcribe error:", err);
        toast.error("Could not transcribe audio. Please try again.");
      } finally {
        setIsTranscribing(false);
      }
    },
    [sessionId, onTranscript]
  );

  return { isRecording, isTranscribing, startRecording, stopRecording };
}
