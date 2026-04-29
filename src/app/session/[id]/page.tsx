import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SessionShell } from "@/components/session/SessionShell";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /session/[id] — Server Component.
 *
 * Fetches the session record and the user's active resume, then hands
 * everything to the client-side SessionShell which owns all real-time state.
 */
export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const authSession = await auth();

  if (!authSession?.user?.id) {
    redirect("/login?callbackUrl=/session/" + id);
  }

  const [interviewSession, resume] = await Promise.all([
    prisma.interviewSession.findFirst({
      where: { id, userId: authSession.user.id },
      include: {
        transcripts: {
          orderBy: { timestamp: "desc" },
          take: 50,
        },
      },
    }),
    prisma.resume.findFirst({
      where: { userId: authSession.user.id, isActive: true },
    }),
  ]);

  if (!interviewSession) notFound();

  return (
    <SessionShell
      session={{
        id: interviewSession.id,
        title: interviewSession.title,
        jobTitle: interviewSession.jobTitle,
        company: interviewSession.company,
        status: interviewSession.status,
        duration: interviewSession.duration,
        createdAt: interviewSession.createdAt,
      }}
      initialTranscripts={interviewSession.transcripts.map((t) => ({
        id: t.id,
        question: t.question,
        answer: t.answer,
        timestamp: t.timestamp,
      }))}
      resumeContext={resume?.parsedText ?? ""}
      userName={authSession.user.name ?? ""}
    />
  );
}
