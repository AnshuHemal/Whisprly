"use client";

import { useEffect, useState } from "react";

interface SessionTimerProps {
  startedAt: Date;
  /** Initial duration in seconds (from DB, for resumed sessions) */
  initialDuration?: number;
}

/**
 * SessionTimer — live elapsed time display.
 * Ticks every second. Initialised from `initialDuration` so resumed
 * sessions show the correct accumulated time.
 */
export function SessionTimer({ startedAt, initialDuration = 0 }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(() => {
    const sinceStart = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return initialDuration + sinceStart;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const sinceStart = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      setElapsed(initialDuration + sinceStart);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, initialDuration]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const display = hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <time
      dateTime={`PT${elapsed}S`}
      className="font-mono text-sm text-white/40 tabular-nums"
      aria-label={`Session duration: ${display}`}
    >
      {display}
    </time>
  );
}
