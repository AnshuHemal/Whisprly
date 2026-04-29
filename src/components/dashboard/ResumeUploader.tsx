"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { clientResumeSchema, MAX_RESUME_SIZE } from "@/lib/validators/resume";
import type { ResumeData } from "@/types";

interface ResumeUploaderProps {
  /** Currently active resume, if any */
  currentResume?: ResumeData | null;
  /** Called after a successful upload with the new resume data */
  onUploadSuccess?: (resume: ResumeData) => void;
  /** Called after the resume is removed */
  onRemove?: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

/**
 * ResumeUploader — drag-and-drop + click-to-upload PDF resume component.
 *
 * Features:
 * - Drag-and-drop zone with visual feedback
 * - Client-side file type + size validation (Zod)
 * - Upload progress indicator
 * - Shows active resume with replace / remove options
 * - Sonner toasts for success and error states
 */
export function ResumeUploader({
  currentResume,
  onUploadSuccess,
  onRemove,
}: ResumeUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(
    currentResume ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File validation ────────────────────────────────────────────────────

  function validateFile(file: File): string | null {
    const result = clientResumeSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Invalid file";
    }
    return null;
  }

  // ── Upload handler ─────────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setUploadState("uploading");
      setProgress(0);

      // Simulate progress ticks while the real upload runs
      const progressInterval = setInterval(() => {
        setProgress((p) => (p < 85 ? p + Math.random() * 12 : p));
      }, 300);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/resume", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? "Upload failed");
        }

        const resume: ResumeData = json.data;
        setActiveResume(resume);
        setUploadState("success");
        onUploadSuccess?.(resume);
        toast.success("Resume uploaded successfully", {
          description: `${file.name} is now your active resume.`,
        });
      } catch (err) {
        clearInterval(progressInterval);
        setUploadState("error");
        const message = err instanceof Error ? err.message : "Upload failed";
        toast.error("Upload failed", { description: message });
      } finally {
        // Reset to idle after a short delay so the user sees the result
        setTimeout(() => {
          setUploadState("idle");
          setProgress(0);
        }, 1500);
      }
    },
    [onUploadSuccess]
  );

  // ── Remove handler ─────────────────────────────────────────────────────

  async function handleRemove() {
    if (!activeResume) return;

    try {
      const res = await fetch(`/api/resume?id=${activeResume.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to remove resume");
      }

      setActiveResume(null);
      onRemove?.();
      toast.success("Resume removed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove";
      toast.error(message);
    }
  }

  // ── Drag-and-drop handlers ─────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  const isUploading = uploadState === "uploading";

  // ── Active resume display ──────────────────────────────────────────────

  if (activeResume && uploadState === "idle") {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          {/* File icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo/10">
            <FileText className="h-5 w-5 text-indigo" aria-hidden="true" />
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-foreground truncate">
                {activeResume.fileName}
              </p>
              <Badge
                variant="secondary"
                className="text-xs bg-indigo/10 text-indigo border-0 shrink-0"
              >
                Active
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Uploaded {new Date(activeResume.uploadedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Replace resume"
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              aria-label="Remove resume"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hidden file input for replace */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Replace resume file"
        />
      </div>
    );
  }

  // ── Upload zone ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume PDF — click or drag and drop"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isUploading) {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging
            ? "border-indigo bg-indigo/5 scale-[1.01]"
            : "border-border hover:border-indigo/50 hover:bg-muted/40",
          isUploading && "pointer-events-none opacity-70"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
            uploadState === "success"
              ? "bg-green-100 dark:bg-green-900/30"
              : uploadState === "error"
                ? "bg-destructive/10"
                : "bg-muted"
          )}
        >
          {uploadState === "success" ? (
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          ) : uploadState === "error" ? (
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
          ) : (
            <Upload
              className={cn(
                "h-6 w-6 transition-colors",
                isDragging ? "text-indigo" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Text */}
        <div>
          <p className="text-sm font-medium text-foreground">
            {isUploading
              ? "Uploading…"
              : uploadState === "success"
                ? "Upload complete"
                : uploadState === "error"
                  ? "Upload failed — try again"
                  : isDragging
                    ? "Drop your resume here"
                    : "Drop your resume here, or click to browse"}
          </p>
          {!isUploading && uploadState === "idle" && (
            <p className="mt-1 text-xs text-muted-foreground">
              PDF only · Max {Math.round(MAX_RESUME_SIZE / 1024 / 1024)}MB
            </p>
          )}
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div className="w-full max-w-xs">
            <Progress value={progress} className="h-1.5" />
            <p className="mt-1.5 text-xs text-muted-foreground text-center">
              {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload resume PDF"
      />
    </div>
  );
}
