"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ResumeData } from "@/types";

interface UseResumeReturn {
  resume: ResumeData | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  setResume: (resume: ResumeData | null) => void;
}

/**
 * useResume — fetches the current user's active resume from /api/resume.
 * Used by the dashboard and session start flow to get resume context.
 */
export function useResume(): UseResumeReturn {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResume = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to fetch resume");
      const json = await res.json();
      setResume(json.data ?? null);
    } catch {
      toast.error("Could not load your resume");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  return { resume, isLoading, refetch: fetchResume, setResume };
}
