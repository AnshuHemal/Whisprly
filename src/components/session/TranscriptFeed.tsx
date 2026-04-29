"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TranscriptItem } from "@/types";

interface TranscriptFeedProps {
  sessionId: string;
}

/**
 * TranscriptFeed — scrollable list of past Q&A pairs in this session.
 *
 * Features:
 * - Expandable individual items
 * - Export session as .txt file
 * - Timestamps
 */
export function TranscriptFeed({ sessionId }: TranscriptFeedProps) {
  const { transcripts } = useSessionStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleExport() {
    if (transcripts.length === 0) {
      toast.info("No transcripts to export yet.");
      return;
    }

    const lines: string[] = [
      `Whisprly Session Export`,
      `Session ID: ${sessionId}`,
      `Exported: ${new Date().toLocaleString()}`,
      `${"─".repeat(60)}`,
      "",
    ];

    // Transcripts are stored newest-first — reverse for chronological export
    [...transcripts].reverse().forEach((t, i) => {
      lines.push(`Q${i + 1}: ${t.question}`);
      lines.push(`A${i + 1}: ${t.answer}`);
      lines.push(`Time: ${new Date(t.timestamp).toLocaleTimeString()}`);
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whisprly-session-${sessionId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Session exported");
  }

  if (transcripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-xs text-white/25">
        No Q&A pairs yet — answers will appear here as you go
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Export button */}
      <div className="flex justify-end px-5 py-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-white/40 hover:text-white hover:bg-white/8"
          onClick={handleExport}
          aria-label="Export session transcript"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Transcript list */}
      <ScrollArea className="flex-1 px-5 pb-3">
        <div className="flex flex-col gap-2">
          {transcripts.map((item) => (
            <TranscriptCard
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={() => toggleExpand(item.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Individual transcript card ────────────────────────────────────────────

function TranscriptCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: TranscriptItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const preview = item.answer.slice(0, 120) + (item.answer.length > 120 ? "…" : "");

  return (
    <div className="rounded-lg border border-white/8 bg-white/3 overflow-hidden">
      <button
        className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-white/4 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo/60"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0">
          {/* Question */}
          <p className="text-xs font-medium text-white/50 truncate">
            Q: {item.question}
          </p>
          {/* Answer preview */}
          <p
            className={cn(
              "text-xs text-white/30 mt-0.5 leading-relaxed",
              !isExpanded && "line-clamp-1"
            )}
          >
            {isExpanded ? item.answer : preview}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <span className="text-[10px] text-white/20 font-mono">
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 text-white/30" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3 text-white/30" aria-hidden="true" />
          )}
        </div>
      </button>
    </div>
  );
}
