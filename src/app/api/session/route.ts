import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSessionSchema, updateSessionSchema } from "@/lib/validators/session";
import { sanitizeOptional } from "@/lib/sanitize";

// ─── GET — list sessions for the current user ─────────────────────────────

/**
 * GET /api/session?limit=10&cursor=<id>
 * Returns paginated interview sessions for the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);
    const cursor = searchParams.get("cursor") ?? undefined;

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // fetch one extra to determine if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        jobTitle: true,
        company: true,
        duration: true,
        status: true,
        createdAt: true,
        endedAt: true,
        _count: { select: { transcripts: true } },
      },
    });

    const hasNextPage = sessions.length > limit;
    const items = hasNextPage ? sessions.slice(0, -1) : sessions;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    return NextResponse.json({ data: { items, nextCursor } }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/session]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST — create a new session ─────────────────────────────────────────

/**
 * POST /api/session
 * Creates a new interview session and returns it.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { title, jobTitle, company } = parsed.data;

    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        title: sanitizeOptional(title) ?? null,
        jobTitle: sanitizeOptional(jobTitle) ?? null,
        company: sanitizeOptional(company) ?? null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ data: interviewSession }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/session]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH — update a session ─────────────────────────────────────────────

/**
 * PATCH /api/session?id=<sessionId>
 * Updates session metadata or status (e.g. mark as ENDED).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { status, duration, title, jobTitle, company } = parsed.data;

    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        ...(title !== undefined && { title: sanitizeOptional(title) ?? null }),
        ...(jobTitle !== undefined && { jobTitle: sanitizeOptional(jobTitle) ?? null }),
        ...(company !== undefined && { company: sanitizeOptional(company) ?? null }),
        ...(duration !== undefined && { duration }),
        ...(status !== undefined && {
          status,
          ...(status === "ENDED" && { endedAt: new Date() }),
        }),
      },
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/session]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE — delete a session ────────────────────────────────────────────

/**
 * DELETE /api/session?id=<sessionId>
 * Hard-deletes a session and all its transcripts (cascade).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const existing = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.interviewSession.delete({ where: { id: sessionId } });

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/session]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
