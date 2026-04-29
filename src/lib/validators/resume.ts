import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["application/pdf"];

/** Schema for resume upload validation (server-side) */
export const resumeUploadSchema = z.object({
  fileName: z
    .string()
    .min(1)
    .max(255)
    .refine((name) => name.toLowerCase().endsWith(".pdf"), {
      message: "Only PDF files are accepted",
    }),
  fileSize: z
    .number()
    .positive()
    .max(MAX_FILE_SIZE, { message: "File must be smaller than 5MB" }),
  mimeType: z
    .string()
    .refine((t) => ACCEPTED_TYPES.includes(t), {
      message: "Only PDF files are accepted",
    }),
});

/** Schema for client-side file validation */
export const clientResumeSchema = z.object({
  name: z
    .string()
    .refine((name) => name.toLowerCase().endsWith(".pdf"), {
      message: "Only PDF files are accepted",
    }),
  size: z
    .number()
    .max(MAX_FILE_SIZE, { message: "File must be smaller than 5MB" }),
  type: z.string().refine((t) => ACCEPTED_TYPES.includes(t), {
    message: "Only PDF files are accepted",
  }),
});

export const MAX_RESUME_SIZE = MAX_FILE_SIZE;
export const ACCEPTED_MIME_TYPES = ACCEPTED_TYPES;

export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>;
