import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { encrypt } from "@/lib/crypto";
import { answerRequestSchema } from "@/lib/validators/session";

// ─── System prompt ────────────────────────────────────────────────────────

function buildSystemPrompt(resumeContext: string, jobDescription: string): string {
  return `You are Whisprly, a silent AI interview assistant. The user is currently in a live job interview.

Your job: provide a concise, confident, and authentic answer to the interview question below — written as if the user is speaking it naturally.

Rules:
- Max 4 sentences unless it's a technical/coding question
- Use first-person ("I have experience with...", "In my previous role...")
- Pull specific examples from the resume context provided
- Match the tone to the job description (technical vs. behavioural)
- Never mention that you are an AI
- Never start with "Certainly", "Of course", or "Great question"

Resume context: ${resumeContext || "No resume provided — give a general answer."}
Job description: ${jobDescription || "No job description provided — give a general answer."}`;
}

/**
 * POST /api/answer
 *
 * Streams a GPT-4o or Claude Sonnet answer to an interview question.
 * Uses the Vercel AI SDK for streaming — returns a ReadableStream.
 *
 * Rate limit: 20 requests per minute per user.
 *
 * After the stream completes, saves an encrypted transcript to the DB.
 *
 * Body (JSON):
 *   question       — the interview question
 *   resumeContext  — parsed resume text
 *   jobDescription — job description text
 *   model          — "gpt-4o" | "claude-sonnet"
 *   sessionId      — active session ID
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ── Rate limit: 20 req/min ───────────────────────────────────────────
    const rl = await rateLimit({
      prefix: "answer",
      identifier: userId,
      limit: 20,
      windowSeconds: 60,
    });

    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetAt - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    // ── Validate body ────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = answerRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { question, resumeContext, jobDescription, model, sessionId } = parsed.data;

    // ── Verify session belongs to user ───────────────────────────────────
    const interviewSession = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ── Build system prompt ──────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(resumeContext, jobDescription);

    // ── Select model ─────────────────────────────────────────────────────
    // Providers are imported lazily inside the handler so the module can be
    // evaluated at build time without API keys present.
    const { openai: openaiProvider } = await import("@ai-sdk/openai");
    const { anthropic: anthropicProvider } = await import("@ai-sdk/anthropic");

    const aiModel =
      model === "claude-sonnet"
        ? anthropicProvider("claude-sonnet-4-5")
        : openaiProvider("gpt-4o");

    // ── Stream response via Vercel AI SDK ────────────────────────────────
    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
      maxOutputTokens: 400,
      temperature: 0.7,
      onFinish: async ({ text }) => {
        // Save encrypted transcript to DB after stream completes
        try {
          const encryptionKey = process.env.ENCRYPTION_KEY;
          let encryptedData: string | null = null;

          if (encryptionKey) {
            const payload = JSON.stringify({ question, answer: text });
            encryptedData = await encrypt(payload, encryptionKey);
          }

          await prisma.transcript.create({
            data: {
              sessionId,
              question,
              answer: text,
              encryptedData,
            },
          });

          // Update session duration (rough estimate: +30s per Q&A)
          await prisma.interviewSession.update({
            where: { id: sessionId },
            data: { duration: { increment: 30 } },
          });
        } catch (dbError) {
          // Don't fail the stream if DB write fails — log and continue
          console.error("[POST /api/answer] DB write error:", dbError);
        }
      },
    });

    // Return the Vercel AI SDK data stream response
    return result.toTextStreamResponse({
      headers: {
        "X-RateLimit-Remaining": String(rl.remaining),
      },
    });
  } catch (error) {
    console.error("[POST /api/answer]", error);
    return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
  }
}
