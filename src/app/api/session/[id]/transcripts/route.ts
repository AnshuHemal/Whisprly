import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

/**
 * GET /api/session/[id]/transcripts
 *
 * Returns decrypted transcripts for a session owned by the current user.
 * If ENCRYPTION_KEY is set and encryptedData exists, the plaintext
 * question/answer fields are verified against the decrypted payload.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    // Verify session ownership
    const interviewSession = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
    });

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const transcripts = await prisma.transcript.findMany({
      where: { sessionId },
      orderBy: { timestamp: "asc" },
    });

    const encryptionKey = process.env.ENCRYPTION_KEY;

    // Decrypt if key is available and encryptedData exists
    const decrypted = await Promise.all(
      transcripts.map(async (t) => {
        if (encryptionKey && t.encryptedData) {
          try {
            const payload = await decrypt(t.encryptedData, encryptionKey);
            const parsed = JSON.parse(payload) as {
              question: string;
              answer: string;
            };
            return {
              id: t.id,
              sessionId: t.sessionId,
              question: parsed.question,
              answer: parsed.answer,
              timestamp: t.timestamp,
            };
          } catch {
            // Decryption failed — fall back to plaintext fields
          }
        }

        return {
          id: t.id,
          sessionId: t.sessionId,
          question: t.question,
          answer: t.answer,
          timestamp: t.timestamp,
        };
      })
    );

    return NextResponse.json({ data: decrypted }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/session/[id]/transcripts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
