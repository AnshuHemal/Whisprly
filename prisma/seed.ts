/**
 * Whisprly.ai — Database Seed
 *
 * Creates a test user with a sample resume and two interview sessions
 * (one active, one ended) so the dashboard and session history pages
 * have real data to render during development.
 *
 * Run with: npm run db:seed
 */

import { PrismaClient, SessionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Whisprly database...\n");

  // ─── Clean up existing seed data ────────────────────────────────────────
  await prisma.transcript.deleteMany({});
  await prisma.resume.deleteMany({});
  await prisma.interviewSession.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({ where: { email: "dev@whisprly.ai" } });

  // ─── Test User ───────────────────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      email: "dev@whisprly.ai",
      name: "Dev User",
      emailVerified: new Date(),
      image: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  });
  console.log(`✅ Created user: ${user.email} (${user.id})`);

  // ─── Resume ──────────────────────────────────────────────────────────────
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: "dev-resume.pdf",
      storageUrl: "https://placeholder.supabase.co/storage/v1/object/public/resumes/dev-resume.pdf",
      isActive: true,
      parsedText: `
John Dev
Senior Software Engineer
john.dev@email.com | github.com/johndev | linkedin.com/in/johndev

EXPERIENCE

Senior Software Engineer — Acme Corp (2021–Present)
• Led migration of monolithic Node.js API to microservices, reducing p99 latency by 40%
• Architected real-time notification system using WebSockets serving 500k concurrent users
• Mentored team of 4 junior engineers; introduced code review standards and CI/CD pipelines
• Stack: TypeScript, Next.js, PostgreSQL, Redis, AWS (ECS, RDS, ElastiCache)

Software Engineer — StartupXYZ (2019–2021)
• Built customer-facing React dashboard from scratch, increasing user engagement by 35%
• Designed and implemented REST API with Express.js and PostgreSQL
• Reduced cloud infrastructure costs by 28% through query optimisation and caching strategies
• Stack: React, Node.js, Express, PostgreSQL, Docker

EDUCATION
B.Sc. Computer Science — University of Technology (2015–2019)

SKILLS
Languages: TypeScript, JavaScript, Python, SQL
Frameworks: Next.js, React, Node.js, Express, Prisma
Infrastructure: AWS, Docker, Kubernetes, Vercel, Supabase
Tools: Git, GitHub Actions, Datadog, Linear
      `.trim(),
    },
  });
  console.log(`✅ Created resume: ${resume.fileName} (${resume.id})`);

  // ─── Ended Interview Session ─────────────────────────────────────────────
  const endedSession = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      title: "Frontend Engineer Interview",
      jobTitle: "Senior Frontend Engineer",
      company: "Vercel",
      status: SessionStatus.ENDED,
      duration: 2847, // ~47 minutes
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2847 * 1000),
    },
  });
  console.log(`✅ Created ended session: ${endedSession.title} (${endedSession.id})`);

  // Transcripts for ended session
  const transcripts = await prisma.transcript.createMany({
    data: [
      {
        sessionId: endedSession.id,
        question: "Tell me about yourself and your background in frontend development.",
        answer:
          "I'm a senior software engineer with over 5 years of experience building scalable web applications. At Acme Corp, I led the migration of our frontend from a legacy jQuery codebase to a modern Next.js architecture, which improved our Lighthouse performance scores from 42 to 94. I'm particularly passionate about developer experience and building systems that scale — both technically and in terms of team productivity.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      },
      {
        sessionId: endedSession.id,
        question: "How do you approach performance optimisation in a React application?",
        answer:
          "I start by measuring before optimising — I use React DevTools Profiler and Lighthouse to identify actual bottlenecks rather than guessing. The most common wins I've found are code splitting with dynamic imports, memoising expensive computations with useMemo, and avoiding unnecessary re-renders by keeping state as local as possible. At Acme, I reduced our initial bundle size by 60% by auditing our dependencies and implementing route-based code splitting.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      },
      {
        sessionId: endedSession.id,
        question: "Describe a time you had to make a difficult technical decision under pressure.",
        answer:
          "During a major product launch at Acme, our WebSocket server started dropping connections under load — about 2 hours before go-live. I had to decide between a quick patch that carried risk or rolling back to polling. I chose a targeted fix: I identified a connection leak in our cleanup logic, deployed a hotfix, and we launched on time. The key was staying calm, narrowing the problem space quickly, and communicating clearly with stakeholders throughout.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000),
      },
    ],
  });
  console.log(`✅ Created ${transcripts.count} transcripts for ended session`);

  // ─── Active Interview Session ────────────────────────────────────────────
  const activeSession = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      title: "Full-Stack Engineer Interview",
      jobTitle: "Staff Engineer",
      company: "Linear",
      status: SessionStatus.ACTIVE,
      duration: 0,
      createdAt: new Date(),
    },
  });
  console.log(`✅ Created active session: ${activeSession.title} (${activeSession.id})`);

  // ─── Second ended session (older) ────────────────────────────────────────
  const olderSession = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      title: "Backend Engineer Interview",
      jobTitle: "Senior Backend Engineer",
      company: "Stripe",
      status: SessionStatus.ENDED,
      duration: 3600,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 3600 * 1000),
    },
  });
  console.log(`✅ Created older session: ${olderSession.title} (${olderSession.id})`);

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!\n");
  console.log("  User:     dev@whisprly.ai");
  console.log("  Sessions: 3 (1 active, 2 ended)");
  console.log("  Resume:   1 active");
  console.log("  Transcripts: 3\n");
  console.log("  Sign in at http://localhost:3000 using the magic link with dev@whisprly.ai");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
