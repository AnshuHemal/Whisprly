"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResumeUploader } from "@/components/dashboard/ResumeUploader";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { NewSessionDialog } from "@/components/dashboard/NewSessionDialog";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowRight, Mic } from "lucide-react";
import type { ResumeData, SessionStatus } from "@/types";

interface SessionSummary {
  id: string;
  title: string | null;
  jobTitle: string | null;
  company: string | null;
  duration: number;
  status: SessionStatus;
  createdAt: Date;
  endedAt: Date | null;
  transcriptCount: number;
}

interface DashboardHomeProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  recentSessions: SessionSummary[];
  activeResume: ResumeData | null;
}

/**
 * DashboardHome — the user's home base.
 *
 * Sections:
 *  1. Welcome header + "Start session" CTA
 *  2. Active resume (with uploader)
 *  3. Recent sessions (last 5)
 */
export function DashboardHome({
  user,
  recentSessions: initialSessions,
  activeResume: initialResume,
}: DashboardHomeProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [resume, setResume] = useState<ResumeData | null>(initialResume);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Create session ─────────────────────────────────────────────────────

  async function handleCreateSession(params: {
    title?: string;
    jobTitle?: string;
    company?: string;
  }) {
    setIsCreating(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create session");

      router.push(`/session/${json.data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setIsCreating(false);
    }
  }

  // ── Quick start (no dialog) ────────────────────────────────────────────

  async function handleQuickStart() {
    await handleCreateSession({});
  }

  return (
    <div className="flex flex-col gap-10">

      {/* ── Welcome + CTA ──────────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ready for your next interview? Let&apos;s go.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setDialogOpen(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New session
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-indigo hover:bg-indigo-dark text-white"
            onClick={handleQuickStart}
            disabled={isCreating}
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            {isCreating ? "Starting…" : "Quick start"}
          </Button>
        </div>
      </section>

      {/* ── Resume section ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Your resume</h2>
          {resume && (
            <span className="text-xs text-muted-foreground">
              Used as context in every session
            </span>
          )}
        </div>

        <ResumeUploader
          currentResume={resume}
          onUploadSuccess={(r) => setResume(r)}
          onRemove={() => setResume(null)}
        />

        {!resume && (
          <p className="text-xs text-muted-foreground">
            Upload your resume so Whisprly can tailor answers to your experience.
          </p>
        )}
      </section>

      <Separator />

      {/* ── Recent sessions ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent sessions</h2>
          {sessions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/dashboard/history")}
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          <EmptySessionsState onStart={handleQuickStart} isCreating={isCreating} />
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onResume={() => router.push(`/session/${s.id}`)}
                onDelete={(id) =>
                  setSessions((prev) => prev.filter((s) => s.id !== id))
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* ── New session dialog ─────────────────────────────────────────── */}
      <NewSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateSession}
        isLoading={isCreating}
      />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────

function EmptySessionsState({
  onStart,
  isCreating,
}: {
  onStart: () => void;
  isCreating: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-xl border border-dashed border-border text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Mic className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No sessions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start your first session to see it here
        </p>
      </div>
      <Button
        size="sm"
        className="bg-indigo hover:bg-indigo-dark text-white gap-1.5"
        onClick={onStart}
        disabled={isCreating}
      >
        <Mic className="h-4 w-4" aria-hidden="true" />
        {isCreating ? "Starting…" : "Start first session"}
      </Button>
    </div>
  );
}
