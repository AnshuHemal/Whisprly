import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/transcribe
 *
 * Accepts a multipart/form-data audio blob and transcribes it using
 * OpenAI Whisper (whisper-1). Used as the fallback when the Web Speech
 * API is unavailable in the user's browser.
 *
 * Rate limit: 10 requests per minute per user.
 *
 * Body (multipart/form-data):
 *   audio    — audio blob (webm/opus, mp4, wav, etc.)
 *   sessionId — the active session ID (for rate limit keying)
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ── Rate limit: 10 req/min ───────────────────────────────────────────
    const rl = await rateLimit({
      prefix: "transcribe",
      identifier: userId,
      limit: 10,
      windowSeconds: 60,
    });

    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many transcription requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetAt - Math.floor(Date.now() / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // ── Parse form data ──────────────────────────────────────────────────
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (audioFile.size < 100) {
      return NextResponse.json({ error: "Audio file is too short" }, { status: 400 });
    }

    // Max 25MB (Whisper API limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file exceeds 25MB limit" }, { status: 400 });
    }

    // ── Transcribe with Whisper ──────────────────────────────────────────
    // The OpenAI SDK expects a File object — we pass it directly
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "text",
    });

    // whisper-1 with response_format: "text" returns a plain string
    const text = typeof transcription === "string" ? transcription : "";

    return NextResponse.json(
      { data: { text: text.trim() } },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  } catch (error) {
    console.error("[POST /api/transcribe]", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
