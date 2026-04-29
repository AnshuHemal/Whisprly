"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Play,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Clock,
  MessageSquare,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/types";

interface SessionCardProps {
  session: {
    id: string;
    title: string | null;
    jobTitle: string | null;
    company: string | null;
    duration: number;
    status: SessionStatus;
    createdAt: Date;
    endedAt: Date | null;
    transcriptCount: number;
  };
  onResume?: () => void;
  onDelete?: (id: string) => void;
}

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; className: string }
> = {
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

/**
 * SessionCard — displays a single interview session summary.
 * Shows title, company, duration, Q&A count, status badge, and actions.
 */
export function SessionCard({ session, onResume, onDelete }: SessionCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = STATUS_CONFIG[session.status];
  const title =
    session.title ?? session.jobTitle ?? "Untitled session";

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year:
        new Date(date).getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/session?id=${session.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to delete");
      }
      toast.success("Session deleted");
      onDelete?.(session.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete session");
      setIsDeleting(false);
    }
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors",
        "hover:border-indigo/30 hover:bg-accent/30"
      )}
    >
      {/* Status dot */}
      <div className="mt-1 shrink-0">
        <span
          className={cn(
            "flex h-2 w-2 rounded-full",
            session.status === "ACTIVE"
              ? "bg-green-500 animate-pulse"
              : session.status === "PAUSED"
                ? "bg-amber-500"
                : "bg-muted-foreground/40"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{title}</p>
            {session.company && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                {session.company}
              </p>
            )}
          </div>
          <Badge variant="secondary" className={cn("shrink-0 text-xs", statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatDuration(session.duration)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" aria-hidden="true" />
            {session.transcriptCount} Q&amp;A
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(session.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {session.status !== "ENDED" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-indigo hover:bg-indigo/10"
            onClick={onResume}
            aria-label="Resume session"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Session options"
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => router.push(`/session/${session.id}`)}
              className="cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
              Open session
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
              {isDeleting ? "Deleting…" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
