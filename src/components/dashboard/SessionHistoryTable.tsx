"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  MoreHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/types";

interface SessionRow {
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

interface SessionHistoryTableProps {
  sessions: SessionRow[];
  page: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0",
  },
  PAUSED: {
    label: "Paused",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0",
  },
  ENDED: {
    label: "Ended",
    className: "bg-muted text-muted-foreground border-0",
  },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * SessionHistoryTable — paginated table of all past interview sessions.
 * Handles client-side delete with optimistic UI.
 */
export function SessionHistoryTable({
  sessions: initialSessions,
  page,
  totalPages,
}: SessionHistoryTableProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/session?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to delete");
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Session deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-center gap-3">
        <p className="text-sm font-medium text-muted-foreground">No sessions found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Session</span>
          <span className="text-right">Duration</span>
          <span className="text-right">Q&amp;A</span>
          <span className="text-right">Date</span>
          <span className="text-right">Status</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {sessions.map((session) => {
            const title = session.title ?? session.jobTitle ?? "Untitled session";
            const statusConfig = STATUS_CONFIG[session.status];

            return (
              <div
                key={session.id}
                className="group grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3 items-center hover:bg-accent/30 transition-colors"
              >
                {/* Title + company */}
                <div className="min-w-0">
                  <Link
                    href={`/session/${session.id}`}
                    className="text-sm font-medium text-foreground hover:text-indigo transition-colors truncate block"
                  >
                    {title}
                  </Link>
                  {session.company && (
                    <p className="text-xs text-muted-foreground truncate">
                      {session.company}
                    </p>
                  )}
                  {/* Mobile meta */}
                  <div className="flex items-center gap-3 mt-1 sm:hidden flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(session.duration)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {session.transcriptCount} Q&amp;A
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", statusConfig.className)}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                {/* Duration */}
                <span className="hidden sm:block text-xs text-muted-foreground text-right tabular-nums">
                  {formatDuration(session.duration)}
                </span>

                {/* Q&A count */}
                <span className="hidden sm:block text-xs text-muted-foreground text-right tabular-nums">
                  {session.transcriptCount}
                </span>

                {/* Date */}
                <span className="hidden sm:block text-xs text-muted-foreground text-right whitespace-nowrap">
                  {formatDate(session.createdAt)}
                </span>

                {/* Status + actions */}
                <div className="hidden sm:flex items-center justify-end gap-2">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", statusConfig.className)}
                  >
                    {statusConfig.label}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Session options"
                        />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => router.push(`/session/${session.id}`)}
                        className="cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open session
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleDelete(session.id)}
                        disabled={deletingId === session.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === session.id ? "Deleting…" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() =>
                router.push(`/dashboard/history?page=${page - 1}`)
              }
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() =>
                router.push(`/dashboard/history?page=${page + 1}`)
              }
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
