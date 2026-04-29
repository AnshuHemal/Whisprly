import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SessionHistoryTable } from "@/components/dashboard/SessionHistoryTable";

export const metadata = {
  title: "Session History — Whisprly.ai",
};

interface HistoryPageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 15;

/**
 * /dashboard/history — paginated table of all past interview sessions.
 */
export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const [sessions, total] = await Promise.all([
    prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
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
    }),
    prisma.interviewSession.count({
      where: { userId: session.user.id },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Session history</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} session{total !== 1 ? "s" : ""} total
        </p>
      </div>

      <SessionHistoryTable
        sessions={sessions.map((s) => ({
          id: s.id,
          title: s.title,
          jobTitle: s.jobTitle,
          company: s.company,
          duration: s.duration,
          status: s.status as "ACTIVE" | "PAUSED" | "ENDED",
          createdAt: s.createdAt,
          endedAt: s.endedAt,
          transcriptCount: s._count.transcripts,
        }))}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
