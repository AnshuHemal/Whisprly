import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export const metadata = {
  title: "Dashboard — Whisprly.ai",
};

/**
 * /dashboard — Server Component.
 * Fetches the user's recent sessions and active resume, then renders
 * the client DashboardHome component.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [recentSessions, activeResume] = await Promise.all([
    prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
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
    prisma.resume.findFirst({
      where: { userId: session.user.id, isActive: true },
      select: {
        id: true,
        fileName: true,
        storageUrl: true,
        parsedText: true,
        isActive: true,
        uploadedAt: true,
        userId: true,
      },
    }),
  ]);

  return (
    <DashboardHome
      user={{
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
      recentSessions={recentSessions.map((s) => ({
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
      activeResume={activeResume}
    />
  );
}
