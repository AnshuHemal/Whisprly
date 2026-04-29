"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { SessionTimer } from "@/components/session/SessionTimer";
import { AnswerPanel } from "@/components/session/AnswerPanel";
import { TranscriptFeed } from "@/components/session/TranscriptFeed";
import { ModelSelector } from "@/components/session/ModelSelector";
import { ListeningIndicator } from "@/components/session/ListeningIndicator";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PhoneOff, X, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/types";

interface SessionOverlayProps {
  session: {
    id: string;
    title: string | null;
    jobTitle: string | null;
    company: string | null;
    status: SessionStatus;
    duration: number;
    createdAt: Date;
  };
  userName: string;
  isListening: boolean;
  isSpeechSupported: boolean;
  isElectron?: boolean;
  onToggleListening: () => void;
  onEndSession: () => void;
  onCancelStream: () => void;
  onJobDescriptionChange: (jd: string) => void;
  onLaunchOverlay?: () => void;
}

/**
 * SessionOverlay — the full-screen dark UI the user sees during their interview.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────┐
 *  │  Top bar: logo · title · timer · model · end btn    │
 *  ├─────────────────────────────────────────────────────┤
 *  │  Main: AnswerPanel (streaming answer)               │
 *  ├─────────────────────────────────────────────────────┤
 *  │  Bottom: ListeningIndicator · mic toggle            │
 *  ├─────────────────────────────────────────────────────┤
 *  │  Collapsible: TranscriptFeed (Q&A history)          │
 *  └─────────────────────────────────────────────────────┘
 */
export function SessionOverlay({
  session,
  isListening,
  isSpeechSupported,
  isElectron = false,
  onToggleListening,
  onEndSession,
  onCancelStream,
  onJobDescriptionChange,
  onLaunchOverlay,
}: SessionOverlayProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);
  const [jobDescInput, setJobDescInput] = useState("");

  const { isProcessing, listeningStatus } = useSessionStore();

  function handleJdSave() {
    onJobDescriptionChange(jobDescInput);
    setJdOpen(false);
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f1a] text-white overflow-hidden select-none">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0">
        {/* Left: logo + session info */}
        <div className="flex items-center gap-3 min-w-0">
          <Logo variant="icon" href="/dashboard" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">
              {session.title ?? session.jobTitle ?? "Interview Session"}
            </p>
            {session.company && (
              <p className="text-xs text-white/40 truncate leading-tight">{session.company}</p>
            )}
          </div>
        </div>

        {/* Centre: timer */}
        <SessionTimer startedAt={session.createdAt} initialDuration={session.duration} />

        {/* Right: model selector + settings + end */}
        <div className="flex items-center gap-2 shrink-0">
          <ModelSelector />

          {/* Overlay launch — only shown in Electron */}
          {isElectron && onLaunchOverlay && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-indigo-light hover:text-white hover:bg-indigo/20"
                    onClick={onLaunchOverlay}
                    aria-label="Pop out as overlay"
                  />
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M9 3v18M3 9h6"/>
                </svg>
                Overlay
              </TooltipTrigger>
              <TooltipContent side="bottom">Pop out as transparent overlay</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/8"
                  onClick={() => setJdOpen((o) => !o)}
                  aria-label="Set job description"
                />
              }
            >
              <Settings2 className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Job description</TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-medium"
            onClick={onEndSession}
            aria-label="End session"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            End
          </Button>
        </div>
      </header>

      {/* ── Job description drawer ────────────────────────────────────── */}
      {jdOpen && (
        <div className="px-5 py-3 border-b border-white/8 bg-white/3 shrink-0">
          <p className="text-xs text-white/50 mb-2">
            Paste the job description to get more targeted answers
          </p>
          <textarea
            className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-indigo/60"
            placeholder="Senior Software Engineer at Acme Corp…"
            value={jobDescInput}
            onChange={(e) => setJobDescInput(e.target.value)}
            aria-label="Job description"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-white/50"
              onClick={() => setJdOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs bg-indigo hover:bg-indigo-dark text-white"
              onClick={handleJdSave}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* ── Main answer area ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <AnswerPanel onCancelStream={onCancelStream} />
      </main>

      {/* ── Bottom bar: listening controls ───────────────────────────── */}
      <footer className="shrink-0 border-t border-white/8 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Listening indicator + interim transcript */}
          <ListeningIndicator
            isListening={isListening}
            isProcessing={isProcessing}
            listeningStatus={listeningStatus}
            isSpeechSupported={isSpeechSupported}
          />

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Keyboard hint */}
            <span className="hidden sm:block text-xs text-white/25 font-mono">
              Space
            </span>

            {/* Mic toggle */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={onToggleListening}
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                    aria-pressed={isListening}
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]",
                      isListening
                        ? "bg-indigo shadow-lg shadow-indigo/40 scale-105"
                        : "bg-white/10 hover:bg-white/15"
                    )}
                  />
                }
              >
                {/* Pulse ring when listening */}
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-indigo/40 animate-ping" />
                )}
                <MicIcon active={isListening} />
              </TooltipTrigger>
              <TooltipContent side="top">
                {isListening ? "Stop listening (Space)" : "Start listening (Space)"}
              </TooltipContent>
            </Tooltip>

            {/* History toggle */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/8"
                    onClick={() => setHistoryOpen((o) => !o)}
                    aria-label={historyOpen ? "Hide history" : "Show history"}
                    aria-expanded={historyOpen}
                  />
                }
              >
                {historyOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </TooltipTrigger>
              <TooltipContent side="top">
                {historyOpen ? "Hide history" : "Show history"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </footer>

      {/* ── Collapsible transcript history ───────────────────────────── */}
      <div
        className={cn(
          "shrink-0 border-t border-white/8 transition-all duration-300 overflow-hidden",
          historyOpen ? "max-h-72" : "max-h-0"
        )}
        aria-hidden={!historyOpen}
      >
        <div className="flex items-center justify-between px-5 py-2 border-b border-white/5">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Session history
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/30 hover:text-white"
            onClick={() => setHistoryOpen(false)}
            aria-label="Close history"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <TranscriptFeed sessionId={session.id} />
      </div>
    </div>
  );
}

// ─── Mic icon ─────────────────────────────────────────────────────────────

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("relative z-10 transition-colors", active ? "text-white" : "text-white/60")}
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
