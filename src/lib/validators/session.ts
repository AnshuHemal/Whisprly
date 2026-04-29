import { z } from "zod";

/** Schema for creating a new interview session */
export const createSessionSchema = z.object({
  title: z.string().max(120).optional(),
  jobTitle: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  jobDescription: z.string().max(5000).optional(),
  resumeId: z.string().cuid().optional(),
});

/** Schema for updating an existing session */
export const updateSessionSchema = z.object({
  title: z.string().max(120).optional(),
  jobTitle: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ENDED"]).optional(),
  duration: z.number().int().nonnegative().optional(),
});

/** Schema for the answer generation request */
export const answerRequestSchema = z.object({
  question: z.string().min(1).max(2000),
  resumeContext: z.string().max(10000).optional().default(""),
  jobDescription: z.string().max(5000).optional().default(""),
  model: z.enum(["gpt-4o", "claude-sonnet"]).default("gpt-4o"),
  sessionId: z.string().cuid(),
});

/** Schema for the transcription request */
export const transcribeRequestSchema = z.object({
  sessionId: z.string().cuid(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type AnswerRequestInput = z.infer<typeof answerRequestSchema>;
export type TranscribeRequestInput = z.infer<typeof transcribeRequestSchema>;
