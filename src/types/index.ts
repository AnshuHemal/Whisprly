/**
 * Shared TypeScript interfaces for Whisprly.ai
 * These mirror the Prisma schema and are used across client and server code.
 */

// ─── User ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Session ──────────────────────────────────────────────────────────────

export type SessionStatus = "ACTIVE" | "PAUSED" | "ENDED";

export interface InterviewSession {
  id: string;
  userId: string;
  title: string | null;
  jobTitle: string | null;
  company: string | null;
  duration: number; // seconds
  status: SessionStatus;
  createdAt: Date;
  endedAt: Date | null;
  transcripts?: Transcript[];
}

// ─── Transcript ───────────────────────────────────────────────────────────

export interface Transcript {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  encryptedData: string | null;
  timestamp: Date;
}

/** A transcript item as used in the Zustand session store (client-side) */
export interface TranscriptItem {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

// ─── Resume ───────────────────────────────────────────────────────────────

export interface ResumeData {
  id: string;
  userId: string;
  fileName: string;
  storageUrl: string;
  parsedText: string;
  isActive: boolean;
  uploadedAt: Date;
}

// ─── API Response shapes ──────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

// ─── Session store types ──────────────────────────────────────────────────

export type SelectedModel = "gpt-4o" | "claude-sonnet";

export type ListeningStatus =
  | "idle"
  | "listening"
  | "processing"
  | "ready"
  | "error";
