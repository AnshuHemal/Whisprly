import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TranscriptItem, SelectedModel, ListeningStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────

interface SessionState {
  // ── Identity ──────────────────────────────────────────────────────────
  sessionId: string | null;

  // ── Status flags ──────────────────────────────────────────────────────
  isListening: boolean;
  isProcessing: boolean;
  listeningStatus: ListeningStatus;

  // ── Current turn ──────────────────────────────────────────────────────
  /** The question currently being transcribed / just detected */
  currentQuestion: string;
  /** The answer currently streaming in */
  currentAnswer: string;
  /** Interim (not-yet-final) transcript from the speech recogniser */
  interimTranscript: string;

  // ── Session context ───────────────────────────────────────────────────
  resumeContext: string;
  jobDescription: string;
  selectedModel: SelectedModel;

  // ── History ───────────────────────────────────────────────────────────
  transcripts: TranscriptItem[];

  // ── Actions ───────────────────────────────────────────────────────────
  startSession: (params: {
    sessionId: string;
    resumeContext: string;
    jobDescription: string;
  }) => void;
  stopSession: () => void;

  setListening: (listening: boolean) => void;
  setListeningStatus: (status: ListeningStatus) => void;
  setProcessing: (processing: boolean) => void;

  setQuestion: (question: string) => void;
  setInterimTranscript: (text: string) => void;

  /** Called with each streamed chunk — appends to currentAnswer */
  appendAnswer: (chunk: string) => void;
  /** Replaces the full current answer (e.g. after stream completes) */
  setAnswer: (answer: string) => void;

  /** Saves the current Q&A pair to history and resets current turn */
  commitTranscript: () => void;
  addTranscript: (item: TranscriptItem) => void;

  clearCurrent: () => void;
  setSelectedModel: (model: SelectedModel) => void;
  setJobDescription: (jd: string) => void;
}

// ─── Initial state ────────────────────────────────────────────────────────

const initialState = {
  sessionId: null,
  isListening: false,
  isProcessing: false,
  listeningStatus: "idle" as ListeningStatus,
  currentQuestion: "",
  currentAnswer: "",
  interimTranscript: "",
  resumeContext: "",
  jobDescription: "",
  selectedModel: "gpt-4o" as SelectedModel,
  transcripts: [],
};

// ─── Store ────────────────────────────────────────────────────────────────

/**
 * Zustand session store — single source of truth for the live interview session.
 * All audio capture hooks and UI components read from and write to this store.
 */
export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ── Session lifecycle ──────────────────────────────────────────────

      startSession: ({ sessionId, resumeContext, jobDescription }) =>
        set(
          {
            sessionId,
            resumeContext,
            jobDescription,
            isListening: false,
            isProcessing: false,
            listeningStatus: "idle",
            currentQuestion: "",
            currentAnswer: "",
            interimTranscript: "",
            transcripts: [],
          },
          false,
          "startSession"
        ),

      stopSession: () =>
        set(
          {
            ...initialState,
          },
          false,
          "stopSession"
        ),

      // ── Status ────────────────────────────────────────────────────────

      setListening: (listening) =>
        set({ isListening: listening }, false, "setListening"),

      setListeningStatus: (status) =>
        set({ listeningStatus: status }, false, "setListeningStatus"),

      setProcessing: (processing) =>
        set({ isProcessing: processing }, false, "setProcessing"),

      // ── Transcript ────────────────────────────────────────────────────

      setQuestion: (question) =>
        set(
          { currentQuestion: question, currentAnswer: "", interimTranscript: "" },
          false,
          "setQuestion"
        ),

      setInterimTranscript: (text) =>
        set({ interimTranscript: text }, false, "setInterimTranscript"),

      appendAnswer: (chunk) =>
        set(
          (state) => ({ currentAnswer: state.currentAnswer + chunk }),
          false,
          "appendAnswer"
        ),

      setAnswer: (answer) =>
        set({ currentAnswer: answer }, false, "setAnswer"),

      commitTranscript: () => {
        const { currentQuestion, currentAnswer, transcripts } = get();
        if (!currentQuestion.trim() || !currentAnswer.trim()) return;

        const item: TranscriptItem = {
          id: crypto.randomUUID(),
          question: currentQuestion,
          answer: currentAnswer,
          timestamp: new Date(),
        };

        set(
          {
            transcripts: [item, ...transcripts],
            currentQuestion: "",
            currentAnswer: "",
            interimTranscript: "",
            isProcessing: false,
            listeningStatus: "idle",
          },
          false,
          "commitTranscript"
        );
      },

      addTranscript: (item) =>
        set(
          (state) => ({ transcripts: [item, ...state.transcripts] }),
          false,
          "addTranscript"
        ),

      clearCurrent: () =>
        set(
          {
            currentQuestion: "",
            currentAnswer: "",
            interimTranscript: "",
            isProcessing: false,
            listeningStatus: "idle",
          },
          false,
          "clearCurrent"
        ),

      // ── Config ────────────────────────────────────────────────────────

      setSelectedModel: (model) =>
        set({ selectedModel: model }, false, "setSelectedModel"),

      setJobDescription: (jd) =>
        set({ jobDescription: jd }, false, "setJobDescription"),
    }),
    { name: "whisprly-session" }
  )
);
