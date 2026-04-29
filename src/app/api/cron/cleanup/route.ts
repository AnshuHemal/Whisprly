import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/cleanup
 *
 * Deletes transcripts from sessions that ended more than 30 days ago.
 * Implements the zero data retention policy — transcript data is not
 * kept indefinitely.
 *
 * This route is designed to be called by a Vercel Cron Job (vercel.json)
 * or any external scheduler (e.g. GitHub Actions, Upstash QStash).
 *
 * Security: protected by a CRON_SECRET header check so it cannot be
 * triggered by arbitrary HTTP requests.
 *
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }]
 * }
 */
export async function GET(req: NextRequest) {
  // ── Auth: verify cron secret ─────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    // Find sessions that ended more than 30 days ago
    const staleSessions = await prisma.interviewSession.findMany({
      where: {
        status: "ENDED",
        endedAt: { lt: cutoffDate },
      },
      select: { id: true },
    });

    if (staleSessions.length === 0) {
      return NextResponse.json({
        data: { deleted: 0, message: "No stale transcripts found" },
      });
    }

    const staleIds = staleSessions.map((s) => s.id);

    // Delete transcripts in batches to avoid large single transactions
    const BATCH_SIZE = 100;
    let totalDeleted = 0;

    for (let i = 0; i < staleIds.length; i += BATCH_SIZE) {
      const batch = staleIds.slice(i, i + BATCH_SIZE);
      const result = await prisma.transcript.deleteMany({
        where: { sessionId: { in: batch } },
      });
      totalDeleted += result.count;
    }

    console.log(
      `[cron/cleanup] Deleted ${totalDeleted} transcripts from ${staleSessions.length} sessions`
    );

    return NextResponse.json({
      data: {
        deleted: totalDeleted,
        sessionsProcessed: staleSessions.length,
        cutoffDate: cutoffDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("[GET /api/cron/cleanup]", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
